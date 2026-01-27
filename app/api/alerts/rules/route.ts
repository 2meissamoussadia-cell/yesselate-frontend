// app/api/alerts/rules/route.ts
// Phase P15: Moteur d'alertes - API REST pour règles (CRUD)

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { hydrateContext } from '@lib-root/server/dashboard/context_ext';
import { can } from '@lib-root/server/security/policy';
import { pgPool } from '@lib-root/server/db/pool';
import { rateLimitRedis } from '@lib-root/server/observability/rateLimitRedis';
import { z } from 'zod';
import { withReq } from '@lib-root/server/logging';
import { AlertDSLv2Schema, HysteresisSchema, GroupBySchema, CorrelationSchema } from '@lib-root/server/dashboard/alerting/schemas';

const log = withReq('alerts-rules');

// Schema de validation pour création/mise à jour (v1 + v2)
const AlertRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']).default('warning'),
  enabled: z.boolean().default(true),
  routeKey: z.string().optional(),
  labels: z.record(z.any()).optional(),
  expr: z.object({
    source: z.object({
      view: z.string().optional(),
      query: z.string().optional(),
      params: z.array(z.string()).optional(),
    }),
    select: z.object({
      metric: z.string(),
    }),
    where: z.array(z.object({
      col: z.string(),
      op: z.enum(['=', '!=', '>', '>=', '<', '<=', 'IN', 'LIKE', 'ILIKE']),
      val: z.any(),
    })).optional(),
    condition: z.object({
      op: z.enum(['>', '>=', '<', '<=', '=', '!=']),
      left: z.string(),
      right: z.union([z.number(), z.string()]),
    }),
    groupBy: z.array(z.string()).optional(),
  }),
  // Phase P17: Support expr_v2
  expr_v2: AlertDSLv2Schema.optional(),
  hysteresis: HysteresisSchema.optional(),
  group_by: GroupBySchema.optional(),
  correlation: CorrelationSchema.optional(),
  cooldownSec: z.number().int().min(0).default(600),
  reopenAfterSec: z.number().int().min(0).default(3600),
  schedule: z.object({
    mute: z.object({
      start: z.string(),
      end: z.string(),
      tz: z.string(),
      weekends: z.boolean().optional(),
    }).optional(),
  }).optional(),
  defaultChannels: z.record(z.boolean()).optional(),
}).refine(
  (data) => data.expr || data.expr_v2,
  { message: 'Either expr (v1) or expr_v2 (v2) must be provided' }
);

