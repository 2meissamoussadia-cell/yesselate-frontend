// ============================================
// Hook pour synchroniser automatiquement les données entre pages
// ============================================

import { useEffect, useCallback } from 'react';
import { useNavigationStore } from '@/lib/stores';
import { logger } from '@/lib/utils/logger';
import type { PageCounts } from '@/lib/services/navigation.service';

/**
 * Hook pour synchroniser automatiquement les comptages de page
 * Utilisé pour mettre à jour les badges de la sidebar
 */
export function useAutoSyncCounts(
  pageId: string,
  getCount: () => number | Promise<number>,
  options?: { 
    interval?: number; // Intervalle de rafraîchissement en ms
    immediate?: boolean; // Exécuter immédiatement
  }
) {
  const { updatePageCount } = useNavigationStore();
  const interval = options?.interval || 30000; // 30s par défaut

  const syncCount = useCallback(async () => {
    try {
      const count = await getCount();
      updatePageCount(pageId, count);
    } catch (error) {
      logger.error(`Erreur lors de la synchronisation du comptage pour ${pageId}`, error instanceof Error ? error : undefined, { component: 'useAutoSyncCounts', pageId });
    }
  }, [pageId, getCount, updatePageCount]);

  useEffect(() => {
    // Synchronisation immédiate
    if (options?.immediate !== false) {
      // Délai pour éviter les problèmes d'hydratation
      setTimeout(() => {
        syncCount();
      }, 100);
    }

    // Synchronisation périodique
    const intervalId = setInterval(syncCount, interval);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, options?.immediate]); // Retirer syncCount des dépendances pour éviter les re-créations
}

/**
 * Hook pour synchroniser plusieurs comptages en une fois
 */
export function useAutoSyncMultipleCounts(
  countsMap: Record<string, () => number | Promise<number>>,
  options?: { interval?: number; immediate?: boolean }
) {
  const { updatePageCounts } = useNavigationStore();
  const interval = options?.interval || 30000;

  const syncAllCounts = useCallback(async () => {
    try {
      const counts: PageCounts = {};
      const promises = Object.entries(countsMap).map(async ([pageId, getCount]) => {
        try {
          const count = await getCount();
          counts[pageId] = count;
        } catch (error) {
          logger.error(`Erreur lors de la synchronisation pour ${pageId}`, error instanceof Error ? error : undefined, { component: 'useAutoSyncMultipleCounts', pageId });
        }
      });
      
      await Promise.all(promises);
      updatePageCounts(counts);
    } catch (error) {
      logger.error('Erreur lors de la synchronisation des comptages', error instanceof Error ? error : undefined, { component: 'useAutoSyncMultipleCounts' });
    }
  }, [countsMap, updatePageCounts]);

  useEffect(() => {
    if (options?.immediate !== false) {
      syncAllCounts();
    }

    const intervalId = setInterval(syncAllCounts, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [syncAllCounts, interval, options?.immediate]);
}

