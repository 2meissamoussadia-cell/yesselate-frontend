// app/api/alerts/events/route.ts
// Phase P15: Moteur d'alertes - API événements

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { pgPool } from '@/lib/server/db/pool';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { withReq } from '@/lib/server/logging';

const log = withReq('alerts-events');

/**
 * GET /api/alerts/events
 * 
 * Récupère les alertes actives pour le tenant avec filtres ABAC
 * 
 * Query params:
 * - status: 'open' | 'ack' | 'closed' | 'all' (défaut: 'open')
 * - routeKey: filtrer par route_key
 * - severity: filtrer par sévérité
 * - limit: nombre max de résultats (défaut: 100)
 * - offset: pagination (défaut: 0)
 * 
 * Guards: alerts:view
 * ABAC: Filtrage par bureau/chantier via labels
 * Phase P15: Moteur d'alertes
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const logReq = log.child({ reqId });

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`alerts:events:${ip}`, 240, 4);
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
      logReq.info({ seconds, error: 'Forbidden: alerts:view required' }, 'alerts events forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status') || 'open';
    const routeKey = url.searchParams.get('routeKey');
    const severity = url.searchParams.get('severity');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    
    const client = await pgPool.connect();
    try {
      let query = `
        SELECT 
          e.*,
          r.name AS rule_name,
          r.severity,
          r.description AS rule_description,
          r.route_key AS rule_route_key
        FROM alert_events e
        JOIN alert_rules r ON e.rule_id = r.id
        WHERE e.tenant_id = $1
      `;
      const params: any[] = [ctx.tenantId];
      let paramIndex = 2;

      // Filtre status
      if (statusParam !== 'all') {
        query += ` AND e.status = $${paramIndex}`;
        params.push(statusParam);
        paramIndex++;
      }
      
      // Filtre routeKey
      if (routeKey) {
        query += ` AND r.route_key = $${paramIndex}`;
        params.push(routeKey);
        paramIndex++;
      }

      // Filtre severity
      if (severity) {
        query += ` AND r.severity = $${paramIndex}`;
        params.push(severity);
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
      
      // Compter le total avant pagination
      const countQuery = query.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) FROM');
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count, 10);

      query += ` ORDER BY e.last_seen DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await client.query(query, params);
      
      const seconds = (performance.now() - t0) / 1000;
      logReq.info({ count: result.rows.length, total, seconds }, 'alerts events fetched');
      
      return NextResponse.json({
        ok: true,
        events: result.rows.map(mapEvent),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'alerts events error');
    return NextResponse.json(
      { error: 'Failed to fetch alerts', ok: false },
      { status: 500 }
    );
  }
}

function mapEvent(row: any) {
  return {
    id: row.id,
    ruleId: row.rule_id,
    ruleName: row.rule_name,
    severity: row.severity,
    status: row.status,
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    count: row.count,
    payload: row.payload,
    labels: row.labels,
  };
}
