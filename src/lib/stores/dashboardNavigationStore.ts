/**
 * Store Zustand pour la navigation du Dashboard
 * Gère l'état de navigation (main, sub, leaf)
 * ✅ Optimisé pour éviter les re-renders inutiles et les boucles
 * ✅ Amélioré avec validation des routes et meilleure gestion d'erreurs
 * 
 * @version 2 - Ajout de la migration pour gérer les anciennes versions
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { isValidRoute, normalizeRoute } from '@/modules/dashboard/utils/routeValidation';

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

      // ✅ Éviter mise à jour si valeur identique + validation
      setMain: (main) => {
        const current = get();
        if (current.main === main) return;
        
        // ✅ Valider et normaliser la route
        const normalized = normalizeRoute(main, null, null);
        
        // ✅ Vérifier que la route est valide
        if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[dashboardNavigationStore] Route invalide pour main:', main);
          }
          // Utiliser la route normalisée qui devrait être valide
          set({ 
            main: normalized.main || initialState.main, 
            sub: null, 
            leaf: null 
          });
          return;
        }
        
        set({ main: normalized.main, sub: null, leaf: null });
      },

      // ✅ Éviter mise à jour si valeur identique + validation
      setSub: (sub) => {
        const current = get();
        if (current.sub === sub) return;
        
        // ✅ Valider la route avec le main actuel
        const main = current.main;
        const normalized = normalizeRoute(main, sub, null);
        
        // ✅ Vérifier que la route est valide
        if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[dashboardNavigationStore] Route invalide pour sub:', sub, 'avec main:', main);
          }
          // Si la route n'est pas valide, réinitialiser sub et leaf
          set({ sub: null, leaf: null });
          return;
        }
        
        set({ sub: normalized.sub, leaf: null });
      },

      // ✅ Éviter mise à jour si valeur identique + validation
      setLeaf: (leaf) => {
        const current = get();
        if (current.leaf === leaf) return;
        
        // ✅ Valider la route avec le main et sub actuels
        const main = current.main;
        const sub = current.sub;
        const normalized = normalizeRoute(main, sub, leaf);
        
        // ✅ Vérifier que la route est valide
        if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[dashboardNavigationStore] Route invalide pour leaf:', leaf, 'avec main:', main, 'sub:', sub);
          }
          // Si la route n'est pas valide, réinitialiser leaf uniquement
          set({ leaf: null });
          return;
        }
        
        set({ leaf: normalized.leaf });
      },
    }),
    {
      name: 'dashboard-navigation-storage',
      version: CURRENT_STORE_VERSION,
      // ✅ Fonction de migration robuste avec gestion d'erreurs et validation
      migrate: (persistedState: any, version: number) => {
        try {
          const migratedState = migrate(persistedState, version);
          
          // ✅ Valider la route migrée
          if (!isValidRoute(migratedState.main, migratedState.sub, migratedState.leaf)) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                '[dashboardNavigationStore] Route migrée invalide, normalisation',
                migratedState
              );
            }
            // Normaliser la route migrée
            const normalized = normalizeRoute(
              migratedState.main,
              migratedState.sub,
              migratedState.leaf
            );
            return {
              main: normalized.main || initialState.main,
              sub: normalized.sub || initialState.sub,
              leaf: normalized.leaf || initialState.leaf,
            };
          }
          
          return migratedState;
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

// ✅ Hook avec sélecteurs individuels pour éviter les problèmes avec getServerSnapshot
// IMPORTANT: Ne pas utiliser de sélecteur qui retourne un objet avec shallow dans un contexte SSR
// Utiliser des sélecteurs individuels directement dans les composants au lieu de ce hook
// Ce hook est conservé pour compatibilité mais devrait être évité dans les contextes SSR
export function useDashboardNavigationState(): Pick<DashboardNavigationStore, 'main' | 'sub' | 'leaf'> {
  // ✅ Utiliser des sélecteurs individuels - plus sûr pour SSR et getServerSnapshot
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  
  // ⚠️ Retourner un objet - peut causer des problèmes avec getServerSnapshot si utilisé dans un contexte SSR
  // Préférer utiliser les sélecteurs individuels directement dans les composants
  return { main, sub, leaf };
}

// ✅ Hook pour actions seulement (stables, pas de re-render)
export function useDashboardNavigationActions() {
  return useDashboardNavigationStore((state) => ({
    setMain: state.setMain,
    setSub: state.setSub,
    setLeaf: state.setLeaf,
  }));
}

