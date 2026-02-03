/**
 * Moteur de recherche avancé BMO — Fuse.js, filtres, recherches récentes
 */

import Fuse from 'fuse.js';
import { create } from 'zustand';

export type SearchableEntityType = 'alert' | 'demande' | 'validation' | 'chantier' | 'document' | 'user';

export interface SearchableEntity {
  id: string;
  type: SearchableEntityType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  /** Route ou chemin pour navigation */
  href?: string;
}

export interface SearchFilter {
  type?: SearchableEntityType[];
  dateRange?: { start: Date; end: Date };
  tags?: string[];
  authors?: string[];
  chantiers?: string[];
  statuts?: string[];
}

export interface SearchMatch {
  key: string;
  value: string;
  indices: [number, number][];
}

export interface SearchResult {
  item: SearchableEntity;
  score: number;
  matches: SearchMatch[];
}

interface SearchState {
  index: Fuse<SearchableEntity> | null;
  entities: SearchableEntity[];

  query: string;
  filters: SearchFilter;
  results: SearchResult[];
  isSearching: boolean;
  recentSearches: string[];

  indexEntities: (entities: SearchableEntity[]) => void;
  addEntity: (entity: SearchableEntity) => void;
  updateEntity: (id: string, updates: Partial<SearchableEntity>) => void;
  removeEntity: (id: string) => void;

  search: (query: string, filters?: SearchFilter) => Promise<SearchResult[]>;
  clearSearch: () => void;

  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const RECENT_KEY = 'bmo-recent-searches';
const MAX_RECENT = 10;

function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(RECENT_KEY);
    return s ? (JSON.parse(s) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECENT_KEY, JSON.stringify(searches));
  }
}

export const useSearchStore = create<SearchState>((set, get) => ({
  index: null,
  entities: [],
  query: '',
  filters: {},
  results: [],
  isSearching: false,
  recentSearches: loadRecentSearches(),

  indexEntities: (entities) => {
    const fuse = new Fuse(entities, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 },
        { name: 'tags', weight: 1.5 },
        'metadata.chantier',
        'metadata.author',
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
    set({ index: fuse, entities });
  },

  addEntity: (entity) => {
    const { entities, indexEntities } = get();
    indexEntities([...entities, entity]);
  },

  updateEntity: (id, updates) => {
    const { entities, indexEntities } = get();
    const newEntities = entities.map((e) => (e.id === id ? { ...e, ...updates } : e));
    indexEntities(newEntities);
  },

  removeEntity: (id) => {
    const { entities, indexEntities } = get();
    indexEntities(entities.filter((e) => e.id !== id));
  },

  search: async (query, filters = {}) => {
    set({ isSearching: true, query, filters });

    const { index, entities } = get();

    if (!index || !query.trim()) {
      set({ results: [], isSearching: false });
      return [];
    }

    let fuseResults = index.search(query);

    if (filters.type?.length) {
      fuseResults = fuseResults.filter((r) => filters.type!.includes(r.item.type));
    }
    if (filters.dateRange) {
      fuseResults = fuseResults.filter((r) => {
        const d = new Date(r.item.createdAt);
        return d >= filters.dateRange!.start && d <= filters.dateRange!.end;
      });
    }
    if (filters.tags?.length) {
      fuseResults = fuseResults.filter((r) =>
        filters.tags!.some((tag) => r.item.tags.includes(tag))
      );
    }
    if (filters.authors?.length) {
      fuseResults = fuseResults.filter((r) =>
        filters.authors!.includes(String(r.item.metadata?.author ?? ''))
      );
    }
    if (filters.chantiers?.length) {
      fuseResults = fuseResults.filter((r) =>
        filters.chantiers!.includes(String(r.item.metadata?.chantier ?? ''))
      );
    }
    if (filters.statuts?.length) {
      fuseResults = fuseResults.filter((r) =>
        filters.statuts!.includes(String(r.item.metadata?.statut ?? ''))
      );
    }

    const results: SearchResult[] = fuseResults.map((r) => ({
      item: r.item,
      score: r.score ?? 0,
      matches: (r.matches ?? []).map((m) => ({
        key: m.key ?? '',
        value: m.value ?? '',
        indices: (m.indices ?? []) as [number, number][],
      })),
    }));

    set({ results, isSearching: false });
    get().addRecentSearch(query);
    return results;
  },

  clearSearch: () => set({ query: '', filters: {}, results: [] }),

  addRecentSearch: (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    set((state) => {
      const next = [trimmed, ...state.recentSearches.filter((q) => q !== trimmed)].slice(
        0,
        MAX_RECENT
      );
      saveRecentSearches(next);
      return { recentSearches: next };
    });
  },

  clearRecentSearches: () => {
    saveRecentSearches([]);
    set({ recentSearches: [] });
  },
}));
