/**
 * Hooks Délégations avec React Query
 * ===================================
 * 
 * Migration moderne de useDelegationAPI.ts vers React Query
 * Gère automatiquement: caching, retry, abort, background refresh
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Delegation,
  DelegationStats,
  DelegationAlert,
  AlertsResponse,
  DelegationInsights,
} from './useDelegationAPI';

// ============================================
// QUERY KEYS
// ============================================

export const delegationKeys = {
  all: ['delegations'] as const,
  lists: () => [...delegationKeys.all, 'list'] as const,
  list: (filters: DelegationsFilters) => [...delegationKeys.lists(), filters] as const,
  details: () => [...delegationKeys.all, 'detail'] as const,
  detail: (id: string) => [...delegationKeys.details(), id] as const,
  stats: () => [...delegationKeys.all, 'stats'] as const,
  alerts: () => [...delegationKeys.all, 'alerts'] as const,
  insights: () => [...delegationKeys.all, 'insights'] as const,
};

// ============================================
// TYPES
// ============================================

export interface DelegationsFilters {
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
}

export interface DelegationsResponse {
  items: Delegation[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchDelegations(filters: DelegationsFilters): Promise<DelegationsResponse> {
  const params = new URLSearchParams();
  
  params.set('queue', filters.queue ?? 'all');
  if (filters.bureau) params.set('bureau', filters.bureau);
  if (filters.type) params.set('type', filters.type);
  if (filters.search) params.set('search', filters.search);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  params.set('sort', filters.sortField ?? 'endDate');
  params.set('dir', filters.sortDir ?? 'asc');
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? 50));

  const response = await fetch(`/api/delegations?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function fetchDelegationById(id: string): Promise<Delegation> {
  const response = await fetch(`/api/delegations/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.delegation ?? result;
}

async function fetchDelegationStats(): Promise<DelegationStats> {
  const response = await fetch('/api/delegations/stats', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Erreur stats: ${response.statusText}`);
  }

  return response.json();
}

async function fetchDelegationAlerts(): Promise<AlertsResponse> {
  const response = await fetch('/api/delegations/alerts', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Erreur alertes: ${response.statusText}`);
  }

  return response.json();
}

async function fetchDelegationInsights(): Promise<DelegationInsights> {
  const response = await fetch('/api/delegations/insights', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Erreur insights: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour charger une liste de délégations avec filtres et pagination
 * Utilise React Query pour le caching et la synchronisation automatique
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useDelegations({
 *   queue: 'active',
 *   bureau: 'BMO',
 * });
 * ```
 */
export function useDelegations(filters: DelegationsFilters = {}, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: delegationKeys.list(filters),
    queryFn: () => fetchDelegations(filters),
    staleTime: 30000, // 30 secondes
    retry: 2,
    retryDelay: 1000,
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
  });
}

/**
 * Hook pour charger une délégation par ID
 */
export function useDelegation(id: string | null, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: delegationKeys.detail(id ?? ''),
    queryFn: () => fetchDelegationById(id!),
    staleTime: 30000,
    retry: 2,
    enabled: (options?.enabled ?? true) && !!id,
  });
}

/**
 * Hook pour charger les statistiques
 */
export function useDelegationStats(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: delegationKeys.stats(),
    queryFn: fetchDelegationStats,
    staleTime: 60000, // 1 minute
    retry: 2,
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
  });
}

/**
 * Hook pour charger les alertes
 */
export function useDelegationAlerts(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: delegationKeys.alerts(),
    queryFn: fetchDelegationAlerts,
    staleTime: 30000,
    retry: 2,
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
  });
}

/**
 * Hook pour charger les insights
 */
export function useDelegationInsights(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: delegationKeys.insights(),
    queryFn: fetchDelegationInsights,
    staleTime: 120000, // 2 minutes
    retry: 2,
    enabled: options?.enabled,
  });
}

/**
 * Hook pour créer une délégation
 */
export function useCreateDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Delegation>) => {
      const response = await fetch('/api/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur création: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les listes pour refresh
      queryClient.invalidateQueries({ queryKey: delegationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: delegationKeys.stats() });
    },
  });
}

/**
 * Hook pour mettre à jour une délégation
 */
export function useUpdateDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Delegation> }) => {
      const response = await fetch(`/api/delegations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur mise à jour: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: delegationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: delegationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: delegationKeys.stats() });
    },
  });
}

/**
 * Hook pour révoquer une délégation
 */
export function useRevokeDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/delegations/${encodeURIComponent(id)}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Erreur révocation: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: delegationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: delegationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: delegationKeys.stats() });
      queryClient.invalidateQueries({ queryKey: delegationKeys.alerts() });
    },
  });
}

/**
 * Hook pour supprimer une délégation
 */
export function useDeleteDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/delegations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erreur suppression: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: delegationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: delegationKeys.stats() });
    },
  });
}
