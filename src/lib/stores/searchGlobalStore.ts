/**
 * Store Zustand pour la recherche globale (Cmd/Ctrl+K)
 * Gère les recherches récentes persistées en localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentSearchEntry {
  /** Query tapée par l'utilisateur */
  query: string;
  /** Type de résultat sélectionné (chantier, client, etc.) */
  type: string;
  /** ID de l'entité */
  id: string;
  /** Titre affiché (pour réaffichage) */
  title: string;
  /** URL de destination */
  href: string;
  /** Timestamp de la sélection */
  at: number;
}

const MAX_RECENT = 10;

interface SearchGlobalState {
  recent: RecentSearchEntry[];
}

interface SearchGlobalActions {
  /** Enregistre une sélection comme recherche récente */
  addRecent: (entry: Omit<RecentSearchEntry, 'at'>) => void;
  /** Supprime une entrée récente par index */
  removeRecent: (index: number) => void;
  /** Vide les recherches récentes */
  clearRecent: () => void;
}

type SearchGlobalStore = SearchGlobalState & SearchGlobalActions;

const initialState: SearchGlobalState = {
  recent: [],
};

export const useSearchGlobalStore = create<SearchGlobalStore>()(
  persist(
    (set) => ({
      ...initialState,

      addRecent: (entry) =>
        set((state) => {
          const at = Date.now();
          const newEntry: RecentSearchEntry = { ...entry, at };
          const withoutDuplicate = state.recent.filter(
            (r) => !(r.type === entry.type && r.id === entry.id)
          );
          const next = [newEntry, ...withoutDuplicate].slice(0, MAX_RECENT);
          return { recent: next };
        }),

      removeRecent: (index) =>
        set((state) => ({
          recent: state.recent.filter((_, i) => i !== index),
        })),

      clearRecent: () => set({ recent: [] }),
    }),
    {
      name: 'search-global-recent',
      storage:
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
    }
  )
);

/** Hook avec getServerSnapshot pour éviter hydration mismatch (optionnel) */
export function useRecentSearches(): RecentSearchEntry[] {
  return useSearchGlobalStore((s) => s.recent);
}
