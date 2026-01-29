/**
 * Phase 5 — Hook Cockpit Chantiers
 * Charge les chantiers depuis l’API ; fallback sur mock si API indisponible.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { ChantierMock } from '../data/chantiersMock';
import { chantiers as chantiersMock } from '../data/chantiersMock';
import { useAuthHeaders } from '../utils/getAuthHeaders';

export interface CockpitChantiersResponse {
  ok: boolean;
  chantiers: ChantierMock[];
}

function makeFetchChantiers(headers: Record<string, string>) {
  return async (): Promise<CockpitChantiersResponse> => {
    try {
      const res = await fetch('/api/cockpit/chantiers', {
        cache: 'no-store',
        headers: { ...headers },
      });
      if (res.ok) return res.json();
      if (res.status >= 500) return { ok: false, chantiers: chantiersMock };
      throw new Error(`Cockpit chantiers API: ${res.status}`);
    } catch {
      return { ok: false, chantiers: chantiersMock };
    }
  };
}

const REFETCH_INTERVAL_MS = 30_000; // 30s — refresh auto
const STALE_TIME_MS = 20_000;

export interface UseCockpitChantiersOptions {
  maxSpheres?: number;
  /** Intervalle de refresh auto (ms). Défaut 30s. */
  refetchIntervalMs?: number;
}

export function useCockpitChantiers(options?: UseCockpitChantiersOptions) {
  const maxSpheres = options?.maxSpheres ?? 50;
  const refetchIntervalMs = options?.refetchIntervalMs ?? REFETCH_INTERVAL_MS;
  const authHeaders = useAuthHeaders();

  const query = useQuery<CockpitChantiersResponse>({
    queryKey: ['cockpit', 'chantiers', authHeaders['x-user-id'], authHeaders['x-tenant-id']],
    queryFn: makeFetchChantiers(authHeaders as Record<string, string>),
    refetchInterval: refetchIntervalMs,
    staleTime: STALE_TIME_MS,
  });

  const chantiers = query.data?.chantiers ?? chantiersMock;
  const list = chantiers.slice(0, maxSpheres);
  const totalCa = chantiers.reduce((acc, c) => acc + c.ca, 0);
  const avgMarge =
    chantiers.length > 0
      ? chantiers.reduce((acc, c) => acc + c.marge, 0) / chantiers.length
      : 0;

  return {
    ...query,
    chantiers: list,
    totalChantiers: chantiers.length,
    totalCa,
    avgMarge: Math.round(avgMarge * 100),
    fromApi: query.data?.ok === true,
    /** Timestamp (ms) dernière réponse réussie — pour badge "Dernière màj: il y a X min" */
    lastUpdatedAt: query.dataUpdatedAt,
  };
}
