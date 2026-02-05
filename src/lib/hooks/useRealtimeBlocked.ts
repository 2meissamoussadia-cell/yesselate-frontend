/**
 * Hook React pour le WebSocket Blocked
 * Similaire à useRealtimeAnalytics pour Analytics
 * Gère la connexion, les souscriptions et les mises à jour automatiques
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { isConnected, lastEvent } = useRealtimeBlocked({
 *     autoConnect: true,
 *     showToasts: true,
 *     autoInvalidateQueries: true,
 *     onEvent: (event) => console.log('Event:', event)
 *   });
 * 
 *   return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
 * }
 * ```
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getBlockedWebSocket, type WSEvent, type WSEventType } from '@/lib/services/blockedWebSocketService';
import { useBlockedToast } from '@/components/features/bmo/workspace/blocked/BlockedToast';

export interface UseRealtimeBlockedOptions {
  /**
   * Se connecter automatiquement au montage
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Afficher des toasts pour les événements importants
   * @default false
   */
  showToasts?: boolean;

  /**
   * Invalider automatiquement les queries React Query
   * @default true
   */
  autoInvalidateQueries?: boolean;

  /**
   * Types d'événements à écouter
   * @default tous les événements
   */
  eventTypes?: WSEventType[];

  /**
   * Callback personnalisé pour les événements
   */
  onEvent?: (event: WSEvent) => void;

  /**
   * URL du serveur WebSocket (optionnel)
   */
  wsUrl?: string;
}

export interface RealtimeBlockedState {
  isConnected: boolean;
  subscriptionsCount: number;
  lastEvent: WSEvent | null;
  error: Error | null;
}

const DEFAULT_EVENT_TYPES: WSEventType[] = [
  'blocked:created',
  'blocked:updated',
  'blocked:resolved',
  'blocked:escalated',
  'blocked:commented',
  'blocked:deleted',
  'stats:updated',
];

export function useRealtimeBlocked(options: UseRealtimeBlockedOptions = {}) {
  const {
    autoConnect = true,
    showToasts = false,
    autoInvalidateQueries = true,
    eventTypes = DEFAULT_EVENT_TYPES,
    onEvent,
    wsUrl,
  } = options;

  const queryClient = useQueryClient();
  const toast = showToasts ? useBlockedToast() : null;
  const wsRef = useRef(getBlockedWebSocket(wsUrl));
  const unsubscribersRef = useRef<Array<() => void>>([]);
  const isMountedRef = useRef(true);

  const [state, setState] = useState<RealtimeBlockedState>({
    isConnected: false,
    subscriptionsCount: 0,
    lastEvent: null,
    error: null,
  });

  // ================================
  // Event Handlers
  // ================================

  const handleConnectionChange = useCallback((event: WSEvent) => {
    if (!isMountedRef.current) return;
    
    const isConnected = event.payload.status === 'connected';
    
    setState((prev) => ({ ...prev, isConnected }));

    if (showToasts && toast) {
      if (isConnected) {
        toast.success('Temps réel activé', 'Connexion WebSocket établie');
      } else {
        toast.warning('Temps réel désactivé', 'Connexion WebSocket perdue');
      }
    }
  }, [showToasts, toast]);

  const handleError = useCallback((event: WSEvent) => {
    if (!isMountedRef.current) return;
    
    const error = event.payload.error instanceof Error 
      ? event.payload.error 
      : new Error(String(event.payload.error || 'Unknown error'));
    
    setState((prev) => ({ ...prev, error }));
    
    if (showToasts && toast) {
      toast.error('Erreur WebSocket', error.message || 'Problème de connexion temps réel');
    }
  }, [showToasts, toast]);

  const handleBlockedEvent = useCallback((event: WSEvent) => {
    if (!isMountedRef.current) return;
    
    setState((prev) => ({ 
      ...prev, 
      lastEvent: event,
      subscriptionsCount: wsRef.current.getSubscriptionsCount(),
    }));

    // Callback personnalisé
    if (onEvent) {
      try {
        onEvent(event);
      } catch (error) {
        console.error('[useRealtimeBlocked] Erreur dans onEvent callback:', error);
      }
    }

    // Invalider les queries React Query
    if (autoInvalidateQueries) {
      switch (event.type) {
        case 'blocked:created':
          queryClient.invalidateQueries({ queryKey: ['blocked', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'stats'] });
          if (showToasts && toast) {
            toast.info('Nouveau blocage', String(event.payload?.subject ?? 'Un nouveau dossier a été créé'));
          }
          break;

        case 'blocked:updated':
          queryClient.invalidateQueries({ queryKey: ['blocked', 'detail', String(event.payload?.id ?? '')] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'list'] });
          break;

        case 'blocked:resolved':
          queryClient.invalidateQueries({ queryKey: ['blocked', 'detail', String(event.payload?.id ?? '')] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'stats'] });
          if (showToasts && toast) {
            toast.success('Blocage résolu', String(event.payload?.subject ?? 'Un dossier a été résolu'));
          }
          break;

        case 'blocked:escalated':
          queryClient.invalidateQueries({ queryKey: ['blocked', 'detail', String(event.payload?.id ?? '')] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'stats'] });
          if (showToasts && toast) {
            toast.warning('Blocage escaladé', String(event.payload?.subject ?? 'Un dossier a été escaladé'));
          }
          break;

        case 'blocked:commented':
          queryClient.invalidateQueries({ queryKey: ['blocked', 'comments', String(event.payload?.dossierId ?? '')] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'detail', String(event.payload?.dossierId ?? '')] });
          break;

        case 'blocked:deleted':
          queryClient.invalidateQueries({ queryKey: ['blocked', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['blocked', 'stats'] });
          break;

        case 'stats:updated':
          queryClient.invalidateQueries({ queryKey: ['blocked', 'stats'] });
          break;

        default:
          console.log('[useRealtimeBlocked] Événement non géré:', event.type);
      }
    }
  }, [autoInvalidateQueries, queryClient, onEvent, showToasts, toast]);

  // ================================
  // Connect / Disconnect
  // ================================

  const connect = useCallback(() => {
    wsRef.current.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current.disconnect();
  }, []);

  // ================================
  // Setup Subscriptions
  // ================================

  useEffect(() => {
    if (!autoConnect) return;

    const ws = wsRef.current;

    // S'abonner aux événements de connexion
    const unsubConnection = ws.subscribe('connection' as any, handleConnectionChange);
    const unsubError = ws.subscribe('error' as any, handleError);

    unsubscribersRef.current.push(unsubConnection, unsubError);

    // S'abonner aux événements Blocked
    eventTypes.forEach((eventType) => {
      const unsub = ws.subscribe(eventType, handleBlockedEvent);
      unsubscribersRef.current.push(unsub);
    });

    // Se connecter
    ws.connect();

    // Cleanup
    return () => {
      isMountedRef.current = false;
      unsubscribersRef.current.forEach((unsub) => {
        try {
          unsub();
        } catch (error) {
          console.error('[useRealtimeBlocked] Erreur lors du désabonnement:', error);
        }
      });
      unsubscribersRef.current = [];
      ws.disconnect();
    };
  }, [autoConnect, eventTypes, handleConnectionChange, handleError, handleBlockedEvent]);

  // ================================
  // Return API
  // ================================

  return {
    // État
    isConnected: state.isConnected,
    subscriptionsCount: state.subscriptionsCount,
    lastEvent: state.lastEvent,
    error: state.error,
    
    // Actions
    connect,
    disconnect,
    
    // Stats
    getStats: useCallback(() => wsRef.current.getStats(), []),
  };
}

