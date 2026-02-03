'use client';

import { useEffect } from 'react';

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
          console.log('[PWA] Service worker enregistré', reg.scope);
        }
      })
      .catch((err) => {
        console.error('[PWA] Erreur enregistrement service worker:', err);
      });
  }, []);

  return null;
}
