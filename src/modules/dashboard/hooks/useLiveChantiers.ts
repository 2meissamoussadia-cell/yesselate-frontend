/**
 * Phase 5 — useLiveChantiers
 * Health spheres 5s refresh + WebSocket gps_live_update / stock_critical → invalidate + alerte.
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';
import type { ChantierMock } from '../data/chantiersMock';
import { healthToChantierMock } from '../utils/chantierHealth';
import type { HealthSphereRaw } from '../utils/chantierHealth';
import { useCockpitLive } from './useCockpitLive';

const HEALTH_URL = '/api/chantiers/health';
const REFETCH_INTERVAL_MS = 5000;
const QUERY_KEY = ['chantiers', 'health'] as const;

async function fetchHealth(): Promise<HealthSphereRaw[]> {
  const res = await fetch(HEALTH_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Health API: ${res.status}`);
  return res.json();
}

export interface UseLiveChantiersOptions {
  maxSpheres?: number;
  refetchIntervalMs?: number;
  /** Alerte toast sur stock_critical (défaut true) */
  alertOnStockCritical?: boolean;
}

export function useLiveChantiers(options?: UseLiveChantiersOptions) {
  const maxSpheres = options?.maxSpheres ?? 42;
  const refetchIntervalMs = options?.refetchIntervalMs ?? REFETCH_INTERVAL_MS;
  const alertOnStockCritical = options?.alertOnStockCritical ?? true;
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const { isConnected } = useCockpitLive({
    enabled: true,
    onMessage: (msg) => {
      if (msg.type === 'gps_live_update' || msg.type === 'stock_critical' || msg.type === 'chantier:update') {
        invalidate();
      }
      if (alertOnStockCritical && msg.type === 'stock_critical') {
        const d = msg.data as { quincaillerieId?: string; stockPeinture?: number; critical?: boolean };
        toast.warning('Stock peinture critique', {
          description: d.quincaillerieId
            ? `Quincaillerie ${d.quincaillerieId} : ${((d.stockPeinture ?? 0) * 100).toFixed(0)}%`
            : 'Une quincaillerie signale un stock < 5%.',
        });
      }
    },
  });

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchHealth,
    refetchInterval: refetchIntervalMs,
    staleTime: refetchIntervalMs - 500,
  });

  const raw = (query.data ?? []) as HealthSphereRaw[];
  const chantiers: ChantierMock[] = raw.slice(0, maxSpheres).map((h) => healthToChantierMock(h));

  return {
    chantiers,
    totalChantiers: raw.length,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    lastUpdatedAt: query.dataUpdatedAt,
    isLive: isConnected,
  };
}
