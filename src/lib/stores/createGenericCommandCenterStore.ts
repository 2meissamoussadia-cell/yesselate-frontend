/**
 * Factory pour créer des stores Zustand de type CommandCenter
 * ===========================================================
 * 
 * Centralise la logique répétitive de gestion :
 * - Navigation 3 niveaux (mainCategory, subCategory, filter)
 * - Historique de navigation
 * - Modales et panels
 * - KPI config
 * - Filtres avancés
 * 
 * Usage:
 * ```ts
 * const useMyCommandCenterStore = createGenericCommandCenterStore({
 *   moduleName: 'myModule',
 *   defaultNavigation: { mainCategory: 'overview', subCategory: 'all', filter: null },
 *   storageKey: 'bmo:myModule:commandCenter',
 * });
 * ```
 */

import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

// ============================================
// TYPES GÉNÉRIQUES
// ============================================

/** État de navigation */
export interface NavigationState<TMain extends string = string, TSub extends string = string> {
  mainCategory: TMain;
  subCategory: TSub;
  filter: string | null;
}

/** État d'une modale */
export interface ModalState<TType extends string = string> {
  type: TType | null;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

/** Configuration KPI */
export interface KPIConfig {
  visible: boolean;
  collapsed: boolean;
  items?: string[];
}

/** Filtres sauvegardés */
export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: number;
}

/** Configuration pour créer un store CommandCenter */
export interface CommandCenterStoreConfig<
  TMain extends string = string,
  TSub extends string = string,
  TModalType extends string = string
> {
  /** Nom du module (pour les logs et identifiants) */
  moduleName: string;
  /** Navigation par défaut */
  defaultNavigation: NavigationState<TMain, TSub>;
  /** Clé de stockage localStorage */
  storageKey: string;
  /** Taille max de l'historique (défaut: 50) */
  maxHistorySize?: number;
}

/** État du store CommandCenter générique */
export interface GenericCommandCenterState<
  TMain extends string = string,
  TSub extends string = string,
  TModalType extends string = string
