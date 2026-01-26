/**
 * Hook pour charger et afficher une vue depuis le registry
 * Gère le cache et le chargement des données via le store Zustand
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardRegistry, navToKey, type NavKey } from './index';
import type { ViewEntry } from '../types/dashboard';
import type { DashboardViewData } from '../types/dashboardDataTypes';
import { createLogger } from '../utils/logger';

const logger = createLogger('useDashboardView');

export function useDashboardView() {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);
  const cache = useDashboardCommandCenterStore((state) => state.cache);
  const setCache = useDashboardCommandCenterStore((state) => state.setCache);
  
  const navKey: NavKey = useMemo(() => ({
    main: navigation.mainCategory || 'overview',
    sub: navigation.subCategory || null,
    leaf: navigation.subSubCategory || null,
  }), [navigation.mainCategory, navigation.subCategory, navigation.subSubCategory]);

  const key = useMemo(() => navToKey(navKey), [navKey]);
  const entry = useMemo(() => dashboardRegistry[key], [key]);

  const [data, setData] = useState<DashboardViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!entry) {
      setData(null);
      const err = new Error(`Vue non trouvée pour la clé: ${key}`);
      logger.error('View not found', { key, navKey, action: 'loadView' }, err);
      setError(err);
      return;
    }

    // Vérifier le cache depuis le store
    const cached = cache[key];
    const now = Date.now();
    
    if (cached && (now - cached.fetchedAt) < (cached.ttl || 60_000)) {
      logger.dataLoad(key, true, { action: 'cacheHit', navKey });
      setData(cached.data as DashboardViewData);
      setError(null);
      return;
    }

    // Si pas de loader, vue pure
    if (!entry.loader) {
      logger.debug('View without loader (pure view)', { key, navKey });
      setData({} as DashboardViewData);
      setError(null);
      return;
    }

    // Charger les données
    setLoading(true);
    setError(null);
    
    entry.loader(navKey)
      .then((result) => {
        // Mettre en cache dans le store
        setCache(key, {
          data: result.data,
          fetchedAt: result.fetchedAt,
          ttl: entry.ttl || 60_000,
        });
        logger.dataLoad(key, true, { action: 'apiLoad', navKey });
        setData(result.data as DashboardViewData);
        setError(null);
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Failed to load view data', { key, navKey, action: 'loadView' }, error);
        setError(error);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, entry, navKey, cache, setCache, logger]);

  return {
    entry,
    data,
    loading,
    error,
    navKey,
  };
}

