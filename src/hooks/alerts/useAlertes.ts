/**
 * Hook useAlertes — Fetch alertes BTP avec React Query
 */

import { useQuery } from '@tanstack/react-query';
import { alertsBtpApi } from '@/lib/api/alerts-btp';
import type { AlerteFilters, AlerteSort } from '@/lib/types/alerts-btp.types';

export function useAlertes(params?: {
  filters?: AlerteFilters;
  sort?: AlerteSort;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['alertes-btp', params],
    queryFn: () => alertsBtpApi.getAlertes(params),
    staleTime: 30000,
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
