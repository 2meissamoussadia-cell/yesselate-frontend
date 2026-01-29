/**
 * Hook client pour le briefing IA DG — V5 Ultimate
 * GET /api/ai/briefing, refresh auto 60s.
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export type BriefingStatus = 'red' | 'yellow' | 'green';

export interface AIBriefingResponse {
  status: BriefingStatus;
  briefing: string;
  topRisks: string[];
  opportunities: string[];
  fromCache?: boolean;
}

async function fetchBriefing(): Promise<AIBriefingResponse> {
  const res = await fetch('/api/ai/briefing', { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Briefing API: ${res.status}`);
  }
  return res.json();
}

const REFETCH_INTERVAL_MS = 60_000; // 60s

export function useAIBriefing(options?: { enabled?: boolean; refetchInterval?: number }) {
  const enabled = options?.enabled ?? true;
  const refetchInterval = options?.refetchInterval ?? REFETCH_INTERVAL_MS;

  return useQuery<AIBriefingResponse>({
    queryKey: ['ai', 'briefing'],
    queryFn: fetchBriefing,
    refetchInterval: enabled ? refetchInterval : false,
    staleTime: 30_000,
    enabled,
  });
}
