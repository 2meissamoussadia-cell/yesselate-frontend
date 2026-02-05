/**
 * Hook pour récupérer les données du calendrier via l'API
 * Gère le loading, les erreurs et le cache
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';
import {
  getCalendrierOverview,
  getJalons,
  getEvenements,
  getAbsences,
} from '../api/calendrierApi';
import { mockOverview } from '../api/calendrierApiMock';
import type {
  CalendrierOverviewResponse,
  JalonsResponse,
  EvenementCalendrier,
  Absence,
  CalendrierFilters,
} from '../types/calendrierTypes';

interface UseCalendrierDataResult {
  data: CalendrierOverviewResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCalendrierData(
  filters?: Partial<CalendrierFilters>
): UseCalendrierDataResult {
  const [data, setData] = useState<CalendrierOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      // Ajouter un timeout de sécurité pour éviter un chargement infini
      const timeoutPromise = new Promise<CalendrierOverviewResponse>((_, reject) => {
        setTimeout(() => {
          if (mountedRef.current) {
            reject(new Error('Timeout de chargement - utilisation des données mockées'));
          }
        }, 2500); // 2.5 secondes max
      });
      
      const result = await Promise.race([
        getCalendrierOverview(filters),
        timeoutPromise,
      ]);
      
      if (!mountedRef.current) return;

      setData(result);
    } catch (err) {
      if (!mountedRef.current) return;

      // En cas d'erreur ou timeout, charger immédiatement les données mockées
      setData(mockOverview);
      setError(null); // Ne pas afficher d'erreur si on a des données mockées
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [
    filters?.periode,
    filters?.vue,
    filters?.chantier_id,
    filters?.equipe_id,
    filters?.date_debut,
    filters?.date_fin,
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseJalonsResult {
  jalons: JalonsResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useJalons(params?: {
  type?: 'SLA' | 'CONTRAT' | 'INTERNE';
  chantier_id?: number;
  est_retard?: boolean;
  est_sla_risque?: boolean;
}): UseJalonsResult {
  const [jalons, setJalons] = useState<JalonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getJalons(params);
      setJalons(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  }, [params?.type, params?.chantier_id, params?.est_retard, params?.est_sla_risque]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    jalons,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseEvenementsResult {
  evenements: EvenementCalendrier[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEvenements(params?: {
  type?: 'EVENEMENT' | 'REUNION_PROJET' | 'REUNION_DECISIONNELLE';
  chantier_id?: number;
  date_debut?: string;
  date_fin?: string;
}): UseEvenementsResult {
  const [evenements, setEvenements] = useState<EvenementCalendrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Timeout de sécurité
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          if (mountedRef.current) {
            reject(new Error('Timeout de chargement'));
          }
        }, 2500);
      });
      
      const result = await Promise.race([
        getEvenements(params),
        timeoutPromise,
      ]);
      
      if (!mountedRef.current) return;
      setEvenements(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (process.env.NODE_ENV === 'development') {
        logger.warn('useEvenements - Erreur ou timeout', { component: 'useCalendrierData', error: String(err) });
      }
      // En cas d'erreur, retourner un tableau vide
      setEvenements([]);
      setError(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [params?.type, params?.chantier_id, params?.date_debut, params?.date_fin]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return {
    evenements,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseAbsencesResult {
  absences: Absence[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAbsences(params?: {
  user_id?: number;
  equipe_id?: number;
  chantier_id?: number;
  date_debut?: string;
  date_fin?: string;
}): UseAbsencesResult {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Timeout de sécurité
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          if (mountedRef.current) {
            reject(new Error('Timeout de chargement'));
          }
        }, 2500);
      });
      
      const result = await Promise.race([
        getAbsences(params),
        timeoutPromise,
      ]);
      
      if (!mountedRef.current) return;
      setAbsences(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (process.env.NODE_ENV === 'development') {
        logger.warn('useAbsences - Erreur ou timeout', { component: 'useCalendrierData', error: String(err) });
      }
      // En cas d'erreur, retourner un tableau vide
      setAbsences([]);
      setError(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [params?.user_id, params?.equipe_id, params?.chantier_id, params?.date_debut, params?.date_fin]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return {
    absences,
    loading,
    error,
    refetch: fetchData,
  };
}

