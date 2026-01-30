'use client';

import { useEffect } from 'react';

/**
 * Enregistre le service worker PWA au chargement de l'app.
 * Nécessaire pour que l'app soit installable (manifest + SW).
 */
export function PwaRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PWA] Service worker enregistré', reg.scope);
        }
      })
      .catch((err) => {
        console.error('[PWA] Erreur enregistrement service worker:', err);
      });
  }, []);

  return null;
}
