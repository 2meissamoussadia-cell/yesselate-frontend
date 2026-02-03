/**
 * Hooks React Query pour le module Pre projet
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pre-projetApi } from '@/lib/api/pre-projet';

const QUERY_KEY = ['pre-projet'];

export function usePreProjets(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params],
    queryFn: () => pre-projetApi.getPreProjets(params),
  });
}

export function usePreProjet(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => pre-projetApi.getPreProjet(id!),
    enabled: !!id,
  });
}

export function useCreatePreProjet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => pre-projetApi.createPreProjet(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdatePreProjet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      pre-projetApi.updatePreProjet(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [...QUERY_KEY, id] }),
  });
}

export function useDeletePreProjet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pre-projetApi.deletePreProjet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
