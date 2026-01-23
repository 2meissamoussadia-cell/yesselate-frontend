/**
 * Store Zustand pour la navigation du Dashboard
 * Gère l'état de navigation (main, sub, leaf)
 * ✅ Optimisé pour éviter les re-renders inutiles et les boucles
 * 
 * @version 2 - Ajout de la migration pour gérer les anciennes versions
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

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

// ✅ Version actuelle du store (incrémenter lors de changements de structure)
const CURRENT_STORE_VERSION = 2;

// ✅ État initial par défaut
const initialState: DashboardNavigationState = {
  main: 'overview',
  sub: null,
  leaf: null,
};

// ✅ Snapshot stable et mémorisé pour SSR (évite l'erreur "getServerSnapshot should be cached")
// IMPORTANT: Cette fonction doit retourner la même référence à chaque appel
// On mémorise l'objet pour éviter de créer une nouvelle référence à chaque appel
const serverSnapshot: DashboardNavigationStore = {
  ...initialState,
  setMain: () => {},
  setSub: () => {},
  setLeaf: () => {},
} as const;

const getServerSnapshot = () => serverSnapshot;

// ✅ Fonction de migration robuste pour gérer les anciennes versions
// Gère les migrations entre versions et nettoie le localStorage si nécessaire
function migrate(
  persistedState: any,
  version: number
): DashboardNavigationState {
  // Si pas de version ou version invalide, reset
  if (!version || version < 1) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[dashboardNavigationStore] Version invalide, reset de l\'état');
    }
    return initialState;
  }

  // Version 1 → Version 2: Aucun changement de structure, juste validation
  if (version === 1) {
    const state = persistedState as Partial<DashboardNavigationState>;
    return {
      main: typeof state.main === 'string' ? state.main : initialState.main,
      sub: state.sub !== undefined ? state.sub : initialState.sub,
      leaf: state.leaf !== undefined ? state.leaf : initialState.leaf,
    };
  }

  // Version actuelle ou supérieure: retourner tel quel si structure valide
  if (version >= CURRENT_STORE_VERSION) {
    const state = persistedState as Partial<DashboardNavigationState>;
    // Valider la structure
    if (
      typeof state.main === 'string' &&
      (state.sub === null || typeof state.sub === 'string') &&
      (state.leaf === null || typeof state.leaf === 'string')
    ) {
      return {
        main: state.main,
        sub: state.sub ?? null,
        leaf: state.leaf ?? null,
      };
    }
  }

  // Si migration impossible, reset
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[dashboardNavigationStore] Migration impossible de la version ${version}, reset de l'état`
    );
  }
  return initialState;
}

export const useDashboardNavigationStore = create<DashboardNavigationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ✅ Éviter mise à jour si valeur identique
      setMain: (main) => {
        const current = get();
        if (current.main === main) return;
        set({ main, sub: null, leaf: null });
      },

      // ✅ Éviter mise à jour si valeur identique
      setSub: (sub) => {
        const current = get();
        if (current.sub === sub) return;
        set({ sub, leaf: null });
      },

      // ✅ Éviter mise à jour si valeur identique
      setLeaf: (leaf) => {
        const current = get();
        if (current.leaf === leaf) return;
        set({ leaf });
      },
    }),
    {
      name: 'dashboard-navigation-storage',
      version: CURRENT_STORE_VERSION,
      // ✅ Fonction de migration robuste avec gestion d'erreurs
      migrate: (persistedState: any, version: number) => {
        try {
          return migrate(persistedState, version);
        } catch (error) {
          // En cas d'erreur lors de la migration, nettoyer le localStorage et reset
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('dashboard-navigation-storage');
              if (process.env.NODE_ENV === 'development') {
                console.warn(
                  '[dashboardNavigationStore] Erreur lors de la migration, localStorage nettoyé',
                  error
                );
              }
            } catch (cleanupError) {
              // Ignorer les erreurs de nettoyage
            }
          }
          return initialState;
        }
      },
      storage: createJSONStorage(() => {
        // ✅ Vérifier que localStorage est disponible
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as StateStorage;
        }
        return localStorage;
      }),
      // ✅ Snapshot stable pour SSR (évite l'erreur "getServerSnapshot should be cached")
      // IMPORTANT: Retourne toujours la même référence
      getServerSnapshot,
      // ✅ Ne persister que les valeurs de navigation (pas les actions)
      partialize: (state) => ({
        main: state.main,
        sub: state.sub,
        leaf: state.leaf,
      }),
    }
  )
);

// ✅ Hook avec shallow comparison pour éviter re-renders
export function useDashboardNavigationState(): Pick<DashboardNavigationStore, 'main' | 'sub' | 'leaf'> {
  return useDashboardNavigationStore(
    (state) => ({ 
      main: state.main, 
      sub: state.sub, 
      leaf: state.leaf 
    }),
    shallow
  );
}

// ✅ Hook pour actions seulement (stables, pas de re-render)
export function useDashboardNavigationActions() {
  return useDashboardNavigationStore((state) => ({
    setMain: state.setMain,
    setSub: state.setSub,
    setLeaf: state.setLeaf,
  }));
}

