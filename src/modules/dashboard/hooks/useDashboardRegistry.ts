/**
 * Hook de données pour le Dashboard Registry
 * Utilise TanStack Query pour le cache et la gestion des données
 * 
 * DESIGN SYSTEM DATA - Source de vérité pour le chargement des données dashboard
 */

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { DataResult, ViewEntry } from '../registry';
import type { NavKey } from '../types/dashboard';
import type { DashboardViewData } from '../types/dashboardDataTypes';
import { dashboardRegistry, navToKey } from '../registry';
import { storeNavToNavKey } from '../utils/navAdapter';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

// ============================================
// QUERY KEYS
// ============================================

export const dashboardRegistryKeys = {
  all: ['dashboard-registry'] as const,
  view: (nav: NavKey) => [...dashboardRegistryKeys.all, 'view', navToKey(nav)] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour charger les données d'une vue du dashboard
 * Utilise le registry pour résoudre le loader et gère le cache via TanStack Query
 * 
 * @template T - Type de données attendu (inféré depuis le registry si possible)
 */
export function useDashboardViewData<T extends DashboardViewData = DashboardViewData>(
  nav: NavKey,
  options?: Omit<UseQueryOptions<DataResult<T>>, 'queryKey' | 'queryFn'>
) {
  const queryKey = dashboardRegistryKeys.view(nav);
  const registryKey = navToKey(nav);
  const entry = dashboardRegistry[registryKey] as ViewEntry<T> | undefined;

  return useQuery<DataResult<T>>({
    queryKey,
    queryFn: async () => {
      if (!entry) {
        throw new Error(`No registry entry found for key: ${registryKey}`);
      }

      if (!entry.loader) {
        // Vue sans loader (vue pure)
        return {
          key: registryKey,
          data: {} as T,
          fetchedAt: Date.now(),
        };
      }

      // Appeler le loader typé
      const result = await entry.loader(nav);
      return result as DataResult<T>;
    },
    staleTime: entry?.ttl ?? 60_000, // TTL par défaut: 1 minute
    gcTime: (entry?.ttl ?? 60_000) * 2, // GC time: 2x TTL
    enabled: !!entry, // Désactiver si pas d'entrée
    ...options,
  });
}

/**
 * Hook pour obtenir l'entrée du registry pour une navigation donnée
 */
export function useDashboardViewEntry<T extends DashboardViewData = DashboardViewData>(
  nav: NavKey
): ViewEntry<T> | null {
  const registryKey = navToKey(nav);
  return (dashboardRegistry[registryKey] as ViewEntry<T> | undefined) || null;
}

/**
 * Hook pour précharger les données d'une vue (prefetch)
 */
export function usePrefetchDashboardView() {
  const queryClient = useQueryClient();

  return (nav: NavKey) => {
    const queryKey = dashboardRegistryKeys.view(nav);
    const registryKey = navToKey(nav);
    const entry = dashboardRegistry[registryKey];

    if (!entry?.loader) return;

    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const result = await entry.loader!(nav);
        return result;
      },
      staleTime: entry.ttl ?? 60_000,
    });
  };
}

/**
 * Hook pour invalider le cache d'une vue
 */
export function useInvalidateDashboardView() {
  const queryClient = useQueryClient();

  return (nav: NavKey) => {
    const queryKey = dashboardRegistryKeys.view(nav);
    queryClient.invalidateQueries({ queryKey });
  };
}

/**
 * Hook pour invalider toutes les vues du dashboard
 */
export function useInvalidateAllDashboardViews() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardRegistryKeys.all });
  };
}

/**
 * Hook pour charger les données de la vue actuelle depuis le store
 * Version de convenance qui lit automatiquement la navigation depuis le store
 */
export function useCurrentDashboardViewData<T extends DashboardViewData = DashboardViewData>(
  options?: Omit<UseQueryOptions<DataResult<T>>, 'queryKey' | 'queryFn'>
) {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);
  const navKey = storeNavToNavKey(navigation);
  
  return useDashboardViewData<T>(navKey, options);
}
