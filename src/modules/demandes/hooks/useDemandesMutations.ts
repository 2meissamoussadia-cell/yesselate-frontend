/**
 * Hooks de mutations pour le module Demandes
 * Utilise React Query pour gérer les mutations avec optimistic updates
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDemande,
  validateDemande,
  rejectDemande,
  requestComplementDemande,
  batchValidateDemandes,
  batchRejectDemandes,
} from '../api/demandesApi';
import type { Demande } from '../types/demandesTypes';
import { useToast } from '@/components/features/bmo/ToastProvider';

interface ValidateDemandeParams {
  id: string;
  comment?: string;
}

interface RejectDemandeParams {
  id: string;
  reason: string;
}

interface RequestComplementParams {
  id: string;
  message: string;
}

interface BatchActionParams {
  ids: string[];
  comment?: string;
  reason?: string;
}

interface UseDemandeMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface CreateDemandeParams {
  title: string;
  description?: string;
  service: Demande['service'];
  montant?: number;
}

/**
 * Hook pour créer une demande
 */
export function useCreateDemande(options?: UseDemandeMutationOptions) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateDemandeParams) => createDemande(data),
    onSuccess: (newDemande) => {
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      toast.success('Demande créée', { title: newDemande.reference });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur création');
      options?.onError?.(error);
    },
  });
}

/**
 * Hook pour valider une demande
 */
export function useValidateDemande(options?: UseDemandeMutationOptions) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: ValidateDemandeParams) => validateDemande(id, comment),
    
    // Optimistic update
    onMutate: async ({ id, comment }) => {
      // Annuler les refetch en cours
      await queryClient.cancelQueries({ queryKey: ['demandes'] });

      // Snapshot de la valeur précédente
      const previousDemandes = queryClient.getQueryData<Demande[]>(['demandes', 'list']);
      const previousDemande = queryClient.getQueryData<Demande>(['demandes', id]);

      // Mise à jour optimiste
      queryClient.setQueryData<Demande[]>(['demandes', 'list'], (old) => {
        if (!old) return old;
        return old.map((d) =>
          d.id === id ? { ...d, status: 'validated' as const } : d
        );
      });

      queryClient.setQueryData<Demande>(['demandes', id], (old) => {
        if (!old) return old;
        return { ...old, status: 'validated' as const };
      });

      // Invalider les queries par statut
      queryClient.invalidateQueries({ queryKey: ['demandes', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['demandes', 'stats'] });

      return { previousDemandes, previousDemande };
    },

    onSuccess: () => {
      // Invalider toutes les queries pour refresh
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      toast.success('Demande validée avec succès');
      options?.onSuccess?.();
    },

    onError: (error: Error, variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousDemandes) {
        queryClient.setQueryData(['demandes', 'list'], context.previousDemandes);
      }
      if (context?.previousDemande) {
        queryClient.setQueryData(['demandes', variables.id], context.previousDemande);
      }
      
      const errorMessage = error.message || 'Erreur lors de la validation';
      toast.error('Erreur', errorMessage);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook pour rejeter une demande
 */
export function useRejectDemande(options?: UseDemandeMutationOptions) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: RejectDemandeParams) => rejectDemande(id, reason),

    // Optimistic update
    onMutate: async ({ id, reason }) => {
      await queryClient.cancelQueries({ queryKey: ['demandes'] });

      const previousDemandes = queryClient.getQueryData<Demande[]>(['demandes', 'list']);
      const previousDemande = queryClient.getQueryData<Demande>(['demandes', id]);

      queryClient.setQueryData<Demande[]>(['demandes', 'list'], (old) => {
        if (!old) return old;
        return old.map((d) =>
          d.id === id ? { ...d, status: 'rejected' as const } : d
        );
      });

      queryClient.setQueryData<Demande>(['demandes', id], (old) => {
        if (!old) return old;
        return { ...old, status: 'rejected' as const };
      });

      queryClient.invalidateQueries({ queryKey: ['demandes', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['demandes', 'stats'] });

      return { previousDemandes, previousDemande };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      toast.success('Demande rejetée');
      options?.onSuccess?.();
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousDemandes) {
        queryClient.setQueryData(['demandes', 'list'], context.previousDemandes);
      }
      if (context?.previousDemande) {
        queryClient.setQueryData(['demandes', variables.id], context.previousDemande);
      }
      
      const errorMessage = error.message || 'Erreur lors du rejet';
      toast.error('Erreur', errorMessage);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook pour demander un complément
 */
export function useRequestComplement(options?: UseDemandeMutationOptions) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, message }: RequestComplementParams) => requestComplementDemande(id, message),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      toast.info('Complément demandé avec succès');
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      const errorMessage = error.message || 'Erreur lors de la demande de complément';
      toast.error('Erreur', errorMessage);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook pour valider plusieurs demandes en masse
 */
export function useBatchValidateDemandes(options?: UseDemandeMutationOptions) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ ids, comment }: BatchActionParams) => batchValidateDemandes(ids, comment),

    // Optimistic update
    onMutate: async ({ ids }) => {
      await queryClient.cancelQueries({ queryKey: ['demandes'] });

      const previousDemandes = queryClient.getQueryData<Demande[]>(['demandes', 'list']);

      queryClient.setQueryData<Demande[]>(['demandes', 'list'], (old) => {
        if (!old) return old;
        return old.map((d) =>
          ids.includes(d.id) ? { ...d, status: 'validated' as const } : d
        );
      });

      queryClient.invalidateQueries({ queryKey: ['demandes', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['demandes', 'stats'] });

      return { previousDemandes };
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      toast.success(`${variables.ids.length} demande(s) validée(s) avec succès`);
      options?.onSuccess?.();
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousDemandes) {
        queryClient.setQueryData(['demandes', 'list'], context.previousDemandes);
      }
      
      const errorMessage = error.message || 'Erreur lors de la validation en masse';
      toast.error('Erreur', errorMessage);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook pour rejeter plusieurs demandes en masse
 */
export function useBatchRejectDemandes(options?: UseDemandeMutationOptions) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ ids, reason }: BatchActionParams) => batchRejectDemandes(ids, reason),

    // Optimistic update
    onMutate: async ({ ids }) => {
      await queryClient.cancelQueries({ queryKey: ['demandes'] });

      const previousDemandes = queryClient.getQueryData<Demande[]>(['demandes', 'list']);

      queryClient.setQueryData<Demande[]>(['demandes', 'list'], (old) => {
        if (!old) return old;
        return old.map((d) =>
          ids.includes(d.id) ? { ...d, status: 'rejected' as const } : d
        );
      });

      queryClient.invalidateQueries({ queryKey: ['demandes', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['demandes', 'stats'] });

      return { previousDemandes };
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      toast.success(`${variables.ids.length} demande(s) rejetée(s)`);
      options?.onSuccess?.();
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousDemandes) {
        queryClient.setQueryData(['demandes', 'list'], context.previousDemandes);
      }
      
      const errorMessage = error.message || 'Erreur lors du rejet en masse';
      toast.error('Erreur', errorMessage);
      options?.onError?.(error);
    },
  });
}

