// app/api/alerts/events/[id]/snooze/route.ts
// Phase P17: Moteur d'alertes avancé - Snooze (reporter) un événement

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { pgPool } from '@/lib/server/db/pool';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { withReq } from '@/lib/server/logging';

const log = withReq('alerts-events-snooze');

/**
 * POST /api/alerts/events/[id]/snooze
 * 
 * Snooze (reporter) un événement d'alerte en créant un silence temporaire
 * Phase P17: Moteur d'alertes avancé
 * 
 * Body: { durationMinutes: number } (15, 30, 60, 120, 240, 480)
 * 
 * Guards: alerts:view (peut snooze ses propres alertes) ou alerts:admin
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
  const rl = await rateLimitRedis(`alerts:events:snooze:${ip}`, 60, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  }

  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    // Guard: alerts:view minimum, alerts:admin peut snooze toutes les alertes
    if (!can(ctx, { perm: 'alerts:view' })) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ seconds, error: 'Forbidden: alerts:view required' }, 'alerts event snooze forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    
    // Parse body
    const body = await req.json().catch(() => ({}));
    const durationMinutes = Number(body.durationMinutes) || 60;
    
    // Valider la durée (15, 30, 60, 120, 240, 480 minutes)
    const allowedDurations = [15, 30, 60, 120, 240, 480];
    if (!allowedDurations.includes(durationMinutes)) {
      return NextResponse.json(
        { error: 'Invalid duration. Allowed: 15, 30, 60, 120, 240, 480 minutes', ok: false },
        { status: 400 }
      );
    }
    
    const client = await pgPool.connect();
    try {
      // Vérifier que l'événement existe et appartient au tenant
      const checkResult = await client.query(
        `SELECT e.*, r.id AS rule_id, r.labels AS rule_labels
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

      // ABAC: Vérifier que l'utilisateur peut snooze cet événement
      // Si admin, peut tout snooze. Sinon, vérifier les scopes bureau/chantier
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
          logReq.info({ seconds, error: 'Forbidden: ABAC scope mismatch' }, 'alerts event snooze forbidden');
          return NextResponse.json({ error: 'Forbidden: insufficient scope' }, { status: 403 });
        }
      }

      // Créer un silence de type "snooze" pour cet événement
      // Le matcher correspond à l'événement (rule_id + labels si présents)
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
      
      const matcher: any = { rule_id: event.rule_id };
      if (event.labels) {
        matcher.labels = event.labels;
      }

      const silenceResult = await client.query(
        `INSERT INTO alert_silences (
          tenant_id, rule_id, matcher, kind, starts_at, ends_at, created_by, reason
        ) VALUES ($1, $2, $3, 'snooze', $4, $5, $6, $7)
        RETURNING *`,
        [
          ctx.tenantId,
          event.rule_id,
          JSON.stringify(matcher),
          startsAt.toISOString(),
          endsAt.toISOString(),
          ctx.userId || 'system',
          `Snoozed by user for ${durationMinutes} minutes`
        ]
      );
      
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ eventId, durationMinutes, silenceId: silenceResult.rows[0].id, seconds }, 'alerts event snoozed');
      
      return NextResponse.json({
        ok: true,
        silence: {
          id: silenceResult.rows[0].id,
          startsAt: silenceResult.rows[0].starts_at,
          endsAt: silenceResult.rows[0].ends_at,
          durationMinutes,
        },
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'alerts event snooze error');
    return NextResponse.json(
      { error: 'Failed to snooze event', ok: false },
      { status: 500 }
    );
  }
}
