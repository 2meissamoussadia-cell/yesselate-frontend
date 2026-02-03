/**
 * Hooks React Query pour le module Foncier
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foncierApi } from '@/lib/api/foncier';

const QUERY_KEY = ['foncier'];

export function useFonciers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params],
    queryFn: () => foncierApi.getFonciers(params),
  });
}

export function useFoncier(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => foncierApi.getFoncier(id!),
    enabled: !!id,
  });
}

export function useCreateFoncier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => foncierApi.createFoncier(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateFoncier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      foncierApi.updateFoncier(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [...QUERY_KEY, id] }),
  });
}

export function useDeleteFoncier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foncierApi.deleteFoncier(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
