/**
 * Hook pour charger les données d'une vue dashboard avec TanStack Query
 * Exploite le TTL du registry pour la gestion du cache
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDashboardData({
 *   main: 'overview',
 *   sub: 'summary',
 *   leaf: 'dashboard'
 * });
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error error={error} />;
 * if (!data) return <Empty />;
 * 
 * return <MyComponent data={data} />;
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { navToKey, type NavKey } from '@/modules/dashboard/types/dashboard';
import { dashboardRegistry } from '@/modules/dashboard/registry/dashboardRegistry';
import type { LoaderResult } from '@/modules/dashboard/types/dashboard';

/**
 * Hook pour charger les données d'une vue dashboard avec cache TTL
 * 
 * @param nav - Clé de navigation (main, sub, leaf)
 * @returns Résultat de la query TanStack Query avec les données, état de chargement, erreur, etc.
 */
export function useDashboardData<TData>(nav: NavKey) {
  const key = navToKey(nav);
  const entry = dashboardRegistry[key] as {
    ttl?: number;
    loader?: (n: NavKey) => Promise<LoaderResult<TData>>;
  } | undefined;

  return useQuery<LoaderResult<TData>>({
    queryKey: ['dashboard', key],
    queryFn: async () => {
      if (!entry?.loader) {
        return {
          key,
          fetchedAt: Date.now(),
          data: null as unknown as TData,
        };
      }
      return entry.loader(nav);
    },
    staleTime: entry?.ttl ?? 60_000, // Utilise le TTL du registry ou 60s par défaut
    gcTime: 5 * 60_000, // Garde en cache 5 minutes après inactivité
  });
}
