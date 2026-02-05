/**
 * Phase 7 — Push Notifications Critiques (Cockpit DG).
 * Demande permission, affiche notification de test, envoie alertes critiques (chantierId).
 */

'use client';

import { useCallback } from 'react';

const ICON = '/icon-192.png';
const FALLBACK_ICON = '/images/log_yessalate.png';

export interface UsePushNotificationsResult {
  requestPermission: () => Promise<boolean>;
  sendCriticalAlert: (chantierId: string, message: string) => void;
  isSupported: boolean;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('YESSALATE DG Activé', {
        body: 'Push notifications critiques activées',
        icon: ICON,
      });
      return true;
    }
    return false;
  }, [isSupported]);

  const sendCriticalAlert = useCallback(
    (chantierId: string, message: string) => {
      if (!isSupported) return;
      const opts: NotificationOptions & { vibrate?: number[]; actions?: Array<{ action: string; title: string }> } = {
        body: message,
        icon: ICON,
        badge: FALLBACK_ICON,
        vibrate: [200, 100, 200],
        data: { url: `/maitre-ouvrage/dashboard?chantier=${chantierId}` },
        actions: [
          { action: 'VIEW_CHANTIER', title: `Chantier ${chantierId}` },
          { action: 'HUISSIER', title: 'Huissier immédiat' },
        ],
      };
      try {
        new Notification('ALERTE CRITIQUE', opts);
      } catch {
        // Fallback: via SW si déjà enregistré
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification('ALERTE CRITIQUE', {
            ...opts,
            icon: FALLBACK_ICON,
          });
        });
      }
    },
    [isSupported]
  );

  return { requestPermission, sendCriticalAlert, isSupported };
}
