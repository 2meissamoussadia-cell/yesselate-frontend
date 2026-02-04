'use client';

/**
 * OfflineIndicator — Indicateur mode hors ligne + actions en attente
 */

import React from 'react';
import { useOfflineStore, useNetworkStatus } from '@/lib/offline/offline-manager';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export function OfflineIndicator() {
  useNetworkStatus();

  const {
    isOnline,
    pendingActions,
    syncInProgress,
    lastSyncAt,
    sync,
  } = useOfflineStore();

  const unsyncedCount = pendingActions.filter((a) => !a.synced).length;

  if (isOnline && unsyncedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border',
        isOnline
          ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
          : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
      )}
    >
      {isOnline ? (
        <Wifi className="h-5 w-5" />
      ) : (
        <WifiOff className="h-5 w-5" />
      )}
      <div className="flex-1">
        {isOnline ? (
          <>
            <p className="text-sm font-medium">
              {syncInProgress ? 'Synchronisation...' : `${unsyncedCount} action(s) en attente`}
            </p>
            {lastSyncAt && (
              <p className="text-xs opacity-75">
                Dernière sync : {new Date(lastSyncAt).toLocaleTimeString('fr-FR')}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-medium">Mode hors ligne</p>
            <p className="text-xs opacity-75">
              {unsyncedCount} action(s) seront synchronisées à la reconnexion
            </p>
          </>
        )}
      </div>
      {isOnline && unsyncedCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => sync()}
          disabled={syncInProgress}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={cn('h-4 w-4', syncInProgress && 'animate-spin')} />
        </Button>
      )}
    </div>
  );
}
