/**
 * Phase 2 #8 — Hook WebSocket temps réel pour le Dashboard
 * Connecte au WebSocket Cockpit / Dashboard et expose isConnected pour le badge LIVE.
 * Quand NEXT_PUBLIC_WS_URL ou NEXT_PUBLIC_COCKPIT_WS_URL est défini, tente la connexion.
 */

'use client';

import { useCockpitLive } from './useCockpitLive';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useCallback, useEffect } from 'react';

function getDashboardWsUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const cockpit = process.env.NEXT_PUBLIC_COCKPIT_WS_URL;
  if (cockpit) return cockpit;
  const ws = process.env.NEXT_PUBLIC_WS_URL;
  if (ws) {
    if (ws.startsWith('wss://') || ws.startsWith('ws://')) return ws;
    if (ws.startsWith('https://')) return ws.replace(/^https/, 'wss');
    if (ws.startsWith('http://')) return ws.replace(/^http/, 'ws');
    return `wss://${ws}`;
  }
  return null;
}

export interface UseDashboardLiveOptions {
  /** Activer la connexion WebSocket */
  enabled?: boolean;
  /** Callback quand stats live reçues (mise à jour KPIs) */
  onStats?: (data: Record<string, unknown>) => void;
}

/**
 * Connexion WebSocket dashboard. Expose isConnected pour badge LIVE.
 * Quand connecté, met à jour liveStats du store sur réception de cockpit_stats.
 */
export function useDashboardLive(options: UseDashboardLiveOptions = {}) {
  const { enabled = true, onStats } = options;
  const setLiveStats = useDashboardCommandCenterStore((s) => s.setLiveStats);
  const invalidateAllViews = useDashboardCommandCenterStore((s) => s.invalidateAllViews);

  const onMessage = useCallback(
    (msg: { type: string; data: Record<string, unknown> }) => {
      if (msg.type === 'cockpit_stats' || msg.type === 'stats:updated') {
        const data = msg.data as Record<string, unknown>;
        setLiveStats({
          lastUpdate: new Date().toISOString(),
          connectionStatus: 'connected',
          total: typeof data.total === 'number' ? data.total : undefined,
          performance: typeof data.performance === 'number' ? data.performance : undefined,
          actions: typeof data.actions === 'number' ? data.actions : undefined,
          risks: typeof data.risks === 'number' ? data.risks : undefined,
          decisions: typeof data.decisions === 'number' ? data.decisions : undefined,
          realtime: typeof data.realtime === 'number' ? data.realtime : undefined,
        });
        onStats?.(data);
        invalidateAllViews();
      }
    },
    [setLiveStats, invalidateAllViews, onStats]
  );

  const { isConnected, lastMessage, reconnect } = useCockpitLive({
    enabled: enabled && !!getDashboardWsUrl(),
    onMessage,
  });

  useEffect(() => {
    if (!getDashboardWsUrl()) return;
    setLiveStats({
      connectionStatus: isConnected ? 'connected' : 'disconnected',
    });
  }, [isConnected, setLiveStats]);

  return {
    isConnected,
    lastMessage,
    reconnect,
    wsConfigured: !!getDashboardWsUrl(),
  };
}
