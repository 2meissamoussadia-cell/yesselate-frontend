import { useState, useCallback, useEffect } from 'react';
import type { Risk, AddRiskPayload, UpdateRiskPayload } from '@/lib/api/risksClient';
import { listRisks, addRisk, updateRisk, removeRisk } from '@/lib/api/risksClient';
import { logger } from '@/lib/utils/logger';

export function useRisks(demandId: string) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRisks = useCallback(async () => {
    if (!demandId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listRisks(demandId);
      setRisks(data);
    } catch (e: unknown) {
      setError(e as Error);
      logger.error(`Failed to fetch risks for demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useRisks', demandId });
    } finally {
      setLoading(false);
    }
  }, [demandId]);

  const addRiskEntry = useCallback(
    async (payload: AddRiskPayload) => {
      setLoading(true);
      setError(null);
      try {
        const newRisk = await addRisk(demandId, payload);
        setRisks((prev) => [...prev, newRisk]);
        return newRisk;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error(`Failed to add risk to demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useRisks', demandId });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  const updateRiskEntry = useCallback(
    async (riskId: string, payload: UpdateRiskPayload) => {
      setLoading(true);
      setError(null);
      try {
        const updatedRisk = await updateRisk(demandId, riskId, payload);
        setRisks((prev) => prev.map((r) => (r.id === riskId ? updatedRisk : r)));
        return updatedRisk;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error(`Failed to update risk ${riskId} in demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useRisks', demandId, riskId });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  const removeRiskEntry = useCallback(
    async (riskId: string) => {
      setLoading(true);
      setError(null);
      try {
        await removeRisk(demandId, riskId);
        setRisks((prev) => prev.filter((r) => r.id !== riskId));
        return true;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error(`Failed to remove risk ${riskId} from demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useRisks', demandId, riskId });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  useEffect(() => {
    if (demandId) {
      fetchRisks();
    }
  }, [demandId, fetchRisks]);

  return {
    risks,
    loading,
    error,
    fetch: fetchRisks,
    add: addRiskEntry,
    update: updateRiskEntry,
    remove: removeRiskEntry,
  };
}

