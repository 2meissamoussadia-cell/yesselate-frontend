'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

type ExportFormat = 'csv' | 'json';
type QueueFilter = 'pending' | 'validated' | 'rejected' | 'urgent' | 'all';

interface ExportOptions {
  format?: ExportFormat;
  queue?: QueueFilter;
}

export function useDemandsExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportDemands = useCallback(async (options: ExportOptions = {}): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { format = 'csv', queue = 'all' } = options;
      
      const params = new URLSearchParams();
      params.append('format', format);
      if (queue && queue !== 'all') params.append('queue', queue);

      const url = `/api/demands/export?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to export: ${response.statusText}`);
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const filename = `demandes_${queue}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Error exporting demands', error, { component: 'useDemandsExport' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportDemands,
  };
}

