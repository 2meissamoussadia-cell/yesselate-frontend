'use client';

import { useState, useCallback } from 'react';
import type { Demand } from '@/lib/types/bmo.types';
import { logger } from '@/lib/utils/logger';

interface DemandsFilters {
  queue?: 'pending' | 'urgent' | 'validated' | 'rejected' | 'all';
  q?: string;
  limit?: number;
}

export function useDemandsDB() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // GET /api/demands - Liste toutes les demandes
  const fetchDemands = useCallback(async (filters?: DemandsFilters): Promise<Demand[]> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.queue && filters.queue !== 'all') params.append('queue', filters.queue);
      if (filters?.q) params.append('q', filters.q);
      if (filters?.limit) params.append('limit', String(filters.limit));

      const url = `/api/demands${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch demands: ${response.statusText}`);
      }

      const data = await response.json();
      return data.rows || data; // Support both { rows } and direct array
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // GET /api/demands/[id] - Récupérer une demande
  const fetchDemand = useCallback(async (id: string): Promise<Demand> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/demands/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch demand: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/demands - Créer une demande
  const createDemand = useCallback(async (demand: Partial<Demand>): Promise<Demand> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create demand: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/demands/[id]/validate - Valider une demande
  const validateDemand = useCallback(async (
    id: string,
    actorId: string,
    actorName: string,
    comment?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/demands/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId, actorName, comment }),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate demand: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Error validating demand', error, { component: 'useDemandsDB' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/demands/[id]/reject - Rejeter une demande
  const rejectDemand = useCallback(async (
    id: string,
    actorId: string,
    actorName: string,
    reason: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/demands/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId, actorName, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to reject demand: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Error rejecting demand', error, { component: 'useDemandsDB' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // PATCH /api/demands/[id] - Mettre à jour une demande
  const updateDemand = useCallback(async (
    id: string,
    updates: Partial<Demand>,
    actorId?: string,
    actorName?: string,
    comment?: string
  ): Promise<Demand | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/demands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, actorId, actorName, comment }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update demand: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Error updating demand', error, { component: 'useDemandsDB' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE /api/demands/[id] - Supprimer une demande
  const deleteDemand = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/demands/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete demand: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Error deleting demand', error, { component: 'useDemandsDB' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchDemands,
    fetchDemand,
    createDemand,
    validateDemand,
    rejectDemand,
    updateDemand,
    deleteDemand,
  };
}

