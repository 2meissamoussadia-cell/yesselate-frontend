// app/api/alerts/events/[id]/ack/route.ts
// Phase P15: Moteur d'alertes - ACK d'un événement

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { pgPool } from '@/lib/server/db/pool';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { withReq } from '@/lib/server/logging';

const log = withReq('alerts-events-ack');

/**
 * POST /api/alerts/events/[id]/ack
 * 
 * Acknowledge un événement d'alerte
 * Phase P15: Moteur d'alertes
 * 
 * Guards: alerts:view (peut ACK ses propres alertes) ou alerts:admin
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:events:ack:${ip}`, 60, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  }

  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    // Guard: alerts:view minimum, alerts:admin peut ACK toutes les alertes
    if (!can(ctx, { perm: 'alerts:view' })) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ seconds, error: 'Forbidden: alerts:view required' }, 'alerts event ack forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    
    const client = await pgPool.connect();
    try {
      // Vérifier que l'événement existe et appartient au tenant
      const checkResult = await client.query(
        `SELECT e.*, r.labels AS rule_labels
         FROM alert_events e
         JOIN alert_rules r ON e.rule_id = r.id
         WHERE e.id = $1 AND e.tenant_id = $2`,
        [eventId, ctx.tenantId]
      );

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Event not found', ok: false },
          { status: 404 }
        );
      }

      const event = checkResult.rows[0];
      const isAdmin = can(ctx, { perm: 'alerts:admin' });

      // ABAC: Vérifier que l'utilisateur peut ACK cet événement
      // Si admin, peut tout ACK. Sinon, vérifier les scopes bureau/chantier
      if (!isAdmin && ctx.scopes && ctx.scopes.length > 0) {
        const eventLabels = event.labels || event.rule_labels || {};
        const bureauScopes = ctx.scopes.filter(s => s.startsWith('bureau:')).map(s => s.split(':')[1]);
        const chantierScopes = ctx.scopes.filter(s => s.startsWith('chantier:')).map(s => s.split(':')[1]);
        
        const eventBureau = eventLabels.bureau;
        const eventChantier = eventLabels.chantier;
        
        const canAccess = 
          (!eventBureau || bureauScopes.includes(eventBureau)) &&
          (!eventChantier || chantierScopes.includes(eventChantier));
        
        if (!canAccess) {
          const seconds = (performance.now() - t0) / 1000;
          logReq.info({ seconds, error: 'Forbidden: ABAC scope mismatch' }, 'alerts event ack forbidden');
          return NextResponse.json({ error: 'Forbidden: insufficient scope' }, { status: 403 });
        }
      }

      // Phase P17: Utiliser acked_at/acked_by (colonnes v2)
      const result = await client.query(
        `UPDATE alert_events
         SET status = 'ack',
             acknowledged_at = NOW(),
             acknowledged_by = $1,
             acked_at = NOW(),
             acked_by = $1
         WHERE id = $2 AND tenant_id = $3 AND status = 'open'
         RETURNING *`,
        [ctx.userId || 'system', eventId, ctx.tenantId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Event not found or already acknowledged', ok: false },
          { status: 404 }
        );
      }
      
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ eventId, seconds }, 'alerts event acknowledged');
      
      return NextResponse.json({
        ok: true,
        event: mapEvent(result.rows[0]),
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'alerts event ack error');
    return NextResponse.json(
      { error: 'Failed to acknowledge event', ok: false },
      { status: 500 }
    );
  }
}

function mapEvent(row: any) {
  return {
    id: row.id,
    ruleId: row.rule_id,
    status: row.status,
    acknowledgedAt: row.acknowledged_at || row.acked_at, // Phase P17: support v2
    acknowledgedBy: row.acknowledged_by || row.acked_by, // Phase P17: support v2
    ackedAt: row.acked_at, // Phase P17
    ackedBy: row.acked_by, // Phase P17
  };
}
