/**
 * Rate Limiting simple (Token Bucket)
 * Phase P4: Observabilité & Robustesse
 * 
 * Protection basique contre les abus sur /api/dashboard/*
 */

type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, capacity = 60, refillPerSec = 1) {
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
