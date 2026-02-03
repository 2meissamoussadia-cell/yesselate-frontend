/**
 * Hook pour détecter le statut réseau (online/offline)
 */

import { useEffect } from 'react';
import { useOfflineStore } from '@/lib/offline/offline-manager';

export function useNetworkStatus() {
  const setOnlineStatus = useOfflineStore((s) => s.setOnlineStatus);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    setOnlineStatus(typeof navigator !== 'undefined' ? navigator.onLine : true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);
}
