/**
 * P20 – Ops & Remédiations : helpers Redis
 * Purge / warm ciblés (rate-limit, FinOps, cache dashboard).
 */

import Redis from 'ioredis';

let opsRedis: Redis | null = null;

export function getOpsRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!opsRedis) {
    opsRedis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (t) => Math.min(t * 50, 2000),
      lazyConnect: true,
    });
    opsRedis.on('error', (err) => {
      console.error('[Ops Redis] Connection error:', err);
    });
  }
  return opsRedis;
}

/**
 * Purge les clés correspondant au motif (ex: cache:dashboard:*).
 * Limité à 10_000 clés par défaut.
 */
export async function purgeKeys(
  pattern: string,
  limit: number = 10_000
): Promise<{ deleted: number }> {
  const redis = getOpsRedis();
  if (!redis) return { deleted: 0 };

  const keys = await redis.keys(pattern);
  const toDel = keys.slice(0, limit);
  if (toDel.length === 0) return { deleted: 0 };
  await redis.del(...toDel);
  return { deleted: toDel.length };
}

/**
 * Warm ciblé : précharge des clés (ex: cache dashboard).
 * Implémentation type : HTTP GET sur routes clés ou SET de valeurs par défaut.
 * Ici on expose un helper générique ; le contenu métier est dans cronWarmDashboard.
 */
export async function warmKeys(
  keys: Array<{ key: string; value: string; ttlSeconds?: number }>
): Promise<{ warmed: number }> {
  const redis = getOpsRedis();
  if (!redis) return { warmed: 0 };

  let warmed = 0;
  for (const { key, value, ttlSeconds } of keys) {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
    warmed += 1;
  }
  return { warmed };
}

export async function closeOpsRedis(): Promise<void> {
  if (opsRedis) {
    await opsRedis.quit();
    opsRedis = null;
  }
}
