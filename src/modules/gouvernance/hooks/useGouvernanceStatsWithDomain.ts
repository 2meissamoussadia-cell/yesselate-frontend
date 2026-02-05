/**
 * Hook amélioré pour récupérer les statistiques avec services domain
 * Combine API calls, adaptateurs et services domain
 */

import { useEffect, useState, useMemo } from 'react';
import { getGouvernanceStats, getGouvernanceOverview } from '../api/gouvernanceApi';
import { useGouvernanceFiltersStore } from '../stores/gouvernanceFiltersStore';
import {
  adaptGouvernanceStats,
  adaptGouvernanceData,
  adaptGouvernanceOverview,
} from '@/domain/gouvernance/adapters';
import { useGouvernanceService } from '@/hooks/useGouvernanceService';
import { logger } from '@/lib/utils/logger';
import type { GouvernanceStats as ApiGouvernanceStats } from '../types/gouvernanceTypes';
import type { GouvernanceStats as DomainGouvernanceStats } from '@/domain/gouvernance/types';

/**
 * Hook pour récupérer les stats avec services domain
 * Utilise les adaptateurs et services pour calculer les stats depuis les données complètes
 */
export function useGouvernanceStatsWithDomain() {
  const { getFilters, stats: apiStats, setStats } = useGouvernanceFiltersStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);

  const filters = getFilters();

  // Adapter les stats API vers Domain
  const domainStats: DomainGouvernanceStats | null = useMemo(() => {
    if (!apiStats) return null;
    return adaptGouvernanceStats(apiStats);
  }, [apiStats]);

  // Adapter les données complètes pour les services
  const domainData = useMemo(() => {
    if (!overviewData) return null;
    
    try {
      return adaptGouvernanceData(
        overviewData,
        overviewData.projets || [],
        overviewData.budgets || [],
        overviewData.jalons || [],
        overviewData.risques || [],
        overviewData.validations || []
      );
    } catch (err) {
      logger.error('Erreur adaptation gouvernance', err instanceof Error ? err : undefined, { component: 'useGouvernanceStatsWithDomain' });
      return null;
    }
  }, [overviewData]);

  // Utiliser le service domain pour les calculs
  const domainService = useGouvernanceService(domainData);

  // Fetch des stats API
  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError(null);

      try {
        // Récupérer stats et overview en parallèle
        const [statsResult, overviewResult] = await Promise.all([
          getGouvernanceStats(filters),
          getGouvernanceOverview(filters),
        ]);

        if (!cancelled) {
          setStats(statsResult);
          setOverviewData(overviewResult);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Erreur inconnue'));
          // En cas d'erreur, récupérer au moins l'overview mockée pour afficher des indicateurs
          import('../api/gouvernanceApiMock').then(({ mockStats, mockOverview }) => {
            if (!cancelled) {
              setStats(mockStats);
              setOverviewData(mockOverview);
            }
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [filters.periode, filters.projet_id, filters.date_debut, filters.date_fin, setStats]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    const currentFilters = getFilters();

    try {
      const [statsResult, overviewResult] = await Promise.all([
        getGouvernanceStats(currentFilters),
        getGouvernanceOverview(currentFilters),
      ]);

      setStats(statsResult);
      setOverviewData(overviewResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Stats API (pour compatibilité)
    stats: apiStats,
    
    // Stats adaptées Domain
    domainStats,
    
    // Services domain avec calculs avancés
    ...domainService,
    
    // États
    isLoading,
    error,
    refetch,
  };
}
