// lib/server/dashboard/cache/sloMetrics.ts
// Phase P11: Métriques SLO pour piloter les budgets de performance

import { apiTTFB, cacheHitCounter, cacheMissCounter } from '@/lib/server/observability/metrics';
import type { CacheStrategyType } from './cacheStrategy';

/**
 * Budgets SLO pour les performances
 */
export const SLO_BUDGETS = {
  /**
   * Time To First Byte (TTFB) - Temps jusqu'au premier byte de la réponse API
   * Budget: P95 < 400ms pour les endpoints API read
   */
  TTFB_P95_MS: 400,
  
  /**
   * Time To Interactive (TTI) - Temps jusqu'à l'interactivité côté front
   * Budget: P95 < 2.5s pour la première vue
   * Note: Mesuré côté client via Performance API
   */
  TTI_P95_MS: 2500,
  
  /**
   * Cache hit rate minimum
   * Budget: > 70% pour les routes reporting
   */
  CACHE_HIT_RATE_MIN: 0.7,
} as const;

/**
 * Enregistre le TTFB (Time To First Byte) pour une requête API
 * 
 * @param route - Route de l'API
 * @param method - Méthode HTTP
 * @param ttfbSeconds - TTFB en secondes
 * @param cacheStrategy - Stratégie de cache utilisée
 */
export function recordTTFB(
  route: string,
  method: string,
  ttfbSeconds: number,
  cacheStrategy: CacheStrategyType
): void {
  apiTTFB.observe(
    { method, route, cache_strategy: cacheStrategy },
    ttfbSeconds
  );
  
  // Alerter si le budget SLO est dépassé
  const ttfbMs = ttfbSeconds * 1000;
  if (ttfbMs > SLO_BUDGETS.TTFB_P95_MS) {
    // Log warning si TTFB dépasse le budget (on peut aussi envoyer une alerte)
    console.warn(
      `[SLO] TTFB exceeds budget: ${ttfbMs.toFixed(0)}ms > ${SLO_BUDGETS.TTFB_P95_MS}ms`,
      { route, method, cacheStrategy }
    );
  }
}

/**
 * Enregistre un cache hit
 * 
 * @param route - Route de l'API
 * @param cacheStrategy - Stratégie de cache utilisée
 */
export function recordCacheHit(route: string, cacheStrategy: CacheStrategyType): void {
  cacheHitCounter.inc({ cache_strategy: cacheStrategy, route });
}

/**
 * Enregistre un cache miss
 * 
 * @param route - Route de l'API
 * @param cacheStrategy - Stratégie de cache utilisée
 */
export function recordCacheMiss(route: string, cacheStrategy: CacheStrategyType): void {
  cacheMissCounter.inc({ cache_strategy: cacheStrategy, route });
}

/**
 * Calcule le taux de cache hit pour une route
 * (Utilisé pour les alertes si le taux est trop bas)
 * 
 * @param route - Route de l'API
 * @param cacheStrategy - Stratégie de cache utilisée
 * @returns Taux de cache hit (0-1) ou null si pas assez de données
 */
export async function getCacheHitRate(
  route: string,
  cacheStrategy: CacheStrategyType
): Promise<number | null> {
  // Note: En production, on récupérerait ces valeurs depuis Prometheus
  // Pour l'instant, on retourne null (à implémenter avec un client Prometheus)
  return null;
}
