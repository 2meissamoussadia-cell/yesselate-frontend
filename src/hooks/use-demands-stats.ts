'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

export interface DemandsStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  urgent: number;
  high: number;
  overdue: number;
  avgDelay: number;
  ts: string; // ISO timestamp
}

export function useDemandsStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<DemandsStats | null>(null);

  const fetchStats = useCallback(async (): Promise<DemandsStats | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/demands/stats');

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Error fetching stats', error, { component: 'useDemandsStats' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    stats,
    fetchStats,
  };
}

