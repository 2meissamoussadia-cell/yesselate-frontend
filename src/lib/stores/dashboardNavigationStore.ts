/**
 * Store Zustand pour la navigation du Dashboard
 * Gère l'état de navigation (main, sub, leaf)
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardNavigationState {
  main: string;
  sub: string | null;
  leaf: string | null;
}

interface DashboardNavigationActions {
  setMain: (main: string) => void;
  setSub: (sub: string | null) => void;
  setLeaf: (leaf: string | null) => void;
}

type DashboardNavigationStore = DashboardNavigationState & DashboardNavigationActions;

export const useDashboardNavigationStore = create<DashboardNavigationStore>()(
  persist(
    (set) => ({
      main: 'overview',
      sub: null,
      leaf: null,

      setMain: (main) => set({ main, sub: null, leaf: null }),

      setSub: (sub) => set({ sub, leaf: null }),

      setLeaf: (leaf) => set({ leaf }),
    }),
    {
      name: 'dashboard-navigation-storage', // Nom de la clé dans localStorage
    }
  )
);

