// app/api/alerts/test/route.ts
// Phase P15: Moteur d'alertes - Test d'évaluation de règle (dry-run)

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { evaluateRule } from '@/lib/server/dashboard/alerting/evaluator';
import { evaluateRuleV2, type RuleV2 } from '@/lib/server/dashboard/alerting/evaluator_v2';
import { AlertRule } from '@/lib/server/dashboard/alerting/types';
import { z } from 'zod';
import { withReq } from '@/lib/server/logging';
import { AlertDSLv2Schema, HysteresisSchema, GroupBySchema, CorrelationSchema } from '@/lib/server/dashboard/alerting/schemas';
import { enforceQuota, recordUsage } from '@lib-root/server/finops';

const log = withReq('alerts-test');

// Schema de validation pour test (même que création mais sans id/tenant, support v1 + v2)
const AlertRuleTestSchema = z.object({
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
 * POST /api/alerts/test
 * 
 * Évalue une règle d'alerte en mode dry-run (sans créer d'événements)
 * 
 * Body: Règle d'alerte (même format que POST /api/alerts/rules)
 * 
 * Guards: alerts:admin
 * 
 * Retourne les incidents détectés sans les créer en base
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting strict pour test (peut être coûteux)
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:test:${ip}`, 10, 0.2);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '300', 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  }

  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    // Guard: alerts:admin (test nécessite des permissions élevées)
    if (!can(ctx, { perm: 'alerts:admin' })) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ seconds, error: 'Forbidden: alerts:admin required' }, 'alerts test forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Phase P16: FinOps — vérifier quota avant test (opération coûteuse)
    const quotaCheck = await enforceQuota({
      tenantId: ctx.tenantId,
      scope: 'route:/api/alerts/test',
      estimatedRows: 1000, // estimation conservatrice
      estimatedBytes: 100 * 1024, // 100 KB
    });
    if (!quotaCheck.allowed) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.warn({ reason: quotaCheck.reason, seconds }, 'alerts test quota exceeded');
      return NextResponse.json(
        { error: 'Quota exceeded', reason: quotaCheck.reason, ok: false },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = AlertRuleTestSchema.parse(body);

    let incidents: Array<{ fingerprint: string; payload: Record<string, any>; labels: Record<string, any> }> = [];
    let ruleInfo: any = {};

    // Phase P17: Support v1 et v2
    if (validated.expr_v2) {
      // Évaluer avec v2
      const testRuleV2: RuleV2 = {
        id: 'test-' + Date.now(),
        tenant_id: ctx.tenantId,
        severity: validated.severity,
        expr_v2: validated.expr_v2,
        hysteresis: validated.hysteresis,
        group_by: validated.group_by,
        correlation: validated.correlation,
        labels: validated.labels,
        cooldown_sec: validated.cooldownSec,
        reopen_after_sec: validated.reopenAfterSec,
      };

      const results = await evaluateRuleV2(testRuleV2, {
        tenantId: ctx.tenantId,
        ruleId: testRuleV2.id,
      });

      incidents = results.map(r => ({
        fingerprint: r.fingerprint,
        payload: r.payload,
        labels: r.labels,
      }));

      ruleInfo = {
        name: validated.name,
        severity: validated.severity,
        expr_v2: validated.expr_v2,
        hysteresis: validated.hysteresis,
        group_by: validated.group_by,
        correlation: validated.correlation,
      };
    } else if (validated.expr) {
      // Évaluer avec v1
      const testRule: AlertRule = {
        id: 'test-' + Date.now(),
        tenantId: ctx.tenantId,
        name: validated.name,
        description: validated.description,
        severity: validated.severity,
        enabled: validated.enabled,
        routeKey: validated.routeKey,
        labels: validated.labels,
        expr: validated.expr,
        cooldownSec: validated.cooldownSec,
        reopenAfterSec: validated.reopenAfterSec,
        schedule: validated.schedule,
        defaultChannels: validated.defaultChannels,
      };

      incidents = await evaluateRule(testRule, ctx.tenantId);

      ruleInfo = {
        name: testRule.name,
        severity: testRule.severity,
        expr: testRule.expr,
      };
    }

    // Phase P16: FinOps — enregistrer usage
    await recordUsage({
      tenantId: ctx.tenantId,
      scope: 'route:/api/alerts/test',
      rows: incidents.length,
      bytes: JSON.stringify(incidents).length,
    });

    const seconds = (performance.now() - t0) / 1000;
    logReq.info({ incidentCount: incidents.length, seconds, version: validated.expr_v2 ? 'v2' : 'v1' }, 'alerts rule tested');

    return NextResponse.json({
      ok: true,
      rule: ruleInfo,
      incidents,
      summary: {
        total: incidents.length,
        triggered: incidents.length > 0,
      },
    }, { status: 200 });
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    if (error instanceof z.ZodError) {
      logReq.warn({ err: error.errors, seconds }, 'alerts test validation error');
      return NextResponse.json(
        { error: 'Validation error', details: error.errors, ok: false },
        { status: 400 }
      );
    }
    logReq.error({ err: error, seconds }, 'alerts test error');
    return NextResponse.json(
      { 
        error: 'Failed to test rule', 
        message: error instanceof Error ? error.message : 'Unknown error',
        ok: false 
      },
      { status: 500 }
    );
  }
}
