/**
 * Hook pour WebSocket notifications temps réel
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { logger } from '@/lib/utils/logger';

export interface WebSocketMessage {
  type: 'new_document' | 'document_validated' | 'document_rejected' | 'urgent_alert' | 'stats_update';
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

/**
 * Hook pour gérer une connexion WebSocket avec reconnexion automatique
 */
export function useWebSocket({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/validation-bc/ws',
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnect = true,
  reconnectInterval = 5000,
}: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        logger.info('WebSocket connected', { component: 'useWebSocket', url });
        setIsConnected(true);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          logger.error('Error parsing WebSocket message', error instanceof Error ? error : undefined, { component: 'useWebSocket' });
        }
      };

      ws.onerror = (event) => {
        // WebSocket error events don't provide detailed error info
        // Log the event type and WebSocket state for debugging
        const readyState = ws?.readyState ?? 'unknown';
        const readyStateLabels: Record<number, string> = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED',
        };
        
        const errorInfo = {
          type: event?.type || 'error',
          readyState: typeof readyState === 'number' ? readyStateLabels[readyState] || readyState : readyState,
          url: ws?.url || url || 'unknown',
          timestamp: new Date().toISOString(),
        };
        
        logger.error('WebSocket error', undefined, { component: 'useWebSocket', ...errorInfo });
        
        setIsConnected(false);
        onError?.(event);
      };

      ws.onclose = () => {
        logger.info('WebSocket disconnected', { component: 'useWebSocket', url });
        setIsConnected(false);
        onClose?.();

        // Reconnexion automatique
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            logger.info('Attempting to reconnect', { component: 'useWebSocket', url });
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      logger.error('Error creating WebSocket', error instanceof Error ? error : undefined, { component: 'useWebSocket', url });
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
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

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      logger.warn('WebSocket is not connected', { component: 'useWebSocket' });
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    disconnect,
    reconnect: connect,
  };
}

/**
 * Hook spécialisé pour les notifications Validation-BC
 */
export function useValidationBCNotifications(onNotification: (message: WebSocketMessage) => void) {
  return useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/validation-bc/ws',
    onMessage: (message) => {
      logger.info('Received notification', { component: 'useValidationBCNotifications', type: message?.type });
      onNotification(message);
    },
    onError: () => {
      logger.error('WebSocket error', undefined, { component: 'useValidationBCNotifications' });
    },
    reconnect: true,
    reconnectInterval: 5000,
  });
}

