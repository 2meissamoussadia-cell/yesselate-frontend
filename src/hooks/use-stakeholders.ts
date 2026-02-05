import { useState, useCallback } from 'react';
import {
  listStakeholders,
  addStakeholder,
  removeStakeholder,
  type Stakeholder,
  type AddStakeholderPayload,
} from '@/lib/api/stakeholdersClient';
import { logger } from '@/lib/utils/logger';

export function useStakeholders(demandId: string) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!demandId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await listStakeholders(demandId);
      setStakeholders(data);
    } catch (e: unknown) {
      setError(e as Error);
      logger.error('Failed to fetch stakeholders', e instanceof Error ? e : undefined, { component: 'useStakeholders', demandId });
    } finally {
      setLoading(false);
    }
  }, [demandId]);

  const add = useCallback(
    async (payload: AddStakeholderPayload) => {
      if (!demandId) return null;
      
      setLoading(true);
      setError(null);
      try {
        const stakeholder = await addStakeholder(demandId, payload);
        setStakeholders((prev) => [stakeholder, ...prev]);
        return stakeholder;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error('Failed to add stakeholder', e instanceof Error ? e : undefined, { component: 'useStakeholders', demandId });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  const remove = useCallback(
    async (stakeholderId: string) => {
      if (!demandId) return false;
      
      setLoading(true);
      setError(null);
      try {
        await removeStakeholder(demandId, stakeholderId);
        setStakeholders((prev) => prev.filter((s) => s.id !== stakeholderId));
        return true;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error('Failed to remove stakeholder', e instanceof Error ? e : undefined, { component: 'useStakeholders', demandId });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  return {
    stakeholders,
    loading,
    error,
    fetch,
    add,
    remove,
  };
}

