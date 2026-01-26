// lib/server/observability/rateLimitRedis.ts
// Phase P11: Rate limiting avec Redis (Token Bucket Algorithm)
// Remplace le rate limiting in-memory pour le partage entre instances

import Redis from 'ioredis';

// Instance Redis singleton
let redis: Redis | null = null;

/**
 * Initialise la connexion Redis si REDIS_URL est défini
 */
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }
  
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });
      
      redis.on('error', (err) => {
        console.error('[RateLimit Redis] Connection error:', err);
      });
      
      redis.on('connect', () => {
        console.log('[RateLimit Redis] Connected');
      });
    } catch (error) {
      console.error('[RateLimit Redis] Failed to initialize:', error);
      return null;
    }
  }
  
  return redis;
}

/**
 * Rate limiting avec Redis (Token Bucket Algorithm)
 * 
 * @param key - Clé unique pour le bucket (ex: "dash:127.0.0.1")
 * @param capacity - Capacité du bucket (nombre de tokens max)
 * @param refillPerSec - Nombre de tokens rechargés par seconde
 * @returns { allowed: boolean, remaining: number }
 */
export async function rateLimitRedis(
  key: string,
  capacity = 120,
  refillPerSec = 2
): Promise<{ allowed: boolean; remaining: number }> {
  const client = getRedis();
  
  // Fallback si Redis n'est pas disponible
  if (!client) {
    return { allowed: true, remaining: capacity }; // Permettre si Redis indisponible
  }
  
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Script Lua pour Token Bucket (atomique)
    const lua = `
      local key = KEYS[1]
      local cap = tonumber(ARGV[1])
      local rps = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local bucket = redis.call('HMGET', key, 'tokens','ts')
      local tokens = tonumber(bucket[1]) or cap
      local ts = tonumber(bucket[2]) or now
      local delta = math.max(0, now - ts)
      tokens = math.min(cap, tokens + delta * rps)
      local allowed = 0
      if tokens >= 1 then tokens = tokens - 1; allowed = 1 end
      redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
      redis.call('EXPIRE', key, 3600)
      return {allowed, tokens}
    `;
    
    const result = await client.eval(
      lua,
      1,
      key,
      String(capacity),
      String(refillPerSec),
      String(now)
    ) as [number, number];
    
    const [allowed, tokens] = result;
    
    return {
      allowed: allowed === 1,
      remaining: Math.floor(tokens),
    };
  } catch (error) {
    console.error('[RateLimit Redis] Error:', error);
    // En cas d'erreur Redis, permettre la requête (fail-open)
    return { allowed: true, remaining: capacity };
  }
}

/**
 * Ferme la connexion Redis (pour les tests ou shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
