'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

const PWA_LOG_KEY = '__pwa_registration_logged';

/**
 * Enregistre le service worker PWA au chargement de l'app.
 * Nécessaire pour que l'app soit installable (manifest + SW).
 * Log une seule fois par session pour éviter le spam (Fast Refresh, re-mounts).
 */
export function PwaRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        if (process.env.NODE_ENV === 'development' && !sessionStorage.getItem(PWA_LOG_KEY)) {
          sessionStorage.setItem(PWA_LOG_KEY, '1');
          logger.info('Service worker enregistré', { component: 'PwaRegistration', scope: reg.scope });
        }
      })
      .catch((err) => {
        logger.error('Erreur enregistrement service worker', err instanceof Error ? err : undefined, { component: 'PwaRegistration' });
      });
  }, []);

  return null;
}
