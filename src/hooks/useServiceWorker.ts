'use client';

import { useEffect, useState, useCallback } from 'react';

type ServiceWorkerState = 'installing' | 'installed' | 'activating' | 'activated' | 'error' | null;

export function useServiceWorker() {
  const [swState, setSwState] = useState<ServiceWorkerState>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Détecter le statut de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enregistrer le Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        setRegistration(reg);

        // Écouter les mises à jour
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSwState('installed');
            } else if (newWorker.state === 'activated') {
              setSwState('activated');
            }
          });
        });

        // Vérifier l'état initial
        if (reg.installing) {
          setSwState('installing');
        } else if (reg.waiting) {
          setSwState('installed');
        } else if (reg.active) {
          setSwState('activated');
        }
      })
      .catch((err) => {
        console.error('[SW] Erreur d\'enregistrement:', err);
        setSwState('error');
      });
  }, []);

  // Sauvegarder des données dans le cache
  const cacheData = useCallback((data: any) => {
    if (!registration || !registration.active) return;

    const messageChannel = new MessageChannel();
    registration.active.postMessage(
      { type: 'CACHE_CALENDRIER_DATA', data },
      [messageChannel.port2]
    );
  }, [registration]);

  // Récupérer des données du cache
  const getCachedData = useCallback((): Promise<any> => {
    return new Promise((resolve) => {
      if (!registration || !registration.active) {
        resolve(null);
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.data);
        } else {
          resolve(null);
        }
      };

      registration.active.postMessage(
        { type: 'GET_CALENDRIER_DATA' },
        [messageChannel.port2]
      );
    });
  }, [registration]);

  // Forcer la mise à jour du Service Worker
  const updateServiceWorker = useCallback(() => {
    if (!registration) return;

    registration.update();
  }, [registration]);

  return {
    swState,
    isOnline,
    registration,
    cacheData,
    getCachedData,
    updateServiceWorker,
  };
}

