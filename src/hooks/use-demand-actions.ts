'use client';

import { useState, useCallback } from 'react';
import type { Demand } from '@/lib/types/bmo.types';
import { logger } from '@/lib/utils/logger';

type Action = 'validate' | 'reject' | 'assign' | 'request_complement';

interface ActionPayload {
  action: Action;
  actorId?: string;
  actorName?: string;
  details?: string;
  message?: string;
  employeeId?: string;
  employeeName?: string;
}

export function useDemandActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeAction = useCallback(async (
    demandId: string,
    payload: ActionPayload
  ): Promise<Demand | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/demands/${demandId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Action failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.demand;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Error executing action', error, { component: 'useDemandActions' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actions simplifiées
  const validate = useCallback(async (
    demandId: string,
    actorId: string,
    actorName: string,
    details?: string
  ): Promise<Demand | null> => {
    return executeAction(demandId, {
      action: 'validate',
      actorId,
      actorName,
      details,
    });
  }, [executeAction]);

  const reject = useCallback(async (
    demandId: string,
    actorId: string,
    actorName: string,
    details: string
  ): Promise<Demand | null> => {
    return executeAction(demandId, {
      action: 'reject',
      actorId,
      actorName,
      details,
    });
  }, [executeAction]);

  const assign = useCallback(async (
    demandId: string,
    actorId: string,
    actorName: string,
    employeeId: string,
    employeeName: string
  ): Promise<Demand | null> => {
    return executeAction(demandId, {
      action: 'assign',
      actorId,
      actorName,
      employeeId,
      employeeName,
    });
  }, [executeAction]);

  const requestComplement = useCallback(async (
    demandId: string,
    actorId: string,
    actorName: string,
    message: string
  ): Promise<Demand | null> => {
    return executeAction(demandId, {
      action: 'request_complement',
      actorId,
      actorName,
      message,
    });
  }, [executeAction]);

  return {
    loading,
    error,
    executeAction,
    validate,
    reject,
    assign,
    requestComplement,
  };
}

