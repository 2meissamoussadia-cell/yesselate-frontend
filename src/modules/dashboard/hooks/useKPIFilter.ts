/**
 * Hook pour gérer le filtre de recherche des KPIs
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

interface UseKPIFilterOptions<T> {
  items: T[];
  filterFn: (item: T, filter: string) => boolean;
  localStorageKey?: string;
  debounceMs?: number;
}

export function useKPIFilter<T>({
  items,
  filterFn,
  localStorageKey = 'dashboard-kpi-filter',
  debounceMs = 300,
}: UseKPIFilterOptions<T>) {
  // État du filtre avec persistance localStorage
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(localStorageKey) || '';
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useKPIFilter] Erreur lors de la lecture de localStorage:', error);
        }
        return '';
      }
    }
    return '';
  });
  
  // Debounce du filtre
  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  
  // Synchroniser le filtre avec localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (filter) {
          localStorage.setItem(localStorageKey, filter);
        } else {
          localStorage.removeItem(localStorageKey);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useKPIFilter] Erreur lors de l\'écriture dans localStorage:', error);
        }
      }
    }
  }, [filter, localStorageKey]);
  
  // Debounce du filtre
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilter(filter);
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [filter, debounceMs]);
  
  // Filtrer les items
  const filteredItems = useMemo(() => {
    if (!debouncedFilter.trim()) {
      return items;
    }
    
    return items.filter(item => filterFn(item, debouncedFilter));
  }, [items, debouncedFilter, filterFn]);
  
  // Fonction pour mettre à jour le filtre
  const updateFilter = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, []);
  
  // Fonction pour effacer le filtre
  const clearFilter = useCallback(() => {
    setFilter('');
    setDebouncedFilter('');
  }, []);
  
  return {
    filter,
    debouncedFilter,
    filteredItems,
    updateFilter,
    clearFilter,
    hasFilter: filter.trim().length > 0,
    filteredCount: filteredItems.length,
    totalCount: items.length,
  };
}
