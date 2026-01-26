/**
 * Hook pour charger les données d'une vue dashboard avec TanStack Query
 * 
 * MIGRATION: Utilise maintenant TanStack Query au lieu du cache manuel
 * Compatible avec useDashboardRegistry pour cohérence
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useDashboardData();
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * if (!data) return <Empty />;
 * 
 * return <MyComponent data={data} />;
 * ```
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardRegistry } from '../registry';
import { navToKey, type NavKey } from '../types/dashboard';
import type { LoaderResult } from '../types/dashboard';
import type { DashboardViewData } from '../types/dashboardDataTypes';

interface UseDashboardDataOptions {
  /**
   * Force le rechargement même si les données sont en cache
   */
  forceRefresh?: boolean;
  
  /**
   * Options supplémentaires pour TanStack Query
   */
  queryOptions?: Omit<UseQueryOptions<LoaderResult<DashboardViewData>>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook pour charger les données d'une vue dashboard avec TanStack Query
 * 
 * Utilise TanStack Query pour le cache, la gestion des erreurs et le refetch
 * Remplace l'ancien système de cache manuel
 */
export function useDashboardData<T extends DashboardViewData = DashboardViewData>(
  options: UseDashboardDataOptions = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
} {
  const { forceRefresh = false, queryOptions } = options;
  
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);
  const nav: NavKey = {
    main: (navigation.mainCategory || 'overview') as NavKey['main'],
    sub: navigation.subCategory || null,
    leaf: navigation.subSubCategory || null,
  };
  
  const routeKey = navToKey(nav);
  const entry = dashboardRegistry[routeKey];
  
  const queryKey = ['dashboard', 'view', routeKey];
  
  const query = useQuery<LoaderResult<T>>({
    queryKey,
    queryFn: async () => {
      if (!entry) {
        // Pas d'entrée dans le registry, retourner des données vides
        return {
          key: routeKey,
          fetchedAt: Date.now(),
          data: null as unknown as T,
        };
      }
      
      if (!entry.loader) {
        // Vue pure sans loader
        return {
          key: routeKey,
          fetchedAt: Date.now(),
          data: null as unknown as T,
        };
      }
      
      // Appeler le loader
      const result = await entry.loader(nav);
      return result as LoaderResult<T>;
    },
    staleTime: entry?.ttl ?? 60_000, // TTL par défaut: 1 minute
    gcTime: (entry?.ttl ?? 60_000) * 2, // GC time: 2x TTL
    enabled: !!entry && !forceRefresh, // Désactiver si pas d'entrée ou si forceRefresh
    refetchOnWindowFocus: false, // Ne pas refetch automatiquement
    retry: 1, // Retry une seule fois en cas d'erreur
    ...queryOptions,
  });
  
  // Calculer isStale
  const isStale = query.data
    ? entry?.ttl
      ? Date.now() - query.data.fetchedAt > entry.ttl
      : false
    : false;
  
  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => query.refetch(),
    isStale,
  };
}
