// app/api/alerts/stats/route.ts
// Phase P15: Moteur d'alertes - API statistiques d'alertes

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { pgPool } from '@/lib/server/db/pool';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { withReq } from '@/lib/server/logging';

const log = withReq('alerts-stats');

/**
 * GET /api/alerts/stats
 * 
 * Récupère les statistiques d'alertes pour le tenant
 * 
 * Query params:
 * - routeKey: filtrer par route_key
 * 
 * Guards: alerts:view
 * Phase P15: Moteur d'alertes
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:stats:${ip}`, 120, 2);
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
      logReq.info({ seconds, error: 'Forbidden: alerts:view required' }, 'alerts stats forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const routeKey = url.searchParams.get('routeKey');

    const client = await pgPool.connect();
    try {
      let query = `
        SELECT 
          COUNT(*) FILTER (WHERE e.status = 'open') AS open_count,
          COUNT(*) FILTER (WHERE e.status = 'ack') AS ack_count,
          COUNT(*) FILTER (WHERE e.status = 'closed') AS closed_count,
          COUNT(*) FILTER (WHERE e.status = 'open' AND r.severity = 'critical') AS critical_open,
          COUNT(*) FILTER (WHERE e.status = 'open' AND r.severity = 'warning') AS warning_open,
          COUNT(*) FILTER (WHERE e.status = 'open' AND r.severity = 'info') AS info_open
        FROM alert_events e
        JOIN alert_rules r ON e.rule_id = r.id
        WHERE e.tenant_id = $1
      `;
      const params: any[] = [ctx.tenantId];
      let paramIndex = 2;

      // Filtre routeKey
      if (routeKey) {
        query += ` AND r.route_key = $${paramIndex}`;
        params.push(routeKey);
        paramIndex++;
      }

      // ABAC: Filtrage par bureau/chantier via labels
      if (ctx.scopes && ctx.scopes.length > 0) {
        const bureauScopes = ctx.scopes.filter(s => s.startsWith('bureau:'));
        const chantierScopes = ctx.scopes.filter(s => s.startsWith('chantier:'));
        
        if (bureauScopes.length > 0 || chantierScopes.length > 0) {
          const labelConditions: string[] = [];
          if (bureauScopes.length > 0) {
            const bureaux = bureauScopes.map(s => s.split(':')[1]);
            labelConditions.push(`(e.labels->>'bureau') = ANY($${paramIndex}::text[])`);
            params.push(bureaux);
            paramIndex++;
          }
          if (chantierScopes.length > 0) {
            const chantiers = chantierScopes.map(s => s.split(':')[1]);
            labelConditions.push(`(e.labels->>'chantier') = ANY($${paramIndex}::text[])`);
            params.push(chantiers);
            paramIndex++;
          }
          if (labelConditions.length > 0) {
            query += ` AND (${labelConditions.join(' OR ')} OR e.labels IS NULL)`;
          }
        }
      }

      const result = await client.query(query, params);
      const row = result.rows[0];

      const stats = {
        open_count: parseInt(row.open_count || '0', 10),
        ack_count: parseInt(row.ack_count || '0', 10),
        closed_count: parseInt(row.closed_count || '0', 10),
        critical_open: parseInt(row.critical_open || '0', 10),
        warning_open: parseInt(row.warning_open || '0', 10),
        info_open: parseInt(row.info_open || '0', 10),
      };

      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ stats, seconds }, 'alerts stats fetched');

      return NextResponse.json({
        ok: true,
        stats,
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'alerts stats error');
    return NextResponse.json(
      { error: 'Failed to fetch alert stats', ok: false },
      { status: 500 }
    );
  }
}
