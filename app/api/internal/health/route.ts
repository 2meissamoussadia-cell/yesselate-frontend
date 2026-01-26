// app/api/internal/health/route.ts
// Phase P4: Health check interne basique
// Phase P13: Extension avec rôle DB et replication lag
import { NextResponse } from 'next/server';
import { pgPool } from '@/lib/server/db/pool';

/**
 * GET /api/internal/health
 * 
 * Health check interne simplifié pour monitoring
 * Phase P4: Observabilité & Robustesse
 * Phase P13: Résilience & DR - Extension avec réplication et rôle DB
 */
export async function GET() {
  const client = await pgPool.connect();
  try {
    await client.query('select 1'); // ping

    // Phase P13: Rôle et lag (si vues/permissions disponibles)
    const roleRes = await client.query(`select pg_is_in_recovery() as standby`);
    const isStandby = !!roleRes.rows[0]?.standby;

    // Phase P13: Lag indicatif (si standby) - sinon 0
    let replayLagSec = 0;
    if (isStandby) {
      const lagRes = await client.query(`
        select extract(epoch from now() - pg_last_xact_replay_timestamp())::int as lag_sec
      `);
      replayLagSec = Number(lagRes.rows[0]?.lag_sec ?? 0);
    }

    // Phase P4: Staleness MViews (déjà posée en P4)
    const { rows: mviews } = await client.query(`
      select view_name, refreshed_at, now() - refreshed_at as age
      from mview_refresh_log
      order by refreshed_at desc
      limit 10
    `);

    return NextResponse.json({
      ok: true,
      db: { role: isStandby ? 'standby' : 'primary', replayLagSec },
      mviews
    }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}
