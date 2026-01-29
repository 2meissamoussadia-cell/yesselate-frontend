/**
 * Phase 5 — Hook WebSocket Cockpit Live
 * Connexion temps réel : GPS ouvriers, stock quincaillerie, alertes critiques.
 * Quand NEXT_PUBLIC_COCKPIT_WS_URL est défini, se connecte ; sinon inactif.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCockpitWsStore } from '@/lib/stores/cockpitWsStore';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;
const HEARTBEAT_INTERVAL_MS = 30000; // 30s

export type CockpitLiveMessageType =
  | 'cockpit_gps_update'
  | 'cockpit_stock_update'
  | 'cockpit_alert'
  | 'cockpit_stats'
  | 'cockpit_payment'
  | 'cockpit_emergency'
  | 'chantier:update'
  | 'worker:gps'
  | 'stock:low'
  | 'payment:completed'
  | 'emergency:alert';

export interface CockpitLiveMessage {
  type: CockpitLiveMessageType;
  data: Record<string, unknown>;
  timestamp: string;
}

interface UseCockpitLiveOptions {
  onMessage?: (message: CockpitLiveMessage) => void;
  onAlert?: (message: CockpitLiveMessage) => void;
  enabled?: boolean;
  maxReconnectAttempts?: number;
}

function getCockpitWsUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const env = process.env.NEXT_PUBLIC_COCKPIT_WS_URL;
  if (env) return env;
  // Optionnel : décommenter pour utiliser /api/cockpit/ws quand la route existe
  // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // return `${protocol}//${window.location.host}/api/cockpit/ws`;
  return null;
}

export function useCockpitLive({
  onMessage,
  onAlert,
  enabled = true,
  maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS,
}: UseCockpitLiveOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<CockpitLiveMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  const onAlertRef = useRef(onAlert);
  onMessageRef.current = onMessage;
  onAlertRef.current = onAlert;

  const isAlertType = (type: string): boolean =>
    type === 'cockpit_alert' ||
    type === 'cockpit_emergency' ||
    type === 'emergency:alert';

  const connect = useCallback(() => {
    const url = getCockpitWsUrl();
    if (!url || !enabled) return;
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping', payload: { timestamp: Date.now() } }));
            } catch {
              // ignore
            }
          }
        }, HEARTBEAT_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data as string);
          const message: CockpitLiveMessage = {
            type: (raw.type ?? 'cockpit_stats') as CockpitLiveMessage['type'],
            data: raw.payload ?? raw.data ?? {},
            timestamp: raw.timestamp ?? new Date().toISOString(),
          };
          setLastMessage(message);
          useCockpitWsStore.getState().addMessage(message);
          onMessageRef.current?.(message);
          if (isAlertType(message.type)) {
            onAlertRef.current?.(message);
          }
        } catch {
          // ignore invalid JSON
        }
      };

      ws.onclose = () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        setIsConnected(false);
        wsRef.current = null;
        if (enabled) {
          const next = reconnectAttemptsRef.current + 1;
          reconnectAttemptsRef.current = next;
          if (next <= maxReconnectAttempts) {
            reconnectTimeoutRef.current = setTimeout(() => connect(), RECONNECT_DELAY_MS);
          }
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }
  }, [enabled, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (enabled && getCockpitWsUrl()) connect();
    return () => disconnect();
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    reconnect: connect,
    disconnect,
  };
}
