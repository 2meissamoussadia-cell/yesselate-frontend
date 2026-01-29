/**
 * V5 Ultimate — Hook Prédictions ML (retard, budget, qualité, satisfaction client)
 * Appelle /api/ai/predictions toutes les 5 min ; en hors ligne utilise le cache IndexedDB.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPredictionsFromOffline,
  setPredictionsOffline,
} from '../offline';

export interface CockpitPredictionsData {
  retardRisk: number;
  budgetRisk: number;
  qualityScore: number;
  satisfactionClient: number;
  updatedAt: string;
  source: 'mock' | 'ml';
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 min

export function useCockpitPredictions(options?: { enabled?: boolean; refreshIntervalMs?: number }) {
  const enabled = options?.enabled ?? true;
  const intervalMs = options?.refreshIntervalMs ?? REFRESH_INTERVAL_MS;

  const [data, setData] = useState<CockpitPredictionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchPredictions = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    setFromCache(false);
    try {
      const res = await fetch('/api/ai/predictions');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as CockpitPredictionsData;
      const payload: CockpitPredictionsData = {
        retardRisk: json.retardRisk ?? 0,
        budgetRisk: json.budgetRisk ?? 0,
        qualityScore: json.qualityScore ?? 0,
        satisfactionClient: json.satisfactionClient ?? 0,
        updatedAt: json.updatedAt ?? new Date().toISOString(),
        source: json.source ?? 'mock',
      };
      setData(payload);
      await setPredictionsOffline(payload);
    } catch (e) {
      const cached = await getPredictionsFromOffline();
      const cachedData = cached?.data as CockpitPredictionsData | undefined;
      if (cachedData) {
        setData(cachedData);
        setFromCache(true);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : String(e));
        setData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchPredictions();
    const id = setInterval(fetchPredictions, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, fetchPredictions]);

  return {
    retardRisk: data?.retardRisk ?? null,
    budgetRisk: data?.budgetRisk ?? null,
    qualityScore: data?.qualityScore ?? null,
    satisfactionClient: data?.satisfactionClient ?? null,
    updatedAt: data?.updatedAt ?? null,
    source: data?.source ?? null,
    fromCache,
    isLoading,
    error,
    refetch: fetchPredictions,
  };
}
