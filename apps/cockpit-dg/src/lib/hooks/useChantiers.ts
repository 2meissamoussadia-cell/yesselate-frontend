'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  endpoints,
  type Chantier,
  type ChantiersListResponse,
  type FilterChantiersParams,
} from '@/lib/api/endpoints';

const chantiersKeys = {
  all: ['chantiers'] as const,
  list: (params?: FilterChantiersParams) =>
    [...chantiersKeys.all, 'list', params] as const,
  detail: (id: string) => [...chantiersKeys.all, 'detail', id] as const,
  live: (id: string) => [...chantiersKeys.all, 'live', id] as const,
};

export function useChantiersList(params?: FilterChantiersParams) {
  return useQuery({
    queryKey: chantiersKeys.list(params),
    queryFn: () => endpoints.chantiers.list(params),
  });
}

export function useChantier(id: string | null, enabled = true) {
  return useQuery({
    queryKey: chantiersKeys.detail(id ?? ''),
    queryFn: () => endpoints.chantiers.get(id!),
    enabled: enabled && !!id,
  });
}

export function useChantierLive(id: string | null, enabled = true) {
  return useQuery({
    queryKey: chantiersKeys.live(id ?? ''),
    queryFn: () => endpoints.chantiers.getLive(id!),
    enabled: enabled && !!id,
  });
}

export function useCreateChantier(
  options?: UseMutationOptions<Chantier, Error, Record<string, unknown>>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => endpoints.chantiers.create(data),
    onSuccess: (_, __, ctx) => {
      queryClient.invalidateQueries({ queryKey: chantiersKeys.all });
    },
    ...options,
  });
}

export function useUpdateChantier(
  options?: UseMutationOptions<Chantier, Error, { id: string; data: Record<string, unknown> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => endpoints.chantiers.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: chantiersKeys.detail(id) });
      const previous = queryClient.getQueryData<Chantier>(chantiersKeys.detail(id));
      queryClient.setQueryData<Chantier>(chantiersKeys.detail(id), (old) =>
        old ? { ...old, ...data } : undefined
      );
      return { previous };
    },
    onError: (_, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(chantiersKeys.detail(id), context.previous);
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: chantiersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: chantiersKeys.all });
    },
    ...options,
  });
}

export function useRemoveChantier(
  options?: UseMutationOptions<Chantier, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => endpoints.chantiers.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chantiersKeys.all });
    },
    ...options,
  });
}

export type { Chantier, ChantiersListResponse, FilterChantiersParams };
