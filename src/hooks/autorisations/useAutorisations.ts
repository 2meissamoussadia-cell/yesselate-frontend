/**
 * Hooks React Query pour le module Autorisations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { autorisationsApi } from '@/lib/api/autorisations';

const QUERY_KEY = ['autorisations'];

export function useAutorisations(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params],
    queryFn: () => autorisationsApi.getAutorisations(params),
  });
}

export function useAutorisation(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => autorisationsApi.getAutorisation(id!),
    enabled: !!id,
  });
}

export function useCreateAutorisations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => autorisationsApi.createAutorisations(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateAutorisations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      autorisationsApi.updateAutorisations(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [...QUERY_KEY, id] }),
  });
}

export function useDeleteAutorisations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => autorisationsApi.deleteAutorisations(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
