/**
 * P20 – Warm caches dashboard (matinal / after-failover)
 * Usage: npx tsx jobs/cronWarmDashboard.ts
 *
 * Préchauffe les clés Redis utiles au dashboard (rate-limit, cache métier si utilisé).
 * À lancer en CRON matinal ou après un failover DB/PgBouncer.
 */

import { getOpsRedis } from '@lib-root/server/ops';

async function main() {
  const redis = getOpsRedis();
  if (!redis) {
    console.warn('[cronWarmDashboard] REDIS_URL absent, skip.');
    process.exit(0);
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const warmed: string[] = [];

  try {
    // Option 1: marqueur "warm" pour invalidation ultérieure
    await redis.setex('ops:dashboard:warm:ts', 86400, String(Date.now()));
    warmed.push('ops:dashboard:warm:ts');

    // Option 2: précharge HTTP des routes clés (si sidecar/cache HTTP)
    const routes = ['/api/dashboard/overview/summary/dashboard', '/api/health'];
    for (const r of routes) {
      try {
        const res = await fetch(`${base}${r}`, { headers: { 'x-warm': '1' } });
        if (res.ok) warmed.push(`fetch:${r}`);
      } catch {
        /* ignore */
      }
    }

    console.log('[cronWarmDashboard] warmed:', warmed);
    process.exit(0);
  } catch (e) {
    console.error('[cronWarmDashboard]', e);
    process.exit(1);
  }
}

main();