> {
  // === Navigation ===
  navigation: NavigationState<TMain, TSub>;
  navigationHistory: NavigationState<TMain, TSub>[];
  
  // === UI ===
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;
  
  // === Modal ===
  modal: ModalState<TModalType>;
  modalStack: ModalState<TModalType>[];
  
  // === Filtres ===
  filters: Record<string, unknown>;
  savedFilters: SavedFilter[];
  
  // === KPI ===
  kpiConfig: KPIConfig;
  
  // === Sélection ===
  selectedItems: string[];
  
  // === Recherche ===
  globalSearch: string;
  
  // === Actions Navigation ===
  navigate: (mainCategory: TMain, subCategory: TSub, filter: string | null) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  
  // === Actions UI ===
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;
  setGlobalSearch: (search: string) => void;
  
  // === Actions Modal ===
  openModal: (type: TModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  pushModal: (type: TModalType, data?: Record<string, unknown>) => void;
  popModal: () => void;
  
  // === Actions Filtres ===
  setFilter: <K extends string>(key: K, value: unknown) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;
  
  // === Actions KPI ===
  setKPIConfig: (config: Partial<KPIConfig>) => void;
  
  // === Actions Sélection ===
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  
  // === Reset ===
  reset: () => void;
}

// ============================================
// FACTORY
// ============================================

/**
 * Crée un store Zustand de type CommandCenter avec persistance
 */
export function createGenericCommandCenterStore<
  TMain extends string = string,
  TSub extends string = string,
  TModalType extends string = string
>(config: CommandCenterStoreConfig<TMain, TSub, TModalType>) {
  const { moduleName, defaultNavigation, storageKey, maxHistorySize = 50 } = config;

  type State = GenericCommandCenterState<TMain, TSub, TModalType>;

  const initialState = {
    navigation: defaultNavigation,
    navigationHistory: [] as NavigationState<TMain, TSub>[],
    sidebarCollapsed: false,
    fullscreen: false,
    commandPaletteOpen: false,
    notificationsPanelOpen: false,
    modal: { type: null, isOpen: false } as ModalState<TModalType>,
    modalStack: [] as ModalState<TModalType>[],
    filters: {} as Record<string, unknown>,
    savedFilters: [] as SavedFilter[],
    kpiConfig: { visible: true, collapsed: false } as KPIConfig,
    selectedItems: [] as string[],
    globalSearch: '',
  };

  const storeCreator: StateCreator<State, [], [['zustand/persist', Partial<State>]]> = (set, get) => ({
    ...initialState,

    // === Actions Navigation ===
    navigate: (mainCategory, subCategory, filter) => {
      set((state) => {
        // Ajouter à l'historique
        const history = [...state.navigationHistory, state.navigation].slice(-maxHistorySize);
        
        return {
          navigation: { mainCategory, subCategory, filter },
          navigationHistory: history,
        };
      });
    },

    goBack: () => {
      set((state) => {
        if (state.navigationHistory.length === 0) return state;
        
        const history = [...state.navigationHistory];
        const previous = history.pop();
        
        return {
          navigation: previous || defaultNavigation,
          navigationHistory: history,
        };
      });
    },

    canGoBack: () => get().navigationHistory.length > 0,

    // === Actions UI ===
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
    toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
    toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),
    setGlobalSearch: (search) => set({ globalSearch: search }),

    // === Actions Modal ===
    openModal: (type, data) => {
      set({ modal: { type, isOpen: true, data } });
    },

    closeModal: () => {
      set({ modal: { type: null, isOpen: false, data: undefined } });
    },

    pushModal: (type, data) => {
      set((state) => ({
        modalStack: [...state.modalStack, state.modal],
        modal: { type, isOpen: true, data },
      }));
    },

    popModal: () => {
      set((state) => {
        const stack = [...state.modalStack];
        const previous = stack.pop();
        return {
          modalStack: stack,
          modal: previous || { type: null, isOpen: false },
        };
      });
    },

    // === Actions Filtres ===
    setFilter: (key, value) => {
      set((state) => ({
        filters: { ...state.filters, [key]: value },
      }));
    },

    resetFilters: () => set({ filters: {} }),

    saveFilter: (name) => {
      set((state) => ({
        savedFilters: [
          ...state.savedFilters,
          {
            id: `filter-${Date.now()}`,
            name,
            filters: state.filters,
            createdAt: Date.now(),
          },
        ],
      }));
    },

    loadFilter: (id) => {
      const saved = get().savedFilters.find((f) => f.id === id);
      if (saved) {
        set({ filters: saved.filters });
      }
    },

    deleteFilter: (id) => {
      set((state) => ({
        savedFilters: state.savedFilters.filter((f) => f.id !== id),
      }));
    },

    // === Actions KPI ===
    setKPIConfig: (config) => {
      set((state) => ({
        kpiConfig: { ...state.kpiConfig, ...config },
      }));
    },

    // === Actions Sélection ===
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

    toggleItem: (id) => {
      set((state) => ({
        selectedItems: state.selectedItems.includes(id)
          ? state.selectedItems.filter((i) => i !== id)
          : [...state.selectedItems, id],
      }));
    },

    selectAll: (ids) => set({ selectedItems: ids }),

    clearSelection: () => set({ selectedItems: [] }),

    // === Reset ===
    reset: () => set(initialState),
  });

  // Créer le store avec persistance
  return create<State>()(
    persist(storeCreator, {
      name: storageKey,
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiConfig: state.kpiConfig,
        savedFilters: state.savedFilters,
      }),
    } as PersistOptions<State, Partial<State>>)
  );
}

// ============================================
// TYPES EXPORT
// ============================================

export type { NavigationState, ModalState, KPIConfig, SavedFilter };
