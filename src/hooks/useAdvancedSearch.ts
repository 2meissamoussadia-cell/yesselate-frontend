// ============================================
// Hook pour la recherche avancée avec filtres
// ============================================

import { useState, useMemo, useCallback } from 'react';
import type { Alert } from '@/lib/types/alerts.types';

export interface AdvancedSearchFilters {
  severity?: 'critical' | 'warning' | 'info' | 'success';
  type?: string;
  bureau?: string;
  status?: 'open' | 'ack' | 'resolved' | 'snoozed';
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  impactMin?: number;
  impactMax?: number;
  searchText?: string;
}

/**
 * Hook pour gérer la recherche avancée
 */
export function useAdvancedSearch(alerts: Alert[]) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});

  const updateFilter = useCallback(<K extends keyof AdvancedSearchFilters>(
    key: K,
    value: AdvancedSearchFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Filtre par sévérité
      if (filters.severity && alert.severity !== filters.severity) {
        return false;
      }

      // Filtre par type
      if (filters.type && alert.type !== filters.type) {
        return false;
      }

      // Filtre par bureau
      if (filters.bureau && alert.bureau !== filters.bureau) {
        return false;
      }

      // Filtre par statut
      if (filters.status) {
        const statusMap: Record<string, string> = {
          open: 'open',
          ack: 'ack',
          resolved: 'resolved',
          snoozed: 'snoozed',
        };
        if (alert.status !== statusMap[filters.status]) {
          return false;
        }
      }

      // Filtre par date
      if (filters.dateRange) {
        const alertDate = alert.createdAt ? new Date(alert.createdAt) : null;
        if (alertDate) {
          if (filters.dateRange.start && alertDate < filters.dateRange.start) {
            return false;
          }
          if (filters.dateRange.end && alertDate > filters.dateRange.end) {
            return false;
          }
        }
      }

      // Filtre par impact financier
      const impactMoney = typeof alert.impact === 'object' && alert.impact !== null && 'money' in alert.impact ? (alert.impact as { money: number }).money : undefined;
      if (filters.impactMin !== undefined && (impactMoney ?? 0) < filters.impactMin) {
        return false;
      }
      if (filters.impactMax !== undefined && (impactMoney ?? 0) > filters.impactMax) {
        return false;
      }

      // Recherche textuelle
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        const matches =
          alert.title.toLowerCase().includes(search) ||
          alert.description?.toLowerCase().includes(search) ||
          alert.id.toLowerCase().includes(search) ||
          alert.bureau?.toLowerCase().includes(search);
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter((v) => v !== undefined && v !== null && v !== '').length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredAlerts,
    activeFiltersCount,
  };
}

