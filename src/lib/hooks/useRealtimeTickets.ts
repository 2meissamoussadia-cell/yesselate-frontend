/**
 * Hook React pour le WebSocket Tickets
 * Similaire à useRealtimeBlocked pour Blocked
 * Gère la connexion, les souscriptions et les mises à jour automatiques
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { isConnected, lastEvent } = useRealtimeTickets({
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
import { getTicketsWebSocket, type WSEvent, type WSEventType } from '@/lib/services/ticketsWebSocketService';
import { useTicketsToast } from '@/components/features/bmo/workspace/tickets/command-center/TicketsToast';

export interface UseRealtimeTicketsOptions {
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

export interface RealtimeTicketsState {
  isConnected: boolean;
  subscriptionsCount: number;
  lastEvent: WSEvent | null;
  error: Error | null;
}

const DEFAULT_EVENT_TYPES: WSEventType[] = [
  'ticket:created',
  'ticket:updated',
  'ticket:resolved',
  'ticket:closed',
  'ticket:reopened',
  'ticket:assigned',
  'ticket:escalated',
  'ticket:commented',
  'ticket:message_added',
  'ticket:deleted',
  'stats:updated',
  'sla:breached',
  'sla:warning',
];

export function useRealtimeTickets(options: UseRealtimeTicketsOptions = {}) {
  const {
    autoConnect = true,
    showToasts = false,
    autoInvalidateQueries = true,
    eventTypes = DEFAULT_EVENT_TYPES,
    onEvent,
    wsUrl,
  } = options;

  const queryClient = useQueryClient();
  // Always call the hook unconditionally (React Rules of Hooks requirement)
  // The component using this hook MUST be wrapped with TicketsToastProvider
  // Since TicketsClientsPage wraps TicketsClientsPageContent with TicketsToastProvider,
  // the hook will always have access to the context
  const toast = useTicketsToast();
  const wsRef = useRef(getTicketsWebSocket(wsUrl));
  const unsubscribersRef = useRef<Array<() => void>>([]);
  const isMountedRef = useRef(true);

  const [state, setState] = useState<RealtimeTicketsState>({
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

  const handleTicketEvent = useCallback((event: WSEvent) => {
    if (!isMountedRef.current) return;

    // Mettre à jour le state
    setState((prev) => ({
      ...prev,
      lastEvent: event,
      subscriptionsCount: wsRef.current.getSubscriptionsCount(),
    }));

    // Invalider les queries React Query si activé
    if (autoInvalidateQueries) {
      const queryKeys: string[][] = [
        ['tickets'], // Liste générale
        ['tickets', 'stats'], // Statistiques
      ];

      // Si c'est une mise à jour d'un ticket spécifique, invalider aussi son détail
      if (event.payload.ticketId) {
        queryKeys.push(['tickets', String(event.payload.ticketId)]);
      }

      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }

    // Afficher un toast si activé
    if (showToasts && toast) {
      switch (event.type) {
        case 'ticket:created':
          toast.ticketCreated(String(event.payload.ticketId || event.payload.title || 'Nouveau ticket'));
          break;
        case 'ticket:resolved':
          toast.ticketResolved(String(event.payload.ticketId || event.payload.title || 'Ticket résolu'));
          break;
        case 'ticket:escalated':
          toast.warning(
            'Ticket escaladé',
            `Le ticket #${event.payload.ticketId} a été escaladé`
          );
          break;
        case 'ticket:assigned':
          toast.ticketAssigned(
            String(event.payload.ticketId || ''),
            String(event.payload.assigneeName || 'Agent')
          );
          break;
        case 'sla:breached':
          toast.error(
            '⚠️ SLA dépassé',
            `Le ticket #${event.payload.ticketId} a dépassé son SLA`
          );
          break;
        case 'sla:warning':
          toast.warning(
            '⏰ Alerte SLA',
            `Le ticket #${event.payload.ticketId} approche de son SLA`
          );
          break;
      }
    }

    // Appeler le callback custom si fourni
    if (onEvent) {
      try {
        onEvent(event);
      } catch (error) {
        console.error('[useRealtimeTickets] Erreur dans onEvent callback:', error);
      }
    }
  }, [autoInvalidateQueries, showToasts, toast, onEvent, queryClient]);

  // ================================
  // Public API
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

    // S'abonner aux événements Tickets
    eventTypes.forEach((eventType) => {
      const unsub = ws.subscribe(eventType, handleTicketEvent);
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
          console.error('[useRealtimeTickets] Erreur lors du désabonnement:', error);
        }
      });
      unsubscribersRef.current = [];
      ws.disconnect();
    };
  }, [autoConnect, eventTypes, handleConnectionChange, handleError, handleTicketEvent]);

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

