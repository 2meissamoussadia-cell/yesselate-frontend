/**
 * Hook pour gérer le refresh des données Arbitrages-Vivants
 * Pattern cohérent avec useDashboardRefresh
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useLogger } from '@/lib/utils/logger';

interface UseArbitragesRefreshOptions {
  onRefresh?: () => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useArbitragesRefresh({
  onRefresh,
  onSuccess,
  onError,
}: UseArbitragesRefreshOptions = {}) {
  const log = useLogger('useArbitragesRefresh');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<Error | null>(null);
  const refreshCountRef = useRef(0);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setError(null);

    try {
      if (onRefresh) {
        await onRefresh();
      }
      
      refreshCountRef.current += 1;
      setLastUpdate(new Date());
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      log.error('Erreur lors du refresh', error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh, onSuccess, onError, log]);

  return {
    refresh,
    isRefreshing,
    lastUpdate,
    error,
    refreshCount: refreshCountRef.current,
  };
}
