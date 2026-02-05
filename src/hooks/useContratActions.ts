/**
 * Hook pour centraliser toutes les actions sur les contrats
 * Gère validation, rejet, négociation, escalade, et actions groupées
 */

'use client';

import { useState, useCallback } from 'react';
import { useContratToast } from './useContratToast';
import { logger } from '@/lib/utils/logger';
import { contratsApiService, type ContratDecision } from '@/lib/services/contratsApiService';

export interface UseContratActionsReturn {
  // Actions individuelles
  validate: (id: string, decision: ContratDecision) => Promise<{ success: boolean; error?: any }>;
  reject: (id: string, reason: string) => Promise<{ success: boolean; error?: any }>;
  negotiate: (id: string, terms: string) => Promise<{ success: boolean; error?: any }>;
  escalate: (id: string, to: string, reason: string) => Promise<{ success: boolean; error?: any }>;
  
  // Actions groupées
  bulkValidate: (ids: string[], note?: string) => Promise<{ success: boolean; results?: any; error?: any }>;
  bulkReject: (ids: string[], reason: string) => Promise<{ success: boolean; results?: any; error?: any }>;
  bulkEscalate: (ids: string[], to: string, reason: string) => Promise<{ success: boolean; results?: any; error?: any }>;
  
  // États
  loading: boolean;
  bulkProgress: { current: number; total: number } | null;
}

const USER_PLACEHOLDER = { id: 'me', name: 'User', role: 'manager' };

