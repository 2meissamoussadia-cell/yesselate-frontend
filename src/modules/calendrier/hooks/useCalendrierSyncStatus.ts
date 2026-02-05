/**
 * Hook pour récupérer l'état de synchronisation des modules
 * Utilisé par le Poste de contrôle Calendrier
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';
import { getSyncStatus } from '../api/calendrierApi';
import { mockSyncStatus } from '../api/calendrierApiMock';
import type { SyncStatus } from '../types/calendrierTypes';

interface UseCalendrierSyncStatusResult {
  statuts: SyncStatus[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCalendrierSyncStatus(): UseCalendrierSyncStatusResult {
  const [statuts, setStatuts] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ajouter un timeout de sécurité
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          if (mountedRef.current) {
            reject(new Error('Timeout de chargement'));
          }
        }, 2500);
      });
      
      const response = await Promise.race([
        getSyncStatus(),
        timeoutPromise,
      ]);
      
      if (!mountedRef.current) return;
      setStatuts(response.statuts);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (process.env.NODE_ENV === 'development') {
        logger.warn('useCalendrierSyncStatus - Erreur ou timeout, utilisation des données mockées', { component: 'useCalendrierSyncStatus', error: String(err) });
      }
      // En cas d'erreur ou timeout, utiliser les données mockées
      setStatuts(mockSyncStatus.statuts);
      setError(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  return {
    statuts,
    loading,
    error,
    refetch: fetchData,
  };
}

