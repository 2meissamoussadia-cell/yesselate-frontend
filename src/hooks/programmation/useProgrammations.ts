/**
 * Hooks React Query pour le module Programmation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programmationApi } from '@/lib/api/programmation';

const QUERY_KEY = ['programmation'];

export function useProgrammations(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params],
    queryFn: () => programmationApi.getProgrammations(params),
  });
}

export function useProgrammation(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => programmationApi.getProgrammation(id!),
    enabled: !!id,
  });
}

export function useCreateProgrammation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => programmationApi.createProgrammation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateProgrammation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      programmationApi.updateProgrammation(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [...QUERY_KEY, id] }),
  });
}

export function useDeleteProgrammation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programmationApi.deleteProgrammation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
