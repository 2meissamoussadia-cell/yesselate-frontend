/**
 * Hook pour charger les données des projets
 * Inspiré de useBlockedData() du Blocked Command Center
 */

import { useState, useEffect, useCallback } from 'react';
import { projetsApiService } from '@/lib/api/projets';
import { useProjetsCommandCenterStore } from '@/lib/stores/projetsCommandCenterStore';
import type { Project, Bureau } from '@/lib/mocks/projets/mockProjects';

interface UseProjetsDataReturn {
  data: Project[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useProjetsData(): UseProjetsDataReturn {
  const { filters } = useProjetsCommandCenterStore();
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert store filters to API filters
      const apiFilters = {
        status: filters.status.length > 0 ? filters.status : undefined,
        bureau: filters.bureaux.length > 0 ? (filters.bureaux as Bureau[]) : undefined,
        priority: filters.priority.length > 0 ? filters.priority : undefined,
        search: filters.search || undefined,
        dateRange: filters.dateRange,
      };

      // Call API service
      const response = await projetsApiService.projects.getProjects(apiFilters);
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error('Failed to load projects');
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const reload = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, reload };
}

/**
 * Hook pour charger les statistiques globales
 */
export function useProjetsStats() {
  const { stats, setStats } = useProjetsCommandCenterStore();
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (stats) return; // Already loaded
    
    setLoading(true);
    try {
      const response = await projetsApiService.projects.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, [stats, setStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, reload: loadStats };
}

/**
 * Hook pour charger les données du dashboard
 */
export function useProjetsDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await projetsApiService.projects.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { dashboard, loading, error, reload: loadDashboard };
}

