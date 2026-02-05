/**
 * Hooks API pour les mutations (actions) sur les délégations
 * ===========================================================
 * 
 * Hooks pour créer, modifier, supprimer des délégations
 * avec optimistic updates et gestion d'erreurs.
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

// ============================================
// TYPES
// ============================================

export interface CreateDelegationData {
  type: string;
  bureau: string;
  agentName: string;
  actorName: string;
  delegatorName?: string;
  scope?: string;
  maxAmount?: number;
  startDate: string;
  endDate: string;
  constraints?: Record<string, any>;
}

export interface UpdateDelegationData {
  type?: string;
  scope?: string;
  maxAmount?: number;
  endDate?: string;
  constraints?: Record<string, any>;
}

export interface UseMutationResult<T = any> {
  execute: (data: T) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

// ============================================
// HOOK: useCreateDelegation
// ============================================

/**
 * Hook pour créer une nouvelle délégation
 * 
 * @example
 * ```typescript
 * const { execute, loading, error } = useCreateDelegation({
 *   onSuccess: (delegation) => {
 *     toast.success('Délégation créée !');
 *     navigate(`/delegations/${delegation.id}`);
 *   },
 * });
 * 
 * await execute({
 *   type: 'Validation',
 *   bureau: 'BMO',
 *   agentName: 'Dupont Jean',
 *   actorName: 'Martin Pierre',
 *   startDate: '2026-01-01',
 *   endDate: '2026-12-31',
 * });
 * ```
 */
export function useCreateDelegation(options?: {
  onSuccess?: (delegation: any) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<CreateDelegationData> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (data: CreateDelegationData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
    } catch (err: any) {
      logger.error('Erreur création délégation', err instanceof Error ? err : undefined, { component: 'useDelegationMutations' });
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, success, reset };
}

// ============================================
// HOOK: useUpdateDelegation
// ============================================

/**
 * Hook pour mettre à jour une délégation existante
 * 
 * @example
 * ```typescript
 * const { execute, loading } = useUpdateDelegation({
 *   onSuccess: () => toast.success('Mise à jour réussie !'),
 * });
 * 
 * await execute('DEL-2026-001', {
 *   maxAmount: 100000,
 *   endDate: '2026-12-31',
 * });
 * ```
 */
export function useUpdateDelegation(options?: {
  onSuccess?: (delegation: any) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<{ id: string; data: UpdateDelegationData }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ id, data }: { id: string; data: UpdateDelegationData }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/delegations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
    } catch (err: any) {
      logger.error('Erreur mise à jour délégation', err instanceof Error ? err : undefined, { component: 'useDelegationMutations' });
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, success, reset };
}

// ============================================
// HOOK: useRevokeDelegation
// ============================================

/**
 * Hook pour révoquer une délégation
 * 
 * @example
 * ```typescript
 * const { execute, loading } = useRevokeDelegation({
 *   onSuccess: () => toast.success('Délégation révoquée'),
 * });
 * 
 * await execute({ id: 'DEL-2026-001', reason: 'Changement de poste' });
 * ```
 */
export function useRevokeDelegation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}): UseMutationResult<{ id: string; reason?: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ id, reason }: { id: string; reason?: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/delegations/${id}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err: any) {
      logger.error('Erreur révocation délégation', err instanceof Error ? err : undefined, { component: 'useDelegationMutations' });
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, success, reset };
}

// ============================================
// HOOK: useSuspendDelegation
// ============================================

/**
 * Hook pour suspendre temporairement une délégation
 * 
 * @example
 * ```typescript
 * const { execute } = useSuspendDelegation({
 *   onSuccess: () => toast.warning('Délégation suspendue'),
 * });
 * 
 * await execute({ id: 'DEL-2026-001', reason: 'Audit en cours' });
 * ```
 */
export function useSuspendDelegation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}): UseMutationResult<{ id: string; reason?: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ id, reason }: { id: string; reason?: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/delegations/${id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err: any) {
      logger.error('Erreur suspension délégation', err instanceof Error ? err : undefined, { component: 'useDelegationMutations' });
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, success, reset };
}

// ============================================
// HOOK: useExtendDelegation
// ============================================

/**
 * Hook pour prolonger la durée d'une délégation
 * 
 * @example
 * ```typescript
 * const { execute } = useExtendDelegation({
 *   onSuccess: () => toast.success('Délégation prolongée !'),
 * });
 * 
 * await execute({ id: 'DEL-2026-001', newEndDate: '2027-06-30' });
 * ```
 */
export function useExtendDelegation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}): UseMutationResult<{ id: string; newEndDate: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ id, newEndDate }: { id: string; newEndDate: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/delegations/${id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEndDate }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err: any) {
      logger.error('Erreur prolongation délégation', err instanceof Error ? err : undefined, { component: 'useDelegationMutations' });
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, success, reset };
}

// ============================================
// HOOK: useBulkDelegationAction
// ============================================

/**
 * Hook pour effectuer une action en masse sur plusieurs délégations
 * 
 * @example
 * ```typescript
 * const { execute } = useBulkDelegationAction({
 *   onSuccess: (result) => toast.success(`${result.success} délégations traitées`),
 * });
 * 
 * await execute({
 *   action: 'extend',
 *   ids: ['DEL-001', 'DEL-002', 'DEL-003'],
 *   params: { newEndDate: '2027-12-31' },
 * });
 * ```
 */
export function useBulkDelegationAction(options?: {
  onSuccess?: (result: { success: number; failed: number; errors: string[] }) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<{ action: string; ids: string[]; params?: any }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ action, ids, params }: { action: string; ids: string[]; params?: any }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/delegations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids, params }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
    } catch (err: any) {
      logger.error('Erreur action bulk', err instanceof Error ? err : undefined, { component: 'useDelegationMutations' });
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, success, reset };
}

