/**
 * Hook pour les notifications en temps réel via WebSocket
 * Gestion des alertes critiques avec notifications browser et sons
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { alertsKeys } from '@/lib/api/hooks/useAlerts';

// ================================
// Types
// ================================

export interface AlertNotification {
  type: 'alert.created' | 'alert.updated' | 'alert.resolved' | 'alert.escalated' | 'alert.critical';
  alert: {
    id: string;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    type: string;
    bureau?: string;
  };
  timestamp: string;
  metadata?: any;
}

interface NotificationOptions {
  enableBrowserNotifications?: boolean;
  enableSound?: boolean;
  soundVolume?: number; // 0-1
  criticalOnly?: boolean;
}

// ================================
// Hook principal
// ================================

export function useAlertsWebSocket(options?: NotificationOptions) {
  const {
    enableBrowserNotifications = true,
    enableSound = true,
    soundVolume = 0.7,
    criticalOnly = false,
  } = options ?? {};

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<AlertNotification | null>(null);

  // Demander la permission pour les notifications browser
  useEffect(() => {
    if (enableBrowserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enableBrowserNotifications]);

  // Jouer un son
  const playSound = useCallback((severity: string) => {
    if (!enableSound) return;

    try {
      const soundFile = severity === 'critical' ? '/sounds/alert-critical.mp3' : '/sounds/alert.mp3';
      const audio = new Audio(soundFile);
      audio.volume = soundVolume;
      audio.play().catch((err) => {
        console.warn('Could not play sound:', err);
      });
    } catch (err) {
      console.warn('Sound error:', err);
    }
  }, [enableSound, soundVolume]);

  // Afficher une notification browser
  const showBrowserNotification = useCallback(
    (notification: AlertNotification) => {
      if (!enableBrowserNotifications || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const { alert } = notification;
      const icon = alert.severity === 'critical' ? '/icons/alert-critical.png' : '/icons/alert.png';
      
      try {
        const browserNotif = new Notification(alert.title, {
          body: `${alert.severity.toUpperCase()} - ${alert.type}${alert.bureau ? ` (${alert.bureau})` : ''}`,
          icon,
          badge: icon,
          tag: `alert-${alert.id}`,
          requireInteraction: alert.severity === 'critical',
        });
      if (alert.severity === 'critical' && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

        browserNotif.onclick = () => {
          window.focus();
          // Naviguer vers l'alerte
          window.location.href = `/maitre-ouvrage/alerts#alert-${alert.id}`;
          browserNotif.close();
        };

        // Auto-fermer après 10s (sauf critiques)
        if (alert.severity !== 'critical') {
          setTimeout(() => browserNotif.close(), 10000);
        }
      } catch (err) {
        console.warn('Could not show notification:', err);
      }
    },
    [enableBrowserNotifications]
  );

  // Mettre à jour le badge du titre
  const updateDocumentTitle = useCallback((notification: AlertNotification) => {
    if (notification.alert.severity === 'critical') {
      const criticalCount = Number(document.title.match(/\((\d+)\)/)?.[1] || 0) + 1;
      document.title = `(${criticalCount}) Alertes Critiques - Yesselate`;
      
      // Faire clignoter le favicon
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = '/favicon-alert.ico';
    }
  }, []);

  // Gérer les messages WebSocket
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const notification: AlertNotification = JSON.parse(event.data);
        
        // Filtrer si criticalOnly activé
        if (criticalOnly && notification.alert.severity !== 'critical') {
          return;
        }

        setLastNotification(notification);

        // Invalider les queries pour forcer un refetch
        queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: alertsKeys.stats() });

        // Notifications selon le type et la sévérité
        if (notification.type === 'alert.created' || notification.type === 'alert.critical') {
          showBrowserNotification(notification);
          playSound(notification.alert.severity);
          updateDocumentTitle(notification);
        }

        // Log pour debug
        console.log('🔔 New alert notification:', notification);
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    },
    [criticalOnly, queryClient, showBrowserNotification, playSound, updateDocumentTitle]
  );

  // Connexion WebSocket
  const connect = useCallback(() => {
    // 🔧 FIX: Désactiver WebSocket en développement (pas encore de serveur)
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ WebSocket désactivé en développement - Utilisez des mocks pour tester');
      setIsConnected(false);
      return;
    }

    // En production, utiliser le vrai WebSocket
    const wsUrl = `wss://${window.location.host}/api/alerts/stream`;

    console.log('🔌 Connecting to WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = handleMessage;

      ws.onerror = (event) => {
        // WebSocket error events don't provide detailed error info
        // Log the event type and WebSocket state for debugging
        const errorInfo = {
          type: event.type,
          readyState: ws.readyState,
          url: ws.url,
          timestamp: new Date().toISOString(),
        };
        console.error('❌ WebSocket error:', errorInfo);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
        
        // Reconnexion exponentielle
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Reconnecting (attempt ${reconnectAttempts.current})...`);
          connect();
        }, delay);
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setIsConnected(false);
    }
  }, [handleMessage]);

  // Connexion au montage
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Envoyer un message au serveur (optionnel)
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  return {
    isConnected,
    lastNotification,
    sendMessage,
  };
}

// ================================
// Hook simplifié pour écouter les notifications
// ================================

export function useAlertNotifications(
  onNotification?: (notification: AlertNotification) => void,
  options?: NotificationOptions
) {
  const { lastNotification, isConnected } = useAlertsWebSocket(options);

  useEffect(() => {
    if (lastNotification && onNotification) {
      onNotification(lastNotification);
    }
  }, [lastNotification, onNotification]);

  return { isConnected };
}

// ================================
// Helpers
// ================================

/**
 * Réinitialiser le badge du titre
 */
export function resetDocumentTitle() {
  document.title = 'Alertes - Yesselate';
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (link) {
    link.href = '/favicon.ico';
  }
}

/**
 * Vérifier si les notifications sont supportées et autorisées
 */
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Demander l'autorisation pour les notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

