/**
 * Store Zustand pour la navigation du Dashboard
 * Gère l'état de navigation (main, sub, leaf)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  main: string;
  sub: string | null;
  leaf: string | null;
}

interface NavigationActions {
  setMain: (main: string) => void;
  setSub: (sub: string | null) => void;
  setLeaf: (leaf: string | null) => void;
  // Helper pour naviguer en une fois
  navigate: (main: string, sub?: string | null, leaf?: string | null) => void;
  // Reset aux valeurs par défaut
  reset: () => void;
}

type NavigationStore = NavigationState & NavigationActions;

const initialState: NavigationState = {
  main: 'overview',
  sub: null,
  leaf: null,
};

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      ...initialState,

      setMain: (main) => set({ main, sub: null, leaf: null }),

      setSub: (sub) => set({ sub, leaf: null }),

      setLeaf: (leaf) => set({ leaf }),

      navigate: (main, sub, leaf) => {
        set({
          main,
          sub: sub ?? null,
          leaf: leaf ?? null,
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'general-navigation-storage', // Nom de la clé dans localStorage (renommé pour éviter conflit avec dashboardNavigationStore)
      // Optionnel: ne persister que certaines clés
      // partialize: (state) => ({ main: state.main, sub: state.sub }),
    }
  )
);

