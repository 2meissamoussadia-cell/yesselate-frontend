// lib/server/finops/redis.ts
// Phase P16: FinOps — client Redis partagé (compteurs)

import Redis from 'ioredis';

let redis: Redis | null = null;

/**
 * Retourne le client Redis FinOps (singleton).
 * Retourne null si REDIS_URL absent.
 */
export function getFinopsRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 50, 2000),
        lazyConnect: true,
      });
      redis.on('error', (err) => {
        console.error('[FinOps Redis] Connection error:', err);
      });
    } catch (e) {
      console.error('[FinOps Redis] Init failed:', e);
      return null;
    }
  }
  return redis;
}

/**
 * Ferme la connexion Redis (tests / shutdown).
 */
export async function closeFinopsRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
