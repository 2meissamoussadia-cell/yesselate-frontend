// lib/server/dashboard/cache/index.ts
// Phase P11: Exports centralisés pour le système de cache

export {
  CacheStrategyType,
  type CacheConfig,
  CACHE_STRATEGIES,
  getCacheStrategy,
  applyCacheHeaders,
  cachedResponse,
} from './cacheStrategy';

export {
  SLO_BUDGETS,
  recordTTFB,
  recordCacheHit,
  recordCacheMiss,
  getCacheHitRate,
} from './sloMetrics';
