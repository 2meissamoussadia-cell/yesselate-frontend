/**
 * Factory pour créer des stores Zustand de type Workspace
 * ========================================================
 * 
 * Centralise la logique répétitive de gestion :
 * - Onglets (tabs)
 * - Sélection multiple
 * - Filtres
 * - État UI (command palette, modals, panels)
 * 
 * Usage:
 * ```ts
 * const useMyWorkspaceStore = createGenericWorkspaceStore({
 *   moduleName: 'myModule',
 *   defaultTabType: 'inbox',
 *   storageKey: 'bmo:myModule:workspace',
 * });
 * ```
 */

import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

// ============================================
// TYPES GÉNÉRIQUES
// ============================================

/** Structure d'un onglet générique */
export interface GenericTab<TType extends string = string, TData = Record<string, unknown>> {
  id: string;
  type: TType;
  title: string;
  icon?: string;
  data?: TData;
  isDirty?: boolean;
  createdAt: number;
  ui?: Record<string, unknown>;
}

/** Filtres génériques */
export interface GenericFilter {
  status?: string | string[];
  category?: string | string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

/** Configuration pour créer un store workspace */
export interface WorkspaceStoreConfig<
  TTabType extends string = string,
  TTabData = Record<string, unknown>,
  TFilter extends GenericFilter = GenericFilter
> {
  /** Nom du module (pour les logs et identifiants) */
  moduleName: string;
  /** Type d'onglet par défaut */
  defaultTabType: TTabType;
  /** Clé de stockage localStorage */
  storageKey: string;
  /** Filtres par défaut */
  defaultFilter?: Partial<TFilter>;
  /** Nombre max d'onglets (défaut: 20) */
  maxTabs?: number;
}

/** État du store workspace générique */
export interface GenericWorkspaceState<
  TTabType extends string = string,
  TTabData = Record<string, unknown>,
  TFilter extends GenericFilter = GenericFilter
> {
  // === Onglets ===
  tabs: GenericTab<TTabType, TTabData>[];
  activeTabId: string | null;
  
  // === Sélection ===
  selectedIds: Set<string>;
  
  // === Filtres ===
  currentFilter: TFilter;
  
  // === État UI ===
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;
  filtersPanelOpen: boolean;
  notificationsPanelOpen: boolean;
  sidebarCollapsed: boolean;
  
  // === Actions Onglets ===
  openTab: (input: Omit<GenericTab<TTabType, TTabData>, 'createdAt'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
  updateTab: (tabId: string, updates: Partial<GenericTab<TTabType, TTabData>>) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  closeOtherTabs: (keepTabId: string) => void;
  closeAllTabs: () => void;
  
  // === Actions Sélection ===
  toggleSelected: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
  
  // === Actions Filtres ===
  setFilter: (filter: Partial<TFilter>) => void;
  resetFilter: () => void;
  
  // === Actions UI ===
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  setFiltersPanelOpen: (open: boolean) => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // === Reset ===
  reset: () => void;
}

// ============================================
// FACTORY
// ============================================

/**
 * Crée un store Zustand de type Workspace avec persistance
 */
export function createGenericWorkspaceStore<
  TTabType extends string = string,
  TTabData = Record<string, unknown>,
  TFilter extends GenericFilter = GenericFilter
>(config: WorkspaceStoreConfig<TTabType, TTabData, TFilter>) {
  const { moduleName, defaultTabType, storageKey, defaultFilter = {}, maxTabs = 20 } = config;

  type State = GenericWorkspaceState<TTabType, TTabData, TFilter>;

  const initialState = {
    tabs: [] as GenericTab<TTabType, TTabData>[],
    activeTabId: null,
    selectedIds: new Set<string>(),
    currentFilter: defaultFilter as TFilter,
    commandPaletteOpen: false,
    statsModalOpen: false,
    filtersPanelOpen: false,
    notificationsPanelOpen: false,
    sidebarCollapsed: false,
  };

  const storeCreator: StateCreator<State, [], [['zustand/persist', Partial<State>]]> = (set, get) => ({
    ...initialState,

    // === Actions Onglets ===
    openTab: (input) => {
      set((state) => {
        // Vérifier si l'onglet existe déjà
        const existing = state.tabs.find((t) => t.id === input.id);
        if (existing) {
          return { activeTabId: input.id };
        }

        // Limiter le nombre d'onglets
        let tabs = [...state.tabs];
        if (tabs.length >= maxTabs) {
          tabs = tabs.slice(-maxTabs + 1);
        }

        const newTab: GenericTab<TTabType, TTabData> = {
          ...input,
          createdAt: Date.now(),
        };

        return {
          tabs: [...tabs, newTab],
          activeTabId: input.id,
        };
      });
    },

    closeTab: (tabId) => {
      set((state) => {
        const tabs = state.tabs.filter((t) => t.id !== tabId);
        let activeTabId = state.activeTabId;

        if (activeTabId === tabId) {
          const closedIndex = state.tabs.findIndex((t) => t.id === tabId);
          activeTabId = tabs[closedIndex - 1]?.id ?? tabs[0]?.id ?? null;
        }

        return { tabs, activeTabId };
      });
    },

    setActiveTab: (tabId) => set({ activeTabId: tabId }),

    updateTab: (tabId, updates) => {
      set((state) => ({
        tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
      }));
    },

    reorderTabs: (fromIndex, toIndex) => {
      set((state) => {
        const tabs = [...state.tabs];
        const [removed] = tabs.splice(fromIndex, 1);
        tabs.splice(toIndex, 0, removed);
        return { tabs };
      });
    },

    closeOtherTabs: (keepTabId) => {
      set((state) => ({
        tabs: state.tabs.filter((t) => t.id === keepTabId),
        activeTabId: keepTabId,
      }));
    },

    closeAllTabs: () => set({ tabs: [], activeTabId: null }),

    // === Actions Sélection ===
    toggleSelected: (id) => {
      set((state) => {
        const newSet = new Set(state.selectedIds);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return { selectedIds: newSet };
      });
    },

    selectMany: (ids) => {
      set((state) => {
        const newSet = new Set(state.selectedIds);
        ids.forEach((id) => newSet.add(id));
        return { selectedIds: newSet };
      });
    },

    clearSelection: () => set({ selectedIds: new Set() }),

    selectAll: (ids) => set({ selectedIds: new Set(ids) }),

    // === Actions Filtres ===
    setFilter: (filter) => {
      set((state) => ({
        currentFilter: { ...state.currentFilter, ...filter },
      }));
    },

    resetFilter: () => set({ currentFilter: defaultFilter as TFilter }),

    // === Actions UI ===
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    setStatsModalOpen: (open) => set({ statsModalOpen: open }),
    setFiltersPanelOpen: (open) => set({ filtersPanelOpen: open }),
    setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    // === Reset ===
    reset: () => set(initialState),
  });

  // Créer le store avec persistance
  return create<State>()(
    persist(storeCreator, {
      name: storageKey,
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        currentFilter: state.currentFilter,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      // Convertir Set en Array pour la sérialisation
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed.state?.selectedIds) {
            parsed.state.selectedIds = new Set(parsed.state.selectedIds);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              selectedIds: value.state?.selectedIds
                ? Array.from(value.state.selectedIds)
                : [],
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    } as PersistOptions<State, Partial<State>>)
  );
}

// Types GenericTab, GenericFilter are exported above via interface declarations
