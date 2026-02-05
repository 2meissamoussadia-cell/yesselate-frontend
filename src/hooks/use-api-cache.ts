/**
 * Hook pour gérer le cache API avec optimistic updates
 * Utilise localStorage pour la persistance
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // en millisecondes
}

interface CacheOptions {
  ttl?: number; // Time to live en millisecondes (défaut: 5min)
  staleWhileRevalidate?: boolean; // Retourner les données en cache pendant la revalidation
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function useAPICache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { ttl = DEFAULT_TTL, staleWhileRevalidate = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Lire depuis le cache
  const readCache = useCallback((): CacheEntry<T> | null => {
    try {
      const cached = localStorage.getItem(`api-cache:${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > entry.expiresIn;

      if (isExpired && !staleWhileRevalidate) {
        localStorage.removeItem(`api-cache:${key}`);
        return null;
      }

      return entry;
    } catch (e) {
      logger.error('Erreur lecture cache', e instanceof Error ? e : undefined, { component: 'useAPICache', key });
      return null;
    }
  }, [key, staleWhileRevalidate]);

  // Écrire dans le cache
  const writeCache = useCallback(
    (value: T) => {
      try {
        const entry: CacheEntry<T> = {
          data: value,
          timestamp: Date.now(),
          expiresIn: ttl,
        };
        localStorage.setItem(`api-cache:${key}`, JSON.stringify(entry));
      } catch (e) {
        logger.error('Erreur écriture cache', e instanceof Error ? e : undefined, { component: 'useAPICache', key });
      }
    },
    [key, ttl]
  );

  // Invalider le cache
  const invalidate = useCallback(() => {
    localStorage.removeItem(`api-cache:${key}`);
    setData(null);
  }, [key]);

  // Fetch avec cache
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      // Vérifier le cache d'abord
      if (!forceRefresh) {
        const cached = readCache();
        if (cached) {
          setData(cached.data);
          const isExpired = Date.now() - cached.timestamp > cached.expiresIn;

          // Si expiré mais staleWhileRevalidate, revalider en arrière-plan
          if (isExpired && staleWhileRevalidate) {
            setIsValidating(true);
            try {
              const fresh = await fetcher();
              setData(fresh);
              writeCache(fresh);
            } catch (e) {
              logger.error('Erreur revalidation', e instanceof Error ? e : undefined, { component: 'useAPICache', key });
            } finally {
              setIsValidating(false);
            }
          }

          return cached.data;
        }
      }

      // Pas de cache valide, fetch
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        setData(result);
        writeCache(result);
        return result;
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Erreur inconnue';
        setError(errorMsg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [readCache, writeCache, fetcher, staleWhileRevalidate]
  );

  // Optimistic update
  const mutate = useCallback(
    async (
      optimisticData: T,
      actualFetcher?: () => Promise<T>
    ): Promise<T | null> => {
      // Sauvegarder l'ancienne valeur
      const previousData = data;

      // Appliquer immédiatement les données optimistes
      setData(optimisticData);
      writeCache(optimisticData);

      // Si on a un fetcher pour les vraies données
      if (actualFetcher) {
        try {
          const actualData = await actualFetcher();
          setData(actualData);
          writeCache(actualData);
          return actualData;
        } catch (e) {
          // Rollback en cas d'erreur
          if (previousData) {
            setData(previousData);
            writeCache(previousData);
          }
          setError(e instanceof Error ? e.message : 'Erreur mutation');
          return null;
        }
      }

      return optimisticData;
    },
    [data, writeCache]
  );

  // Charger au montage
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    isValidating,
    refetch: () => fetchData(true),
    invalidate,
    mutate,
  };
}

