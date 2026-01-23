/**
 * Store Zustand pour le Centre de Commandement Organigramme
 * Architecture cohérente avec Analytics et Governance Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type OrganigrammeMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'hierarchy'     // Hiérarchie
  | 'changes'       // Changements
  | 'positions'     // Postes
  | 'bureaux'       // Bureaux
  | 'teams'         // Équipes
  | 'skills'        // Compétences
  | 'history'       // Historique
  | 'analytics';    // Analyse

// Sous-catégories (niveau 2)
export type OrganigrammeSubCategory = string | null;

// Filtres de niveau 3
export type OrganigrammeFilter = string | null;

// État de navigation
export interface OrganigrammeNavigationState {
  mainCategory: OrganigrammeMainCategory;
  subCategory: OrganigrammeSubCategory;
  filter: OrganigrammeFilter;
}

// Types de modals
export type OrganigrammeModalType =
  | 'stats'
  | 'export'
  | 'report'
  | 'position-edit'
  | 'bureau-edit'
  | 'member-edit'
  | 'change-detail'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm';

// État des modals
export interface OrganigrammeModalState {
  type: OrganigrammeModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface OrganigrammeDetailPanelState {
  isOpen: boolean;
  type: 'position' | 'bureau' | 'member' | 'change' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface OrganigrammeActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  bureaux: string[];
  positions: string[];
  statuses: string[];
  changeTypes: ('promotion' | 'mutation' | 'depart' | 'arrivee' | 'restructuration')[];
  skills: string[];
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: OrganigrammeActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface OrganigrammeKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface OrganigrammeCommandCenterState {
  // Navigation
  navigation: OrganigrammeNavigationState;
  navigationHistory: OrganigrammeNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: OrganigrammeModalState;
  modalStack: OrganigrammeModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: OrganigrammeDetailPanelState;

  // Filtres
  filters: OrganigrammeActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: OrganigrammeKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: OrganigrammeMainCategory,
    sub?: OrganigrammeSubCategory,
    filter?: OrganigrammeFilter
  ) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;

  // Actions Modal
  openModal: (
    type: OrganigrammeModalType,
    data?: Record<string, any>,
    options?: Partial<OrganigrammeModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: OrganigrammeModalType,
    data?: Record<string, any>,
    options?: Partial<OrganigrammeModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'position' | 'bureau' | 'member' | 'change',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof OrganigrammeActiveFilters>(
    key: K,
    value: OrganigrammeActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<OrganigrammeKPIConfig>) => void;

  // Actions Sélection
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;

  // Actions Recherche
  setGlobalSearch: (term: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: OrganigrammeNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: OrganigrammeActiveFilters = {
  dateRange: { start: null, end: null },
  bureaux: [],
  positions: [],
  statuses: [],
  changeTypes: [],
  skills: [],
  customFilters: {},
};

const defaultKPIConfig: OrganigrammeKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: OrganigrammeModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: OrganigrammeDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useOrganigrammeCommandCenterStore = create<OrganigrammeCommandCenterState>()(
  persist(
    (set, get) => ({
      // Initial state
      navigation: defaultNavigation,
      navigationHistory: [],

      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,
      notificationsPanelOpen: false,

      modal: defaultModalState,
      modalStack: [],

      detailPanel: defaultDetailPanelState,

      filters: { ...defaultFilters },
      savedFilters: [],

      kpiConfig: { ...defaultKPIConfig },

      selectedItems: [],
      globalSearch: '',

      // Navigation Actions
      navigate: (main, sub = null, filter = null) => {
        const current = get().navigation;
        set((state) => ({
          navigationHistory: [...state.navigationHistory.slice(-9), current],
          navigation: {
            mainCategory: main,
            subCategory: sub,
            filter: filter,
          },
          // Reset selection on navigation
          selectedItems: [],
        }));
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length > 0) {
          const previous = history[history.length - 1];
          set({
            navigation: previous,
            navigationHistory: history.slice(0, -1),
          });
        }
      },

      resetNavigation: () => {
        set({
          navigation: defaultNavigation,
          navigationHistory: [],
        });
      },

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFullscreen: () => {
        const newFullscreen = !get().fullscreen;
        if (newFullscreen) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        set({ fullscreen: newFullscreen });
      },
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleNotificationsPanel: () =>
        set((state) => ({
          notificationsPanelOpen: !state.notificationsPanelOpen,
        })),

      // Modal Actions
      openModal: (type, data = {}, options = {}) => {
        set({
          modal: {
            type,
            isOpen: true,
            data,
            size: options.size || 'lg',
          },
        });
      },

      closeModal: () => {
        set({
          modal: defaultModalState,
        });
      },

      pushModal: (type, data = {}, options = {}) => {
        const current = get().modal;
        if (current.isOpen) {
          set((state) => ({
            modalStack: [...state.modalStack, current],
            modal: {
              type,
              isOpen: true,
              data,
              size: options.size || 'lg',
            },
          }));
        } else {
          get().openModal(type, data, options);
        }
      },

      popModal: () => {
        const stack = get().modalStack;
        if (stack.length > 0) {
          const previous = stack[stack.length - 1];
          set({
            modal: previous,
            modalStack: stack.slice(0, -1),
          });
        } else {
          get().closeModal();
        }
      },

      // Detail Panel Actions
      openDetailPanel: (type, entityId, data = {}) => {
        set({
          detailPanel: {
            isOpen: true,
            type,
            entityId,
            data,
          },
        });
      },

      closeDetailPanel: () => {
        set({
          detailPanel: defaultDetailPanelState,
        });
      },

      // Filter Actions
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      resetFilters: () => set({ filters: { ...defaultFilters } }),

      saveFilter: (name) => {
        const currentFilters = get().filters;
        const newFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters: { ...currentFilters },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, newFilter],
        }));
        return newFilter.id;
      },

      loadFilter: (id) => {
        const saved = get().savedFilters.find((f) => f.id === id);
        if (saved) {
          set({ filters: { ...saved.filters } });
        }
      },

      deleteFilter: (id) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },

      // KPI Actions
      setKPIConfig: (config) => {
        set((state) => ({
          kpiConfig: { ...state.kpiConfig, ...config },
        }));
      },

      // Selection Actions
      selectItem: (id) => {
        set((state) => ({
          selectedItems: state.selectedItems.includes(id)
            ? state.selectedItems
            : [...state.selectedItems, id],
        }));
      },

      deselectItem: (id) => {
        set((state) => ({
          selectedItems: state.selectedItems.filter((i) => i !== id),
        }));
      },

      selectAll: (ids) => set({ selectedItems: ids }),

      clearSelection: () => set({ selectedItems: [] }),

      toggleSelection: (id) => {
        const state = get();
        if (state.selectedItems.includes(id)) {
          state.deselectItem(id);
        } else {
          state.selectItem(id);
        }
      },

      // Search
      setGlobalSearch: (term) => set({ globalSearch: term }),
    }),
    {
      name: 'organigramme-command-center-storage',
      // Ne persister que ce qui est nécessaire
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        savedFilters: state.savedFilters,
        kpiConfig: state.kpiConfig,
        // Ne pas persister: modals, selections, search, etc.
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export const useOrganigrammeNavigation = () => {
  return useOrganigrammeCommandCenterStore((state) => ({
    navigation: state.navigation,
    navigate: state.navigate,
    goBack: state.goBack,
    resetNavigation: state.resetNavigation,
    canGoBack: state.navigationHistory.length > 0,
  }));
};

export const useOrganigrammeModal = () => {
  const { modal, openModal, closeModal, pushModal, popModal } =
    useOrganigrammeCommandCenterStore();
  return { modal, openModal, closeModal, pushModal, popModal };
};

export const useOrganigrammeFilters = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    savedFilters,
  } = useOrganigrammeCommandCenterStore();
  return {
    filters,
    setFilter,
    resetFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    savedFilters,
  };
};

export const useOrganigrammeSelection = () => {
  const {
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    toggleSelection,
  } = useOrganigrammeCommandCenterStore();
  return {
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    toggleSelection,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length,
  };
};

