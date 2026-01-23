/**
 * Hook pour gérer le filtre de recherche des KPIs
 * Persiste le filtre dans localStorage
 * Fournit un filtre debounced pour optimiser les performances
 * Supporte le filtrage d'items avec une fonction de filtrage personnalisée
 */

'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseKPIFilterOptions<T = any> {
  initialFilter?: string;
  debounceMs?: number;
  storageKey?: string;
  items?: T[];
  filterFn?: (item: T, filter: string) => boolean;
}

interface UseKPIFilterReturn<T = any> {
  filter: string;
  setKpiFilter: (filter: string) => void;
  debouncedFilter: string;
  updateFilter: (filter: string) => void;
  clearFilter: () => void;
  filteredItems?: T[];
  filteredCount?: number;
  totalCount?: number;
  // Compatibilité avec l'ancienne API
  kpiFilter: string;
  debouncedKpiFilter: string;
}

export function useKPIFilter<T = any>({
  initialFilter = '',
  debounceMs = 200,
  storageKey = 'dashboard-kpi-filter',
  items,
  filterFn,
}: UseKPIFilterOptions<T> = {}): UseKPIFilterReturn<T> {
  // Initialiser depuis localStorage si disponible
  const [kpiFilter, setKpiFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(storageKey) || initialFilter;
      } catch (error) {
        // localStorage peut être désactivé ou plein
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useKPIFilter] Erreur lors de la lecture de localStorage:', error);
        }
        return initialFilter;
      }
    }
    return initialFilter;
  });

  // Debounce pour le filtre de recherche KPI (optimisation performance)
  const [debouncedKpiFilter, setDebouncedKpiFilter] = useState(kpiFilter);

  // Persister le filtre dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (kpiFilter) {
          localStorage.setItem(storageKey, kpiFilter);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        // localStorage peut être désactivé ou plein
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useKPIFilter] Erreur lors de l\'écriture dans localStorage:', error);
        }
      }
    }
  }, [kpiFilter, storageKey]);

  // Debounce du filtre
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKpiFilter(kpiFilter);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [kpiFilter, debounceMs]);

  // Filtrer les items si items et filterFn sont fournis
  const filteredItems = useMemo(() => {
    // Si items n'est pas fourni ou est undefined, retourner undefined
    if (!items) {
      return undefined;
    }
    
    // Si filterFn n'est pas fourni, retourner items tel quel
    if (!filterFn) {
      return undefined;
    }
    
    // Si le filtre est vide, retourner tous les items
    if (!debouncedKpiFilter.trim()) {
      return items;
    }
    
    // Filtrer les items avec la fonction de filtrage
    return items.filter(item => filterFn(item, debouncedKpiFilter));
  }, [items, filterFn, debouncedKpiFilter]);

  // Calculer les statistiques
  const filteredCount = useMemo(() => {
    return filteredItems?.length ?? undefined;
  }, [filteredItems]);

  const totalCount = useMemo(() => {
    return items?.length ?? undefined;
  }, [items]);

  // Fonction pour effacer le filtre
  const clearFilter = useMemo(
    () => () => {
      setKpiFilter('');
    },
    []
  );

  return {
    filter: kpiFilter,
    setKpiFilter,
    debouncedFilter: debouncedKpiFilter,
    updateFilter: setKpiFilter,
    clearFilter,
    filteredItems,
    filteredCount,
    totalCount,
    // Compatibilité avec l'ancienne API
    kpiFilter,
    debouncedKpiFilter,
  };
}
