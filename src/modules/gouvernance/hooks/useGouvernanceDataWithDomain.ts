/**
 * Hook amélioré pour récupérer les données de gouvernance avec services domain
 * Combine API calls, adaptateurs et services domain pour une architecture propre
 */

import { useEffect, useState, useMemo } from 'react';
import { useGouvernanceFilters } from './useGouvernanceFilters';
import {
  getGouvernanceOverview,
  getTendancesMensuelles,
  getSyntheseProjets,
  getSyntheseBudget,
  getSyntheseJalons,
  getSyntheseRisques,
  getSyntheseValidations,
} from '../api/gouvernanceApi';
import {
  adaptGouvernanceData,
  adaptGouvernanceOverview,
  adaptTendanceMensuelle,
} from '@/domain/gouvernance/adapters';
import { useGouvernanceService } from '@/hooks/useGouvernanceService';
import { logger } from '@/lib/utils/logger';
import type { GouvernanceSection } from '../types/gouvernanceTypes';
import type { GouvernanceData } from '@/domain/gouvernance/types';

/**
 * Hook principal pour récupérer les données avec services domain
 * Utilise les adaptateurs pour convertir API → Domain, puis les services pour les calculs
 */
export function useGouvernanceDataWithDomain(section: GouvernanceSection) {
  const { getFilters } = useGouvernanceFilters();
  const [apiData, setApiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filters = getFilters();

  // Adapter les données API vers format Domain
  const domainData: GouvernanceData | null = useMemo(() => {
    if (!apiData) return null;

    try {
      switch (section) {
        case 'executive-dashboard':
          // Pour overview, on a besoin des données complètes
          if (apiData.projets && apiData.budgets && apiData.jalons) {
            return adaptGouvernanceData(
              apiData,
              apiData.projets || [],
              apiData.budgets || [],
              apiData.jalons || [],
              apiData.risques || [],
              apiData.validations || []
            );
          }
          return null;

        case 'synthese-projets':
          return adaptGouvernanceData(
            apiData,
            apiData.data || [],
            [],
            [],
            [],
            []
          );

        case 'synthese-budget':
          return adaptGouvernanceData(
            apiData,
            [],
            apiData.data || [],
            [],
            [],
            []
          );

        case 'synthese-jalons':
          return adaptGouvernanceData(
            apiData,
            [],
            [],
            apiData.data || [],
            [],
            []
          );

        case 'synthese-risques':
          return adaptGouvernanceData(
            apiData,
            [],
            [],
            [],
            apiData.data || [],
            []
          );

        case 'synthese-validations':
          return adaptGouvernanceData(
            apiData,
            [],
            [],
            [],
            [],
            apiData.data || []
          );

        default:
          return null;
      }
    } catch (err) {
      logger.error('Erreur adaptation gouvernance', err instanceof Error ? err : undefined, { component: 'useGouvernanceDataWithDomain' });
      return null;
    }
  }, [apiData, section]);

  // Utiliser le service domain pour les calculs
  const domainService = useGouvernanceService(domainData);

  // Fetch des données API
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        let result;

        switch (section) {
          case 'executive-dashboard':
            result = await getGouvernanceOverview(filters);
            break;
          case 'tendances':
            result = await getTendancesMensuelles(filters);
            break;
          case 'synthese-projets':
            result = await getSyntheseProjets(filters);
            break;
          case 'synthese-budget':
            result = await getSyntheseBudget(filters);
            break;
          case 'synthese-jalons':
            result = await getSyntheseJalons(filters);
            break;
          case 'synthese-risques':
            result = await getSyntheseRisques(filters);
            break;
          case 'synthese-validations':
            result = await getSyntheseValidations(filters);
            break;
          default:
            result = null;
        }

        if (!cancelled) {
          setApiData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [section, filters.periode, filters.projet_id, filters.date_debut, filters.date_fin]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    const currentFilters = getFilters();

    try {
      let result;

      switch (section) {
        case 'executive-dashboard':
          result = await getGouvernanceOverview(currentFilters);
          break;
        case 'tendances':
          result = await getTendancesMensuelles(currentFilters);
          break;
        case 'synthese-projets':
          result = await getSyntheseProjets(currentFilters);
          break;
        case 'synthese-budget':
          result = await getSyntheseBudget(currentFilters);
          break;
        case 'synthese-jalons':
          result = await getSyntheseJalons(currentFilters);
          break;
        case 'synthese-risques':
          result = await getSyntheseRisques(currentFilters);
          break;
        case 'synthese-validations':
          result = await getSyntheseValidations(currentFilters);
          break;
        default:
          result = null;
      }

      setApiData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Données brutes API (pour compatibilité)
    data: apiData,
    
    // Données adaptées Domain
    domainData,
    
    // Services domain avec calculs
    ...domainService,
    
    // États
    isLoading,
    error,
    refetch,
  };
}
