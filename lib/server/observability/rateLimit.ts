/**
 * Rate Limiting (Token Bucket)
 * Phase P4: Observabilité & Robustesse (in-memory)
 * Phase P11: Migration vers Redis pour partage entre instances
 * 
 * Protection contre les abus sur /api/dashboard/*
 * 
 * Utilise Redis si REDIS_URL est défini, sinon fallback in-memory
 */

import { rateLimitRedis } from './rateLimitRedis';

// Fallback in-memory (si Redis indisponible)
type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Rate limiting avec fallback automatique
 * - Redis si REDIS_URL est défini (production, multi-instances)
 * - In-memory sinon (développement, fallback)
 * 
 * @param key - Clé unique pour le bucket (ex: "dash:127.0.0.1")
 * @param capacity - Capacité du bucket (nombre de tokens max)
 * @param refillPerSec - Nombre de tokens rechargés par seconde
 * @returns { allowed: boolean, remaining: number }
 */
export async function rateLimit(
  key: string,
  capacity = 120,
  refillPerSec = 2
): Promise<{ allowed: boolean; remaining: number }> {
  // Phase P11: Essayer Redis d'abord
  if (process.env.REDIS_URL) {
    try {
      return await rateLimitRedis(key, capacity, refillPerSec);
    } catch (error) {
      console.warn('[RateLimit] Redis failed, falling back to in-memory:', error);
      // Fallback vers in-memory en cas d'erreur
    }
  }
  
  // Fallback in-memory (Phase P4)
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: capacity, updatedAt: now };
  const elapsed = (now - b.updatedAt) / 1000;
  const refill = Math.floor(elapsed * refillPerSec);
  b.tokens = Math.min(capacity, b.tokens + refill);
  b.updatedAt = now;
  
  if (b.tokens > 0) {
    b.tokens -= 1;
    buckets.set(key, b);
    return { allowed: true, remaining: b.tokens };
  }
  
  return { allowed: false, remaining: 0 };
}
