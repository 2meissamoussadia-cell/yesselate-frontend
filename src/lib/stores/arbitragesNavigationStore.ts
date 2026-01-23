/**
 * Store Zustand pour la navigation du module Arbitrages-Vivants
 * Pattern cohérent avec dashboardNavigationStore
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ArbitragesMainCategory } from '@/modules/arbitrages-vivants/types/arbitragesTypes';

export interface ArbitragesNavigationState {
  main: ArbitragesMainCategory;
  sub: string | null;
  subSub: string | null;
}

interface ArbitragesNavigationStore extends ArbitragesNavigationState {
  // Actions
  setMain: (main: ArbitragesMainCategory) => void;
  setSub: (sub: string | null) => void;
  setSubSub: (subSub: string | null) => void;
  setNavigation: (navigation: Partial<ArbitragesNavigationState>) => void;
  reset: () => void;
}

// État initial
const initialState: ArbitragesNavigationState = {
  main: 'overview',
  sub: 'all',
  subSub: null,
};

// Snapshot pour SSR (stable reference)
const serverSnapshot: ArbitragesNavigationState = { ...initialState };

export const useArbitragesNavigationStore = create<ArbitragesNavigationStore>()(
  persist(
    (set) => ({
      ...initialState,

      setMain: (main) => {
        set((state) => {
          // Ne mettre à jour que si la valeur change
          if (state.main === main) return state;
          return {
            main,
            // Réinitialiser sub et subSub lors du changement de main
            sub: 'all',
            subSub: null,
          };
        });
      },

      setSub: (sub) => {
        set((state) => {
          // Ne mettre à jour que si la valeur change
          if (state.sub === sub) return state;
          return {
            sub,
            // Réinitialiser subSub lors du changement de sub
            subSub: null,
          };
        });
      },

      setSubSub: (subSub) => {
        set((state) => {
          // Ne mettre à jour que si la valeur change
          if (state.subSub === subSub) return state;
          return { subSub };
        });
      },

      setNavigation: (navigation) => {
        set((state) => ({
          main: navigation.main ?? state.main,
          sub: navigation.sub ?? state.sub,
          subSub: navigation.subSub ?? state.subSub,
        }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'arbitrages-navigation',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migration pour les versions futures
        if (version === 0) {
          // Migration depuis v0 vers v1
          return {
            ...initialState,
            ...(persistedState as Partial<ArbitragesNavigationState>),
          };
        }
        return persistedState as ArbitragesNavigationState;
      },
      // Snapshot stable pour SSR
      getServerSnapshot: () => serverSnapshot,
    }
  )
);
