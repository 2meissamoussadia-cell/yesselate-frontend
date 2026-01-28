// lib/server/dashboard/cache/cacheStrategy.ts
// Phase P11: Stratégies de cache serveur pour les endpoints dashboard
// Définit les TTL et stratégies de cache selon le type de vue

import { NextResponse } from 'next/server';

/**
 * Types de vues selon leur stabilité et fréquence de mise à jour
 */
export enum CacheStrategyType {
  /**
   * Données en temps réel (realtime, actions urgentes)
   * Cache très court (5-10s) ou pas de cache
   */
  REALTIME = 'realtime',
  
  /**
   * Données opérationnelles (overview, KPIs, trends quotidiens)
   * Cache court (30-60s)
   */
  OPERATIONAL = 'operational',
  
  /**
   * Données de reporting (mensuel, trimestriel)
   * Cache long (30-300s selon la granularité)
   */
  REPORTING = 'reporting',
  
  /**
   * Données statiques ou quasi-statiques (référentiels, configurations)
   * Cache très long (5-15 minutes)
   */
  STATIC = 'static',
}

/**
 * Configuration de cache pour un type de stratégie
 */
export interface CacheConfig {
  /**
   * TTL en secondes pour le cache serveur (Next.js revalidate)
   */
  revalidate: number;
  
  /**
   * Header Cache-Control max-age en secondes
   */
  maxAge: number;
  
  /**
   * Header Cache-Control s-maxage en secondes (pour les CDN/proxies)
   */
  sMaxAge?: number;
  
  /**
   * Si true, le cache est partagé entre utilisateurs (public)
   * Si false, le cache est privé (tenant-scopé)
   */
  shared: boolean;
  
  /**
   * Si true, le cache doit être invalidé lors des mutations
   */
  invalidateOnMutation: boolean;
}

/**
 * Stratégies de cache par type
 */
export const CACHE_STRATEGIES: Record<CacheStrategyType, CacheConfig> = {
  [CacheStrategyType.REALTIME]: {
    revalidate: 5, // 5 secondes
    maxAge: 5,
    sMaxAge: 5,
    shared: false, // Privé (tenant-scopé)
    invalidateOnMutation: true,
  },
  
  [CacheStrategyType.OPERATIONAL]: {
    revalidate: 30, // 30 secondes
    maxAge: 30,
    sMaxAge: 30,
    shared: false, // Privé (tenant-scopé)
    invalidateOnMutation: true,
  },
  
  [CacheStrategyType.REPORTING]: {
    revalidate: 60, // 1 minute (les MViews sont rafraîchies toutes les 5-10 min)
    maxAge: 60,
    sMaxAge: 300, // CDN peut cacher 5 minutes
    shared: false, // Privé (tenant-scopé)
    invalidateOnMutation: false, // Reporting mensuel, pas d'invalidation immédiate
  },
  
  [CacheStrategyType.STATIC]: {
    revalidate: 300, // 5 minutes
    maxAge: 300,
    sMaxAge: 900, // CDN peut cacher 15 minutes
    shared: false, // Privé (tenant-scopé)
    invalidateOnMutation: true,
  },
};

/**
 * Détermine la stratégie de cache selon la route dashboard
 * 
 * @param main - Catégorie principale (overview, performance, etc.)
 * @param sub - Sous-catégorie (kpis, reporting, etc.)
 * @param leaf - Feuille (dashboard, trends, etc.)
 * @returns Stratégie de cache appropriée
 */
export function getCacheStrategy(
  main: string,
  sub: string | null,
  leaf: string | null
): CacheStrategyType {
  // Routes realtime
  if (main === 'realtime') {
    return CacheStrategyType.REALTIME;
  }
  
  // Routes reporting (mensuel/trimestriel)
  if (main === 'performance' && sub === 'reporting') {
    return CacheStrategyType.REPORTING;
  }
  
  // Routes trends mensuels
  if (sub === 'trends' && (leaf === 'monthly' || leaf === 'quarterly')) {
    return CacheStrategyType.REPORTING;
  }
  
  // Routes opérationnelles (overview, KPIs, trends quotidiens)
  if (main === 'overview' || main === 'performance' || main === 'actions' || main === 'risks' || main === 'decisions') {
    return CacheStrategyType.OPERATIONAL;
  }
  
  // Par défaut: opérationnel
  return CacheStrategyType.OPERATIONAL;
}

/**
 * Applique les headers de cache à une réponse Next.js
 * 
 * @param response - Réponse Next.js
 * @param strategy - Stratégie de cache à appliquer
 * @param tenantId - ID du tenant (pour le cache privé)
 * @returns Réponse avec les headers de cache
 */
export function applyCacheHeaders(
  response: NextResponse,
  strategy: CacheStrategyType,
  tenantId?: string
): NextResponse {
  const config = CACHE_STRATEGIES[strategy];
  
  // Construire le header Cache-Control
  const cacheControlParts: string[] = [];
  
  if (config.shared) {
    cacheControlParts.push('public');
  } else {
    cacheControlParts.push('private');
    // Ajouter le tenant ID dans le header pour le cache privé
    if (tenantId) {
      response.headers.set('X-Cache-Tenant', tenantId);
    }
  }
  
  cacheControlParts.push(`max-age=${config.maxAge}`);
  
  if (config.sMaxAge) {
    cacheControlParts.push(`s-maxage=${config.sMaxAge}`);
  }
  
  // Ajouter must-revalidate pour forcer la revalidation après expiration
  cacheControlParts.push('must-revalidate');
  
  response.headers.set('Cache-Control', cacheControlParts.join(', '));
  
  // Ajouter le header X-Cache-Strategy pour le debugging
  response.headers.set('X-Cache-Strategy', strategy);
  
  return response;
}

/**
 * Helper pour créer une réponse avec cache
 * 
 * @param data - Données à retourner
 * @param strategy - Stratégie de cache
 * @param tenantId - ID du tenant
 * @param status - Code de statut HTTP (défaut: 200)
 * @returns Réponse Next.js avec cache
 */
export function cachedResponse<T>(
  data: T,
  strategy: CacheStrategyType,
  tenantId?: string,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return applyCacheHeaders(response, strategy, tenantId);
}
