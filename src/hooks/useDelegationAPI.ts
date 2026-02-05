/**
 * Hooks API métiers pour les Délégations
 * =======================================
 * 
 * Hooks React personnalisés pour interagir avec l'API des délégations
 * de manière typée, optimisée et avec gestion d'erreurs intégrée.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

// ============================================
// TYPES
// ============================================

export interface Delegation {
  id: string;
  code?: string;
  type: string;
  status: string;
  bureau: string;
  agentName: string;
  agentRole?: string | null;
  actorName?: string;
  delegatorName?: string;
  scope?: string;
  maxAmount?: number;
  usageCount?: number;
  endDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt?: string;
  daysLeft?: number;
  expiringSoon?: boolean;
  events?: DelegationEvent[];
}

export interface DelegationEvent {
  id: string;
  delegationId: string;
  action: string;
  actorName: string;
  details?: string;
  createdAt: string;
}

export interface DelegationStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  suspended: number;
  expiringSoon: number;
  totalUsage: number;
  byBureau: { bureau: string; count: number }[];
  byType: { type: string; count: number }[];
  recentActivity: DelegationEvent[];
  ts: string;
}

export interface DelegationAlert {
  id: string;
  delegationId: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  type: string;
  message: string;
  details?: string;
  createdAt: string;
}

export interface AlertsResponse {
  alerts: DelegationAlert[];
  summary: {
    critical: number;
    warning: number;
    info: number;
  };
  ts: string;
}

export interface DelegationInsights {
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    action?: string;
  }>;
  riskScore: {
    overall: number;
    factors: Array<{
      name: string;
      score: number;
      description: string;
    }>;
  };
  trends: {
    lastMonth: {
      created: number;
      revoked: number;
      expired: number;
    };
    thisMonth: {
      created: number;
      revoked: number;
      expired: number;
      amountUsed: number;
      amountThisMonth: number;
    };
  };
}

export interface UseDelegationsOptions {
  queue?: string;
  bureau?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseDelegationsResult {
  data: Delegation[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface UseStatsResult {
  data: DelegationStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface UseAlertsResult {
  data: AlertsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  dismissAlert: (id: string) => void;
}

export interface UseInsightsResult {
  data: DelegationInsights | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ============================================
// HOOK: useDelegations
// ============================================

/**
 * Hook pour charger une liste de délégations avec filtres et pagination
 * 
 * @example
 * ```typescript
 * const { data, loading, error, refresh } = useDelegations({
 *   queue: 'active',
 *   bureau: 'BMO',
 *   autoRefresh: true,
 * });
 * ```
 */
export function useDelegations(options: UseDelegationsOptions = {}): UseDelegationsResult {
  const {
    queue = 'all',
    bureau,
    type,
    search,
    dateFrom,
    dateTo,
    sortField = 'endDate',
    sortDir = 'asc',
    page = 1,
    limit = 50,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  const [data, setData] = useState<Delegation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    // Annuler la requête précédente si en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('queue', queue);
      if (bureau) params.set('bureau', bureau);
      if (type) params.set('type', type);
      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('sort', sortField);
      params.set('dir', sortDir);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/delegations?${params.toString()}`, {
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        logger.error('Erreur chargement délégations', err instanceof Error ? err : undefined, { component: 'useDelegationAPI' });
        setError(err.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [queue, bureau, type, search, dateFrom, dateTo, sortField, sortDir, page, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, total, loading, error, refresh };
}

// ============================================
// HOOK: useDelegationStats
// ============================================

/**
 * Hook pour charger les statistiques globales des délégations
 * 
 * @example
 * ```typescript
 * const { data, loading, refresh } = useDelegationStats({ autoRefresh: true });
 * ```
 */
export function useDelegationStats(options: { autoRefresh?: boolean; refreshInterval?: number } = {}): UseStatsResult {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [data, setData] = useState<DelegationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/delegations/stats', {
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        logger.error('Erreur chargement stats', err instanceof Error ? err : undefined, { component: 'useDelegationAPI' });
        setError(err.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, refresh };
}

// ============================================
// HOOK: useDelegationAlerts
// ============================================

/**
 * Hook pour charger les alertes critiques des délégations
 * 
 * @example
 * ```typescript
 * const { data, loading, dismissAlert } = useDelegationAlerts({ autoRefresh: true });
 * ```
 */
export function useDelegationAlerts(options: { autoRefresh?: boolean; refreshInterval?: number } = {}): UseAlertsResult {
  const { autoRefresh = false, refreshInterval = 60000 } = options;

  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/delegations/alerts', {
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Filtrer les alertes dismissées
      const filteredAlerts = result.alerts.filter((alert: DelegationAlert) => !dismissedIds.has(alert.id));
      
      setData({
        ...result,
        alerts: filteredAlerts,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        logger.error('Erreur chargement alertes', err instanceof Error ? err : undefined, { component: 'useDelegationAPI' });
        setError(err.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [dismissedIds]);

  const dismissAlert = useCallback((id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        alerts: prev.alerts.filter(alert => alert.id !== id),
      };
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, refresh, dismissAlert };
}

// ============================================
// HOOK: useDelegationInsights
// ============================================

/**
 * Hook pour charger les insights et recommandations
 * 
 * @example
 * ```typescript
 * const { data, loading, refresh } = useDelegationInsights();
 * ```
 */
export function useDelegationInsights(options: { autoRefresh?: boolean; refreshInterval?: number } = {}): UseInsightsResult {
  const { autoRefresh = false, refreshInterval = 300000 } = options; // 5 min par défaut

  const [data, setData] = useState<DelegationInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/delegations/insights', {
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        logger.error('Erreur chargement insights', err instanceof Error ? err : undefined, { component: 'useDelegationAPI' });
        setError(err.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, refresh };
}