export function useContratActions(): UseContratActionsReturn {
  const toast = useContratToast();
  const [loading, setLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  // ================================
  // Validation individuelle
  // ================================
  const validate = useCallback(async (id: string, decision: ContratDecision) => {
    try {
      setLoading(true);
      const notes = typeof decision === 'string' ? decision : decision.notes;
      await contratsApiService.validateContrat(id, notes, USER_PLACEHOLDER.id, USER_PLACEHOLDER.name, USER_PLACEHOLDER.role);
      toast.contratValidated(id);
      return { success: true };
    } catch (error) {
      logger.error('Erreur validation', error instanceof Error ? error : undefined, { component: 'useContratActions' });
      toast.actionError('validation');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ================================
  // Rejet individuel
  // ================================
  const reject = useCallback(async (id: string, reason: string) => {
    if (!reason || reason.trim().length < 10) {
      toast.missingData('Raison du rejet (minimum 10 caractères)');
      return { success: false, error: 'Raison invalide' };
    }

    try {
      setLoading(true);
      await contratsApiService.rejectContrat(id, reason, USER_PLACEHOLDER.id, USER_PLACEHOLDER.name, USER_PLACEHOLDER.role);
      toast.contratRejected(id);
      return { success: true };
    } catch (error) {
      logger.error('Erreur rejet', error instanceof Error ? error : undefined, { component: 'useContratActions' });
      toast.actionError('rejet');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ================================
  // Négociation individuelle
  // ================================
  const negotiate = useCallback(async (id: string, terms: string) => {
    if (!terms || terms.trim().length < 10) {
      toast.missingData('Termes de négociation (minimum 10 caractères)');
      return { success: false, error: 'Termes invalides' };
    }

    try {
      setLoading(true);
      await contratsApiService.negotiateContrat(id, terms, USER_PLACEHOLDER.id, USER_PLACEHOLDER.name, USER_PLACEHOLDER.role);
      toast.contratNegotiation(id);
      return { success: true };
    } catch (error) {
      logger.error('Erreur négociation', error instanceof Error ? error : undefined, { component: 'useContratActions' });
      toast.actionError('négociation');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ================================
  // Escalade individuelle
  // ================================
  const escalate = useCallback(async (id: string, to: string, reason: string) => {
    if (!to || !reason || reason.trim().length < 10) {
      toast.missingData('Destinataire et raison (minimum 10 caractères)');
      return { success: false, error: 'Données invalides' };
    }

    try {
      setLoading(true);
      await contratsApiService.escalateContrat(id, reason, to, USER_PLACEHOLDER.id, USER_PLACEHOLDER.name, USER_PLACEHOLDER.role);
      toast.contratEscalated(id);
      return { success: true };
    } catch (error) {
      logger.error('Erreur escalade', error instanceof Error ? error : undefined, { component: 'useContratActions' });
      toast.actionError('escalade');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ================================
  // Validation groupée
  // ================================
  const bulkValidate = useCallback(async (ids: string[], note?: string) => {
    if (!ids || ids.length === 0) {
      toast.selectionRequired();
      return { success: false, error: 'Aucun contrat sélectionné' };
    }

    try {
      setLoading(true);
      setBulkProgress({ current: 0, total: ids.length });

      // Simuler progression (dans la vraie vie, l'API renverrait des events)
      const results = [];
      for (let i = 0; i < ids.length; i++) {
        setBulkProgress({ current: i + 1, total: ids.length });
        
        // Appel API (mockée actuellement)
        await contratsApiService.validateContrat(ids[i], note || 'Validation groupée', USER_PLACEHOLDER.id, USER_PLACEHOLDER.name, USER_PLACEHOLDER.role);
        
        results.push({ id: ids[i], success: true });
        
        // Petit délai pour voir la progression
        await new Promise(r => setTimeout(r, 200));
      }

      toast.contratsValidated(ids.length);
      return { success: true, results };
    } catch (error) {
      logger.error('Erreur validation groupée', error instanceof Error ? error : undefined, { component: 'useContratActions' });
      toast.actionError('validation groupée');
      return { success: false, error };
    } finally {
      setLoading(false);
      setBulkProgress(null);
    }
  }, [toast]);

  // ================================
  // Rejet groupé
  // ================================
  const bulkReject = useCallback(async (ids: string[], reason: string) => {
    if (!ids || ids.length === 0) {
      toast.selectionRequired();
      return { success: false, error: 'Aucun contrat sélectionné' };
    }

    if (!reason || reason.trim().length < 10) {
      toast.missingData('Raison du rejet (minimum 10 caractères)');
      return { success: false, error: 'Raison invalide' };
    }

    try {
      setLoading(true);
      setBulkProgress({ current: 0, total: ids.length });

      const results = [];
      for (let i = 0; i < ids.length; i++) {
        setBulkProgress({ current: i + 1, total: ids.length });
        
        await contratsApiService.rejectContrat(ids[i], reason, USER_PLACEHOLDER.id, USER_PLACEHOLDER.name, USER_PLACEHOLDER.role);
        results.push({ id: ids[i], success: true });
        
        await new Promise(r => setTimeout(r, 200));
      }

      toast.contratsRejected(ids.length);
      return { success: true, results };
    } catch (error) {
      logger.error('Erreur rejet groupé', error instanceof Error ? error : undefined, { component: 'useContratActions' });
      toast.actionError('rejet groupé');
      return { success: false, error };
    } finally {
      setLoading(false);
      setBulkProgress(null);
    }
  }, [toast]);

  // ================================
  // Escalade groupée
  // ================================
  const bulkEscalate = useCallback(async (ids: string[], to: string, reason: string) => {
    if (!ids || ids.length === 0) {
      toast.selectionRequired();
      return { success: false, error: 'Aucun contrat sélectionné' };
    }

    if (!to || !reason || reason.trim().length < 10) {
      toast.missingData('Destinataire et raison (minimum 10 caractères)');
      return { success: false, error: 'Données invalides' };
    }

    try {
      setLoading(true);
      setBulkProgress({ current: 0, total: ids.length });

      const results = [];
      for (let i = 0; i < ids.length; i++) {
        setBulkProgress({ current: i + 1, total: ids.length });
        
        await contratsApiService.escalateContrat(ids[i], reason, to, USER_PLACEHOLDER.id, USER_PLACEHOLDER.name, USER_PLACEHOLDER.role);
        results.push({ id: ids[i], success: true });
        
        await new Promise(r => setTimeout(r, 200));
      }

      toast.contratsEscalated(ids.length);
      return { success: true, results };
    } catch (error) {
      logger.error('Erreur escalade groupée', error instanceof Error ? error : undefined, { component: 'useContratActions' });
      toast.actionError('escalade groupée');
      return { success: false, error };
    } finally {
      setLoading(false);
      setBulkProgress(null);
    }
  }, [toast]);

  return {
    validate,
    reject,
    negotiate,
    escalate,
    bulkValidate,
    bulkReject,
    bulkEscalate,
    loading,
    bulkProgress,
  };
}

