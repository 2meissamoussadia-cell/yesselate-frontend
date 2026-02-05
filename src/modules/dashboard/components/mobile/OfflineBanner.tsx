/**
 * Bandeau "Hors ligne" — affiché quand navigator.onLine est false.
 * Offline-first : rappel que les données peuvent être en cache.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn';

export function OfflineBanner() {
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
      className={cn(
        'fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2',
        'py-2 px-4 bg-amber-950/95 border-b border-amber-700/50 text-amber-200 text-sm',
        'backdrop-blur-sm pt-[max(0.5rem,env(safe-area-inset-top))]'
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <span>Mode hors ligne — données en cache. Synchronisation au retour du réseau.</span>
    </div>
  );
}
