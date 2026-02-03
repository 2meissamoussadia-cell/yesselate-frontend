'use client';

/**
 * Gestionnaire Offline — Actions en attente, synchronisation
 * Persiste dans localStorage (compatible sans localforage)
 */

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  synced: boolean;
  error?: string;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  syncInProgress: boolean;
  lastSyncAt: number | null;

  addPendingAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) => void;
  sync: () => Promise<void>;
  clearSynced: () => void;
  setOnlineStatus: (online: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      pendingActions: [],
      syncInProgress: false,
      lastSyncAt: null,

      addPendingAction: (actionData) => {
        const action: OfflineAction = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          synced: false,
          ...actionData,
        };
        set((state) => ({ pendingActions: [...state.pendingActions, action] }));
        if (get().isOnline) {
          get().sync();
        }
      },

      sync: async () => {
        const { pendingActions, isOnline, syncInProgress } = get();
        if (!isOnline || syncInProgress || pendingActions.length === 0) return;

        set({ syncInProgress: true });
        const unsynced = pendingActions.filter((a) => !a.synced);

        for (const action of unsynced) {
          try {
            const res = await fetch('/api/offline-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action),
            });
            if (!res.ok) throw new Error(res.statusText);

            set((state) => ({
              pendingActions: state.pendingActions.map((a) =>
                a.id === action.id ? { ...a, synced: true } : a
              ),
            }));
          } catch (err) {
            set((state) => ({
              pendingActions: state.pendingActions.map((a) =>
                a.id === action.id
                  ? { ...a, error: (err as Error).message }
                  : a
              ),
            }));
          }
        }

        set({
          syncInProgress: false,
          lastSyncAt: Date.now(),
        });
      },

      clearSynced: () => {
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => !a.synced),
        }));
      },

      setOnlineStatus: (online) => {
        set({ isOnline: online });
        if (online) get().sync();
      },
    }),
    {
      name: 'bmo-offline-storage',
      partialize: (s) => ({ pendingActions: s.pendingActions }),
    }
  )
);

/**
 * Hook pour détecter le statut réseau (online/offline)
 */
export function useNetworkStatus() {
  const setOnlineStatus = useOfflineStore((s) => s.setOnlineStatus);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    setOnlineStatus(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);
}
