/**
 * Client API unifié pour le Dashboard (Phase 2)
 * 
 * Gère :
 * - Les appels API avec typage strict
 * - Le cache côté client (staleTime basé sur TTL)
 * - La gestion d'erreurs standardisée
 * - La sécurité (headers, tokens)
 * - Le retry avec backoff exponentiel
 */

'use client';

import { navToKey, type NavKey } from '../types/dashboard';
import {
  DashboardApiResponse,
  DashboardApiOptions,
  DashboardApiError,
  DashboardApiErrorCode,
  ViewDataForNav,
  DashboardViewData,
} from './types';
import { DashboardRouteParamsSchema } from './types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = '/api/dashboard';
const DEFAULT_TIMEOUT = 30000; // 30 secondes
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 seconde

// ============================================================================
// Cache côté client (simple Map, peut être remplacé par TanStack Query)
// ============================================================================

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Nettoie le cache des entrées expirées
 */
function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.fetchedAt > entry.ttl) {
      cache.delete(key);
    }
  }
}

// Nettoyer le cache toutes les minutes
if (typeof window !== 'undefined') {
  setInterval(cleanCache, 60000);
}

// ============================================================================
// Helpers pour la gestion d'erreurs
// ============================================================================

/**
 * Crée une erreur API standardisée depuis une réponse HTTP
 */
function createApiError(response: Response, body?: unknown): DashboardApiError {
  let code: DashboardApiErrorCode = DashboardApiErrorCode.INTERNAL_ERROR;
  let message = 'Unknown error';
  
  if (response.status === 400) {
    code = DashboardApiErrorCode.VALIDATION_ERROR;
    message = 'Invalid request parameters';
  } else if (response.status === 401) {
    code = DashboardApiErrorCode.UNAUTHORIZED;
    message = 'Authentication required';
  } else if (response.status === 403) {
    code = DashboardApiErrorCode.FORBIDDEN;
    message = 'Access forbidden';
  } else if (response.status === 404) {
    code = DashboardApiErrorCode.NOT_FOUND;
    message = 'Resource not found';
  } else if (response.status === 429) {
    code = DashboardApiErrorCode.RATE_LIMIT_EXCEEDED;
    message = 'Rate limit exceeded';
  }
  
  if (body && typeof body === 'object' && 'error' in body) {
    const errorBody = body as { error?: { message?: string; code?: string } };
    if (errorBody.error?.message) {
      message = errorBody.error.message;
    }
    if (errorBody.error?.code) {
      code = errorBody.error.code as DashboardApiErrorCode;
    }
  }
  
  return new DashboardApiError(code, message, response.status, body);
}

/**
 * Retry avec backoff exponentiel
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_BASE
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries === 0) {
      throw error;
    }
    
    // Ne retry que pour les erreurs réseau ou 5xx
    if (
      error instanceof DashboardApiError &&
      (error.code === DashboardApiErrorCode.NETWORK_ERROR ||
       error.statusCode >= 500)
    ) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, maxRetries - 1, delay * 2);
    }
    
    throw error;
  }
}

// ============================================================================
// Client API principal
// ============================================================================

/**
 * Client API pour charger les données d'une vue du dashboard
 * 
 * @param nav - Clé de navigation (main, sub, leaf)
 * @param options - Options de requête (cache, filtres, etc.)
 * @returns Données typées selon la route
 * 
 * @example
 * ```ts
 * const data = await fetchDashboardView(
 *   { main: 'overview', sub: 'summary', leaf: 'dashboard' },
 *   { refresh: false }
 * );
 * ```
 */
export async function fetchDashboardView<TNav extends NavKey>(
  nav: TNav,
  options: DashboardApiOptions = {}
): Promise<ViewDataForNav<TNav>> {
  // Validation des paramètres
  const validation = DashboardRouteParamsSchema.safeParse({
    main: nav.main,
    sub: nav.sub ?? null,
    leaf: nav.leaf ?? null,
  });
  
  if (!validation.success) {
    throw new DashboardApiError(
      DashboardApiErrorCode.VALIDATION_ERROR,
      'Invalid route parameters',
      400,
      validation.error.issues
    );
  }
  
  // Construire l'URL
  const cacheKey = navToKey(nav);
  const url = new URL(`${API_BASE_URL}/${nav.main}/${nav.sub || ''}/${nav.leaf || ''}`, window.location.origin);
  
  // Ajouter les query parameters
  if (options.filters) {
    if (options.filters.bureauId) {
      url.searchParams.set('bureauId', options.filters.bureauId);
    }
    if (options.filters.chantierId) {
      url.searchParams.set('chantierId', options.filters.chantierId);
    }
    if (options.filters.dateFrom) {
      url.searchParams.set('dateFrom', options.filters.dateFrom);
    }
    if (options.filters.dateTo) {
      url.searchParams.set('dateTo', options.filters.dateTo);
    }
  }
  
  if (options.refresh) {
    url.searchParams.set('refresh', 'true');
  }
  
  // Vérifier le cache (si pas de refresh)
  if (!options.refresh) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < cached.ttl) {
      return cached.data as ViewDataForNav<TNav>;
    }
  }
  
  // Effectuer la requête avec retry
  const response = await retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || DEFAULT_TIMEOUT
    );
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      // Si les headers d'auth ne sont pas fournis, essayer de les récupérer
      if (!headers['x-tenant-id'] && !headers['x-user-id']) {
        try {
          const { getAuthHeaders } = await import('../utils/getAuthHeaders');
          // Essayer de récupérer depuis localStorage ou contexte si disponible
          // Note: Dans un contexte client, on peut accéder au contexte via un mécanisme global
          const authHeaders = getAuthHeaders(null); // Fallback par défaut
          Object.assign(headers, authHeaders);
        } catch (e) {
          // Si l'import échoue, continuer sans headers auth (sera géré côté serveur)
        }
      }
      
      // Ajouter le token d'authentification si disponible (pour compatibilité)
      const token = localStorage.getItem('auth_token');
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw createApiError(res, body);
      }
      
      return res;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DashboardApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new DashboardApiError(
          DashboardApiErrorCode.TIMEOUT,
          'Request timeout',
          408
        );
      }
      
      throw new DashboardApiError(
        DashboardApiErrorCode.NETWORK_ERROR,
        error instanceof Error ? error.message : 'Network error',
        0,
        error
      );
    }
  });
  
  // Parser la réponse
  const body: DashboardApiResponse<ViewDataForNav<TNav>> = await response.json();
  
  if (!body.success) {
    throw new DashboardApiError(
      body.error?.code as DashboardApiErrorCode || DashboardApiErrorCode.INTERNAL_ERROR,
      body.error?.message || 'API request failed',
      response.status,
      body.error?.details
    );
  }
  
  // Mettre en cache
  const ttl = body.metadata.ttl || 60000; // 1 minute par défaut
  cache.set(cacheKey, {
    data: body.data,
    fetchedAt: body.metadata.fetchedAt,
    ttl,
  });
  
  return body.data;
}

/**
 * Invalide le cache pour une route spécifique
 */
export function invalidateCache(nav: NavKey): void {
  const cacheKey = navToKey(nav);
  cache.delete(cacheKey);
}

/**
 * Invalide tout le cache
 */
export function clearCache(): void {
  cache.clear();
}
