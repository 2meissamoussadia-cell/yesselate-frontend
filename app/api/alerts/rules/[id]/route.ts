// app/api/alerts/rules/[id]/route.ts
// Phase P15: Moteur d'alertes - API REST pour mise à jour de règle

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { hydrateContext } from '@lib-root/server/dashboard/context_ext';
import { can } from '@lib-root/server/security/policy';
import { pgPool } from '@lib-root/server/db/pool';
import { rateLimitRedis } from '@lib-root/server/observability/rateLimitRedis';
import { z } from 'zod';
import { withReq } from '@lib-root/server/logging';
import { AlertDSLv2Schema, HysteresisSchema, GroupBySchema, CorrelationSchema } from '@lib-root/server/dashboard/alerting/schemas';

const log = withReq('alerts-rules-update');

// Schema de validation pour mise à jour (tous les champs optionnels sauf ceux requis)
const AlertRuleUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  enabled: z.boolean().optional(),
  routeKey: z.string().optional(),
  labels: z.record(z.string(), z.any()).optional(),
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
  }).optional(),
  // Phase P17: Support expr_v2
  expr_v2: AlertDSLv2Schema.optional(),
  hysteresis: HysteresisSchema.optional(),
  group_by: GroupBySchema.optional(),
  correlation: CorrelationSchema.optional(),
  cooldownSec: z.number().int().min(0).optional(),
  reopenAfterSec: z.number().int().min(0).optional(),
  schedule: z.object({
    mute: z.object({
      start: z.string(),
      end: z.string(),
      tz: z.string(),
      weekends: z.boolean().optional(),
    }).optional(),
  }).optional(),
  defaultChannels: z.record(z.string(), z.boolean()).optional(),
});

/**
 * PUT /api/alerts/rules/[id]
 * Mettre à jour une règle d'alerte
 * 
 * Guards: alerts:admin
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:rules:update:${ip}`, 30, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  }

  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    // Guard: alerts:admin
    if (!can(ctx, { perm: 'alerts:admin' })) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ seconds, error: 'Forbidden: alerts:admin required' }, 'alerts rule update forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const ruleId = resolvedParams.id;
    const body = await req.json();
    const validated = AlertRuleUpdateSchema.parse(body);

    const client = await pgPool.connect();
    try {
      // Vérifier que la règle existe et appartient au tenant
      const checkResult = await client.query(
        `SELECT id FROM alert_rules WHERE id = $1 AND tenant_id = $2`,
        [ruleId, ctx.tenantId]
      );

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Rule not found', ok: false },
          { status: 404 }
        );
      }

      // Construire la requête UPDATE dynamiquement
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (validated.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(validated.name);
      }
      if (validated.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(validated.description || null);
      }
      if (validated.severity !== undefined) {
        updates.push(`severity = $${paramIndex++}`);
        values.push(validated.severity);
      }
      if (validated.enabled !== undefined) {
        updates.push(`enabled = $${paramIndex++}`);
        values.push(validated.enabled);
      }
      if (validated.routeKey !== undefined) {
        updates.push(`route_key = $${paramIndex++}`);
        values.push(validated.routeKey || null);
      }
      if (validated.labels !== undefined) {
        updates.push(`labels = $${paramIndex++}`);
        values.push(validated.labels ? JSON.stringify(validated.labels) : null);
      }
      if (validated.expr !== undefined) {
        updates.push(`expr = $${paramIndex++}`);
        values.push(JSON.stringify(validated.expr));
      }
      if (validated.expr_v2 !== undefined) {
        updates.push(`expr_v2 = $${paramIndex++}`);
        values.push(validated.expr_v2 ? JSON.stringify(validated.expr_v2) : null);
      }
      if (validated.hysteresis !== undefined) {
        updates.push(`hysteresis = $${paramIndex++}`);
        values.push(validated.hysteresis ? JSON.stringify(validated.hysteresis) : null);
      }
      if (validated.group_by !== undefined) {
        updates.push(`group_by = $${paramIndex++}`);
        values.push(validated.group_by ? JSON.stringify(validated.group_by) : null);
      }
      if (validated.correlation !== undefined) {
        updates.push(`correlation = $${paramIndex++}`);
        values.push(validated.correlation ? JSON.stringify(validated.correlation) : null);
      }
      if (validated.cooldownSec !== undefined) {
        updates.push(`cooldown_sec = $${paramIndex++}`);
        values.push(validated.cooldownSec);
      }
      if (validated.reopenAfterSec !== undefined) {
        updates.push(`reopen_after_sec = $${paramIndex++}`);
        values.push(validated.reopenAfterSec);
      }
      if (validated.schedule !== undefined) {
        updates.push(`schedule = $${paramIndex++}`);
        values.push(validated.schedule ? JSON.stringify(validated.schedule) : null);
      }
      if (validated.defaultChannels !== undefined) {
        updates.push(`default_channels = $${paramIndex++}`);
        values.push(validated.defaultChannels ? JSON.stringify(validated.defaultChannels) : null);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update', ok: false },
          { status: 400 }
        );
      }

      updates.push(`updated_at = NOW()`);
      values.push(ruleId, ctx.tenantId);

      const result = await client.query(
        `UPDATE alert_rules
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Rule not found', ok: false },
          { status: 404 }
        );
      }

      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ ruleId, seconds }, 'alerts rule updated');

      return NextResponse.json({
        ok: true,
        rule: mapRuleToResponse(result.rows[0]),
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    if (error instanceof z.ZodError) {
      logReq.warn({ err: error.issues, seconds }, 'alerts rule validation error');
      return NextResponse.json(
        { error: 'Validation error', details: error.issues, ok: false },
        { status: 400 }
      );
    }
    logReq.error({ err: error, seconds }, 'alerts rule update error');
    return NextResponse.json(
      { error: 'Failed to update rule', ok: false },
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
