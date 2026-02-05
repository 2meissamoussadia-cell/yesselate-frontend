/**
 * Hook useAlertes — Fetch alertes BTP avec React Query
 * v2: Meilleure gestion des erreurs
 */

import { useQuery } from '@tanstack/react-query';
import { alertsBtpApi } from '@/lib/api/alerts-btp';
import { logger } from '@/lib/utils/logger';
import type { AlerteFilters, AlerteSort } from '@/lib/types/alerts-btp.types';

export function useAlertes(params?: {
  filters?: AlerteFilters;
  sort?: AlerteSort;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['alertes-btp', params],
    queryFn: async () => {
      try {
        return await alertsBtpApi.getAlertes(params);
      } catch (error) {
        logger.error('Erreur chargement alertes', error instanceof Error ? error : undefined, { component: 'useAlertes' });
        // Retourner une structure vide en cas d'erreur
        return {
          data: [],
          total: 0,
          page: 1,
          totalPages: 1,
        };
      }
    },
    staleTime: 30000,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useAlerte(id: string | null) {
  return useQuery({
    queryKey: ['alerte-btp', id],
    queryFn: () => (id ? alertsBtpApi.getAlerte(id) : Promise.reject(new Error('No id'))),
    enabled: !!id,
    staleTime: 30000,
  });
}