/**
 * GET /api/alerts/rules
 * Liste des règles d'alerte pour le tenant
 * 
 * Query params:
 * - enabled: 'true' | 'false' | 'all' (défaut: 'all')
 * - routeKey: filtrer par route_key
 * - severity: filtrer par sévérité
 * 
 * Guards: alerts:view
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:rules:${ip}`, 120, 2);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  }

  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    // Guard: alerts:view
    if (!can(ctx, { perm: 'alerts:view' })) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ seconds, error: 'Forbidden: alerts:view required' }, 'alerts rules forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const enabledParam = url.searchParams.get('enabled') || 'all';
    const routeKey = url.searchParams.get('routeKey');
    const severity = url.searchParams.get('severity');

    const client = await pgPool.connect();
    try {
      let query = `
        SELECT 
          id, tenant_id, name, description, severity, enabled,
          route_key, labels, expr, expr_v2, hysteresis, group_by, correlation,
          cooldown_sec, reopen_after_sec,
          schedule, default_channels, created_at, updated_at
        FROM alert_rules
        WHERE tenant_id = $1
      `;
      const params: any[] = [ctx.tenantId];
      let paramIndex = 2;

      // Filtre enabled
      if (enabledParam === 'true') {
        query += ` AND enabled = true`;
      } else if (enabledParam === 'false') {
        query += ` AND enabled = false`;
      }

      // Filtre routeKey
      if (routeKey) {
        query += ` AND route_key = $${paramIndex}`;
        params.push(routeKey);
        paramIndex++;
      }

      // Filtre severity
      if (severity) {
        query += ` AND severity = $${paramIndex}`;
        params.push(severity);
        paramIndex++;
      }

      // ABAC: Filtrage par bureau/chantier via labels si présent
      if (ctx.scopes && ctx.scopes.length > 0) {
        const bureauScopes = ctx.scopes.filter(s => s.startsWith('bureau:'));
        const chantierScopes = ctx.scopes.filter(s => s.startsWith('chantier:'));
        
        if (bureauScopes.length > 0 || chantierScopes.length > 0) {
          const labelConditions: string[] = [];
          if (bureauScopes.length > 0) {
            const bureaux = bureauScopes.map(s => s.split(':')[1]);
            labelConditions.push(`(labels->>'bureau') = ANY($${paramIndex}::text[])`);
            params.push(bureaux);
            paramIndex++;
          }
          if (chantierScopes.length > 0) {
            const chantiers = chantierScopes.map(s => s.split(':')[1]);
            labelConditions.push(`(labels->>'chantier') = ANY($${paramIndex}::text[])`);
            params.push(chantiers);
            paramIndex++;
          }
          if (labelConditions.length > 0) {
            query += ` AND (${labelConditions.join(' OR ')} OR labels IS NULL)`;
          }
        }
      }

      query += ` ORDER BY created_at DESC`;

      const result = await client.query(query, params);

      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ count: result.rows.length, seconds }, 'alerts rules fetched');

      return NextResponse.json({
        ok: true,
        rules: result.rows.map(mapRuleToResponse),
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'alerts rules error');
    return NextResponse.json(
      { error: 'Failed to fetch rules', ok: false },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/rules
 * Créer une nouvelle règle d'alerte (JSON DSL)
 * 
 * Guards: alerts:admin
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting plus strict pour création
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:rules:create:${ip}`, 20, 0.5);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '120', 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  }

  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    // Guard: alerts:admin
    if (!can(ctx, { perm: 'alerts:admin' })) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ seconds, error: 'Forbidden: alerts:admin required' }, 'alerts rules create forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validated = AlertRuleSchema.parse(body);

    const client = await pgPool.connect();
    try {
      const result = await client.query(
        `INSERT INTO alert_rules (
          tenant_id, name, description, severity, enabled,
          route_key, labels, expr, expr_v2, hysteresis, group_by, correlation,
          cooldown_sec, reopen_after_sec,
          schedule, default_channels
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          ctx.tenantId,
          validated.name,
          validated.description || null,
          validated.severity,
          validated.enabled,
          validated.routeKey || null,
          validated.labels ? JSON.stringify(validated.labels) : null,
          validated.expr ? JSON.stringify(validated.expr) : null,
          validated.expr_v2 ? JSON.stringify(validated.expr_v2) : null,
          validated.hysteresis ? JSON.stringify(validated.hysteresis) : null,
          validated.group_by ? JSON.stringify(validated.group_by) : null,
          validated.correlation ? JSON.stringify(validated.correlation) : null,
          validated.cooldownSec,
          validated.reopenAfterSec,
          validated.schedule ? JSON.stringify(validated.schedule) : null,
          validated.defaultChannels ? JSON.stringify(validated.defaultChannels) : null,
        ]
      );

      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ ruleId: result.rows[0].id, seconds }, 'alerts rule created');

      return NextResponse.json({
        ok: true,
        rule: mapRuleToResponse(result.rows[0]),
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    if (error instanceof z.ZodError) {
      logReq.warn({ err: error.errors, seconds }, 'alerts rule validation error');
      return NextResponse.json(
        { error: 'Validation error', details: error.errors, ok: false },
        { status: 400 }
      );
    }
    logReq.error({ err: error, seconds }, 'alerts rule create error');
    return NextResponse.json(
      { error: 'Failed to create rule', ok: false },
      { status: 500 }
    );
  }
}

/**
 * Mappe une row DB vers la réponse API
 */
function mapRuleToResponse(row: any) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    severity: row.severity,
    enabled: row.enabled,
    routeKey: row.route_key,
    labels: row.labels,
    expr: row.expr, // v1
    expr_v2: row.expr_v2, // v2 (Phase P17)
    hysteresis: row.hysteresis, // Phase P17
    group_by: row.group_by, // Phase P17
    correlation: row.correlation, // Phase P17
    cooldownSec: row.cooldown_sec,
    reopenAfterSec: row.reopen_after_sec,
    schedule: row.schedule,
    defaultChannels: row.default_channels,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
