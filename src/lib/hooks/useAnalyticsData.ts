/**
 * Hook pour charger les données analytics avec cache
 * Gère le chargement, le cache, les mises à jour et les erreurs
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface DataSourceConfig {
  id: string;
  endpoint: string;
  params?: Record<string, any>;
  cache?: {
    ttl: number;
    key: string;
  };
}

interface UseAnalyticsDataOptions {
  dataSource: DataSourceConfig;
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour charger une source de données analytics
 */
export function useAnalyticsData<T = any>({
  dataSource,
  enabled = true,
  refetchInterval,
  onSuccess,
  onError,
}: UseAnalyticsDataOptions) {
  const queryClient = useQueryClient();
  const cacheKey = dataSource.cache?.key || `analytics-${dataSource.id}`;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<T>({
    queryKey: [cacheKey, dataSource.params],
    queryFn: async () => {
      const url = new URL(dataSource.endpoint, window.location.origin);
      
      // Ajouter les paramètres de requête
      if (dataSource.params) {
        Object.entries(dataSource.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${dataSource.endpoint}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled,
    staleTime: dataSource.cache?.ttl || 300000, // 5 minutes par défaut
    gcTime: dataSource.cache?.ttl ? dataSource.cache.ttl * 2 : 600000, // 10 minutes par défaut
    refetchInterval,
  });

  // React Query v5 : onSuccess/onError supprimés → effet de bord via useEffect
  useEffect(() => {
    if (data !== undefined && onSuccess) onSuccess(data);
  }, [data, onSuccess]);
  useEffect(() => {
    if (isError && error && onError) onError(error as Error);
  }, [isError, error, onError]);

  // Invalider le cache manuellement si nécessaire
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [cacheKey] });
  }, [queryClient, cacheKey]);

  // Précharger les données
  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: [cacheKey, dataSource.params],
      queryFn: async () => {
        const url = new URL(dataSource.endpoint, window.location.origin);
        if (dataSource.params) {
          Object.entries(dataSource.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value));
            }
          });
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Failed to prefetch ${dataSource.endpoint}`);
        }
        return response.json();
      },
      staleTime: dataSource.cache?.ttl || 300000,
    });
  }, [queryClient, cacheKey, dataSource]);

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    invalidateCache,
    prefetch,
  };
}

/**
 * Hook pour charger plusieurs sources de données en parallèle
 */
export function useMultipleAnalyticsData<T extends Record<string, any>>(
  dataSources: Record<keyof T, DataSourceConfig>,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const results: Record<string, ReturnType<typeof useAnalyticsData>> = {} as any;

  Object.entries(dataSources).forEach(([key, config]) => {
    results[key] = useAnalyticsData({
      dataSource: config,
      enabled: options?.enabled,
      refetchInterval: options?.refetchInterval,
    });
  });

  const isLoading = Object.values(results).some((result) => result.isLoading);
  const isError = Object.values(results).some((result) => result.isError);
  const errors = Object.fromEntries(
    Object.entries(results)
      .filter(([_, result]) => result.isError)
      .map(([key, result]) => [key, result.error])
  );

  const refetchAll = useCallback(() => {
    Object.values(results).forEach((result) => result.refetch());
  }, [results]);

  const invalidateAll = useCallback(() => {
    Object.values(results).forEach((result) => result.invalidateCache());
  }, [results]);

  return {
    ...results,
    isLoading,
    isError,
    errors,
    refetchAll,
    invalidateAll,
  };
}

