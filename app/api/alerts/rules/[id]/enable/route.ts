// app/api/alerts/rules/[id]/enable/route.ts
// Phase P15: Moteur d'alertes - API REST pour activer/désactiver une règle

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { pgPool } from '@/lib/server/db/pool';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { withReq } from '@/lib/server/logging';

const log = withReq('alerts-rules-enable');

/**
 * PATCH /api/alerts/rules/[id]/enable
 * Activer ou désactiver une règle d'alerte
 * 
 * Body: { enabled: boolean }
 * 
 * Guards: alerts:admin
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:rules:enable:${ip}`, 60, 1);
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
      logReq.info({ seconds, error: 'Forbidden: alerts:admin required' }, 'alerts rule enable forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const ruleId = resolvedParams.id;
    const body = await req.json();
    const enabled = body.enabled;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean', ok: false },
        { status: 400 }
      );
    }

    const client = await pgPool.connect();
    try {
      const result = await client.query(
        `UPDATE alert_rules
         SET enabled = $1, updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING *`,
        [enabled, ruleId, ctx.tenantId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Rule not found', ok: false },
          { status: 404 }
        );
      }

      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ ruleId, enabled, seconds }, 'alerts rule enabled/disabled');

      return NextResponse.json({
        ok: true,
        rule: {
          id: result.rows[0].id,
          enabled: result.rows[0].enabled,
          updatedAt: result.rows[0].updated_at,
        },
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'alerts rule enable error');
    return NextResponse.json(
      { error: 'Failed to update rule', ok: false },
      { status: 500 }
    );
  }
}
