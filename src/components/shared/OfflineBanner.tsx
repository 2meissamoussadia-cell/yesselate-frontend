'use client';

/**
 * OfflineBanner — Affiche un bandeau lorsque l'utilisateur est hors ligne.
 * Détection via navigator.onLine et événements window 'online' / 'offline'.
 * État initial toujours true (pas de bandeau) pour éviter un mismatch SSR/hydratation.
 */

import React, { useState, useEffect } from 'react';

export function OfflineBanner() {
  // Toujours true au premier rendu (serveur + client) pour éviter hydration mismatch
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] px-4 py-2 bg-amber-600 text-amber-950 text-center text-sm font-medium shadow-md"
    >
      Vous êtes hors ligne. Certaines données peuvent ne pas être à jour.
    </div>
  );
}
