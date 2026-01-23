/**
 * useOptimizedQuery Hook
 * Wrapper optimisé autour de React Query avec prefetching et cache intelligent
 */

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';

interface OptimizedQueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  prefetchOnMount?: boolean;
  prefetchOnHover?: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Hook optimisé pour React Query avec prefetching
 */
export function useOptimizedQuery<TData = unknown, TError = Error>({
  queryKey,
  queryFn,
  prefetchOnMount = true,
  prefetchOnHover = false,
  staleTime = 5 * 60 * 1000, // 5 minutes par défaut
  gcTime = 10 * 60 * 1000, // 10 minutes par défaut
  ...queryOptions
}: OptimizedQueryOptions<TData, TError>) {
  const queryClient = useQueryClient();

  // Prefetch au montage si activé
  useEffect(() => {
    if (prefetchOnMount) {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      });
    }
  }, [queryClient, queryKey, queryFn, prefetchOnMount, staleTime]);

  // Utiliser la query standard
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    ...queryOptions,
  });

  return query;
}

/**
 * Hook pour prefetch des données liées
 */
export function usePrefetchRelated<TData = unknown>({
  queryKey,
  queryFn,
  relatedKeys,
}: {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  relatedKeys?: string[][];
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch la query principale
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });

    // Prefetch les queries liées si fournies
    if (relatedKeys) {
      relatedKeys.forEach(key => {
        // TODO: Implémenter les queryFn pour les clés liées
        queryClient.prefetchQuery({
          queryKey: key,
          queryFn: async () => {
            // Placeholder - à implémenter selon les besoins
            return null;
          },
        });
      });
    }
  }, [queryClient, queryKey, queryFn, relatedKeys]);
}

