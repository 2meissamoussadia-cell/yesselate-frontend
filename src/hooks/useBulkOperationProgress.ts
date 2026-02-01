// ============================================
// Hook pour gérer la progression des opérations groupées
// ============================================

import { useState, useCallback, useRef } from 'react';

export interface BulkOperationProgress {
  isRunning: boolean;
  current: number;
  total: number;
  percentage: number;
  currentItem?: string;
  errors: string[];
}

/**
 * Hook pour gérer la progression d'une opération groupée
 */
export function useBulkOperationProgress() {
  const [progress, setProgress] = useState<BulkOperationProgress>({
    isRunning: false,
    current: 0,
    total: 0,
    percentage: 0,
    errors: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startOperation = useCallback((total: number) => {
    abortControllerRef.current = new AbortController();
    setProgress({
      isRunning: true,
      current: 0,
      total,
      percentage: 0,
      errors: [],
    });
  }, []);

  const updateProgress = useCallback((current: number, currentItem?: string) => {
    setProgress((prev) => {
      const percentage = prev.total > 0 ? Math.round((current / prev.total) * 100) : 0;
      return {
        ...prev,
        current,
        percentage,
        currentItem,
      };
    });
  }, []);

  const addError = useCallback((error: string) => {
    setProgress((prev) => ({
      ...prev,
      errors: [...prev.errors, error],
    }));
  }, []);

  const completeOperation = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      isRunning: false,
      percentage: 100,
    }));
    abortControllerRef.current = null;
  }, []);

  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProgress({
      isRunning: false,
      current: 0,
      total: 0,
      percentage: 0,
      errors: [],
    });
    abortControllerRef.current = null;
  }, []);

  const executeBulkOperation = useCallback(
    async <T,>(
      items: T[],
      operation: (item: T, index: number) => Promise<void>,
      onProgress?: (current: number, total: number) => void
    ) => {
      startOperation(items.length);

      for (let i = 0; i < items.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        try {
          await operation(items[i], i);
          updateProgress(i + 1, String(items[i]));
          onProgress?.(i + 1, items.length);
        } catch (error) {
          addError(`Erreur sur l'élément ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      completeOperation();
    },
    [startOperation, updateProgress, addError, completeOperation]
  );

  return {
    progress,
    startOperation,
    updateProgress,
    addError,
    completeOperation,
    cancelOperation,
    executeBulkOperation,
    isAborted: () => abortControllerRef.current?.signal.aborted ?? false,
  };
}

