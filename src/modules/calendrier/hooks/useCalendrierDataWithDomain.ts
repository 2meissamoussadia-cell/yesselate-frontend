/**
 * Hook amélioré pour récupérer les données calendrier avec services domain
 * Combine API calls, adaptateurs et services domain
 */

import { useEffect, useState, useMemo } from 'react';
import {
  getCalendrierOverview,
  getEvenements,
  getJalons,
  getAbsences,
  getAffectations,
  getCalendrierAlertes,
} from '../api/calendrierApi';
import {
  adaptCalendrierData,
  adaptCalendrierOverview,
} from '@/domain/calendrier/adapters';
import { useCalendrierService } from '@/hooks/useCalendrierService';
import { logger } from '@/lib/utils/logger';
import type { CalendrierFilters } from '../types/calendrierTypes';
import type { CalendrierData } from '@/domain/calendrier/types';

/**
 * Hook pour récupérer les données calendrier avec services domain
 * Utilise les adaptateurs et services pour calculer les métriques
 */
export function useCalendrierDataWithDomain(filters?: Partial<CalendrierFilters>) {
  const [apiOverview, setApiOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Adapter les données API vers format Domain
  const domainData: CalendrierData | null = useMemo(() => {
    if (!apiOverview) return null;

    try {
      return adaptCalendrierData(
        apiOverview.evenements || [],
        apiOverview.jalons || [],
        apiOverview.absences || [],
        apiOverview.affectations || [],
        apiOverview.alertes || []
      );
    } catch (err) {
      logger.error('Erreur adaptation calendrier', err instanceof Error ? err : undefined, { component: 'useCalendrierDataWithDomain' });
      return null;
    }
  }, [apiOverview]);

  // Utiliser le service domain pour les calculs
  const domainService = useCalendrierService(domainData);

  // Fetch des données API
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Récupérer overview qui contient toutes les données
        const overview = await getCalendrierOverview(filters);

        if (!cancelled) {
          setApiOverview(overview);
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
  }, [filters?.periode, filters?.chantier_id, filters?.date_debut, filters?.date_fin]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const overview = await getCalendrierOverview(filters);
      setApiOverview(overview);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  // Adapter overview pour compatibilité
  const adaptedOverview = useMemo(() => {
    if (!apiOverview) return null;
    return adaptCalendrierOverview(apiOverview);
  }, [apiOverview]);

  return {
    // Données brutes API (pour compatibilité)
    data: apiOverview,
    overview: adaptedOverview,
    
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
