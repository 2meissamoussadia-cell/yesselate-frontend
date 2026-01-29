/**
 * V5 Ultimate — Hook Briefing DG (GPT-4)
 * Appelle /api/ai/briefing toutes les 60s ; en hors ligne utilise le cache IndexedDB.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getBriefingFromOffline,
  setBriefingOffline,
} from '../offline';

export type BriefingStatus = 'red' | 'yellow' | 'green';

export interface CockpitBriefingData {
  status: BriefingStatus;
  briefing: string;
  topRisks: string[];
  opportunities: string[];
  fromCache?: boolean;
  fallback?: boolean; // true quand OPENAI non configurée (message par défaut)
}

const REFRESH_INTERVAL_MS = 60_000; // 60s

export function useCockpitBriefing(options?: { enabled?: boolean; refreshIntervalMs?: number }) {
  const enabled = options?.enabled ?? true;
  const intervalMs = options?.refreshIntervalMs ?? REFRESH_INTERVAL_MS;

  const [data, setData] = useState<CockpitBriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/briefing');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as CockpitBriefingData & { fromCache?: boolean; fallback?: boolean };
      const payload: CockpitBriefingData = {
        status: json.status ?? 'yellow',
        briefing: json.briefing ?? 'Briefing non disponible.',
        topRisks: Array.isArray(json.topRisks) ? json.topRisks : [],
        opportunities: Array.isArray(json.opportunities) ? json.opportunities : [],
        fromCache: json.fromCache,
        fallback: json.fallback,
      };
      setData(payload);
      await setBriefingOffline(payload);
    } catch (e) {
      const cached = await getBriefingFromOffline();
      const cachedData = cached?.data as CockpitBriefingData | undefined;
      if (cachedData) {
        setData({ ...cachedData, fromCache: true });
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
    fetchBriefing();
    const id = setInterval(fetchBriefing, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, fetchBriefing]);

  return {
    briefing: data?.briefing ?? null,
    status: data?.status ?? null,
    topRisks: data?.topRisks ?? [],
    opportunities: data?.opportunities ?? [],
    fromCache: data?.fromCache ?? false,
    fallback: data?.fallback ?? false,
    isLoading,
    error,
    refetch: fetchBriefing,
  };
}
