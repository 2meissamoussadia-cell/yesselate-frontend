/**
 * Hook useAlerteMutations — Create, update, delete, traiter, assigner
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsBtpApi } from '@/lib/api/alerts-btp';
import type { AlerteBTP } from '@/lib/types/alerts-btp.types';
import { toast } from 'sonner';

export function useCreateAlerte() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AlerteBTP>) => alertsBtpApi.createAlerte(data),
    onSuccess: (newAlerte) => {
      qc.invalidateQueries({ queryKey: ['alertes-btp'] });
      toast.success('Alerte créée', { description: newAlerte.numero });
    },
    onError: (e) => {
      toast.error('Erreur création', { description: (e as Error).message });
    },
  });
}

export function useUpdateAlerte() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlerteBTP> }) =>
      alertsBtpApi.updateAlerte(id, data),
    onSuccess: (updated, { id }) => {
      qc.invalidateQueries({ queryKey: ['alertes-btp'] });
      qc.setQueryData(['alerte-btp', id], updated);
      toast.success('Alerte mise à jour');
    },
    onError: (e) => {
      toast.error('Erreur mise à jour', { description: (e as Error).message });
    },
  });
}

export function useDeleteAlerte() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsBtpApi.deleteAlerte(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertes-btp'] });
      toast.success('Alerte supprimée');
    },
    onError: (e) => {
      toast.error('Erreur suppression', { description: (e as Error).message });
    },
  });
}

export function useTraiterAlerte() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      alertsBtpApi.traiterAlerte(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertes-btp'] });
      toast.success('Alerte traitée');
    },
  });
}

export function useAssignerAlerte() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      alertsBtpApi.assignerAlerte(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertes-btp'] });
      toast.success('Alerte assignée');
    },
  });
}
