import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================
export type PaymentTabType = 
  | 'inbox' 
  | 'payment' 
  | 'facture' 
  | 'workflow' 
  | 'audit' 
  | 'batch' 
  | 'evidence' 
  | 'stats'
  | 'dashboard';

export type PaymentQueue = 
  | 'all' 
  | 'pending' 
  | '7days' 
  | 'late' 
  | 'critical' 
  | 'validated' 
  | 'blocked'
  | 'bf_pending'
  | 'dg_pending';

export type PaymentSubTab = 
  | 'details'
  | 'facture'
  | 'workflow'
  | 'audit'
  | 'evidence';

export interface PaymentTab {
  id: string;
  type: PaymentTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  closable?: boolean;
  subTab?: PaymentSubTab;
}

export interface PaymentFilters {
  queue: PaymentQueue;
  search: string;
  bureaux: string[];
  projects: string[];
  riskLevels: ('low' | 'medium' | 'high' | 'critical')[];
  amountMin?: number;
  amountMax?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
  hasFacture?: boolean;
  requiresBF?: boolean;
}

export interface PaymentSelection {
  ids: Set<string>;
  mode: 'single' | 'multi' | 'range';
}

interface PaymentValidationWorkspaceState {
  // Tabs
  tabs: PaymentTab[];
  activeTabId: string | null;
  
  // Filters
  filters: PaymentFilters;
  
  // Selection
  selection: PaymentSelection;
  
  // UI State
  viewMode: 'dashboard' | 'workspace';
  sidebarOpen: boolean;
  autoRefresh: boolean;
  compactMode: boolean;
  
  // Watchlist (pinned payments)
  watchlist: string[];
  
  // Actions
  openTab: (tab: PaymentTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<PaymentTab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  duplicateTab: (id: string) => void;
  setSubTab: (tabId: string, subTab: PaymentSubTab) => void;
  
  // Filters
  setFilters: (filters: Partial<PaymentFilters>) => void;
  resetFilters: () => void;
  setQueue: (queue: PaymentQueue) => void;
  setSearch: (search: string) => void;
  
  // Selection
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setSelectionMode: (mode: PaymentSelection['mode']) => void;
  
  // UI
  setViewMode: (mode: 'dashboard' | 'workspace') => void;
  toggleSidebar: () => void;
  toggleAutoRefresh: () => void;
  toggleCompactMode: () => void;
  
  // Watchlist
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

const DEFAULT_FILTERS: PaymentFilters = {
  queue: 'pending',
  search: '',
  bureaux: [],
  projects: [],
  riskLevels: [],
  hasFacture: undefined,
  requiresBF: undefined,
};

// ================================
// Store
// ================================
export const usePaymentValidationWorkspaceStore = create<PaymentValidationWorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      filters: DEFAULT_FILTERS,
      selection: { ids: new Set(), mode: 'multi' },
      viewMode: 'dashboard',
      sidebarOpen: true,
      autoRefresh: true,
      compactMode: false,
      watchlist: [],

      // Tab actions
      openTab: (tab: PaymentTab) => {
        const { tabs } = get();
        const existing = tabs.find((t) => t.id === tab.id);

        if (existing) {
          set({ activeTabId: tab.id, viewMode: 'workspace' });
        } else {
          set({
            tabs: [...tabs, { ...tab, closable: tab.closable ?? true }],
            activeTabId: tab.id,
            viewMode: 'workspace',
          });
        }
      },

      closeTab: (id: string) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex((t) => t.id === id);

        if (tabIndex === -1) return;

        const newTabs = tabs.filter((t) => t.id !== id);
        let newActiveId = activeTabId;

        if (activeTabId === id) {
          if (newTabs.length === 0) {
            newActiveId = null;
          } else if (tabIndex > 0) {
            newActiveId = newTabs[tabIndex - 1].id;
          } else {
            newActiveId = newTabs[0].id;
          }
        }

        set({ 
          tabs: newTabs, 
          activeTabId: newActiveId,
          viewMode: newTabs.length === 0 ? 'dashboard' : 'workspace',
        });
      },

      setActiveTab: (id: string) => {
        const { tabs } = get();
        const exists = tabs.some((t) => t.id === id);
        if (exists) {
          set({ activeTabId: id, viewMode: 'workspace' });
        }
      },

      updateTab: (id: string, updates: Partial<PaymentTab>) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
        }));
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null, viewMode: 'dashboard' });
      },

      closeOtherTabs: (id: string) => {
        const { tabs } = get();
        const targetTab = tabs.find((t) => t.id === id);
        if (targetTab) {
          set({ tabs: [targetTab], activeTabId: id });
        }
      },

      duplicateTab: (id: string) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === id);
        if (tab) {
          const newId = `${tab.id}-copy-${Date.now()}`;
          const newTab = { ...tab, id: newId, title: `${tab.title} (copie)` };
          set({
            tabs: [...tabs, newTab],
            activeTabId: newId,
          });
        }
      },

      setSubTab: (tabId: string, subTab: PaymentSubTab) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => 
            tab.id === tabId ? { ...tab, subTab } : tab
          ),
        }));
      },

      // Filter actions
      setFilters: (filters: Partial<PaymentFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
      },

      setQueue: (queue: PaymentQueue) => {
        set((state) => ({
          filters: { ...state.filters, queue },
        }));
      },

      setSearch: (search: string) => {
        set((state) => ({
          filters: { ...state.filters, search },
        }));
      },

      // Selection actions
      toggleSelection: (id: string) => {
        set((state) => {
          const newIds = new Set(state.selection.ids);
          if (newIds.has(id)) {
            newIds.delete(id);
          } else {
            newIds.add(id);
          }
          return { selection: { ...state.selection, ids: newIds } };
        });
      },

      selectAll: (ids: string[]) => {
        set((state) => ({
          selection: { ...state.selection, ids: new Set(ids) },
        }));
      },

      clearSelection: () => {
        set((state) => ({
          selection: { ...state.selection, ids: new Set() },
        }));
      },

      setSelectionMode: (mode: PaymentSelection['mode']) => {
        set((state) => ({
          selection: { ...state.selection, mode },
        }));
      },

      // UI actions
      setViewMode: (viewMode: 'dashboard' | 'workspace') => {
        set({ viewMode });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      toggleAutoRefresh: () => {
        set((state) => ({ autoRefresh: !state.autoRefresh }));
      },

      toggleCompactMode: () => {
        set((state) => ({ compactMode: !state.compactMode }));
      },

      // Watchlist actions
      addToWatchlist: (id: string) => {
        set((state) => {
          if (state.watchlist.includes(id)) return state;
          return { watchlist: [...state.watchlist, id].slice(0, 50) };
        });
      },

      removeFromWatchlist: (id: string) => {
        set((state) => ({
          watchlist: state.watchlist.filter((wid) => wid !== id),
        }));
      },

      isInWatchlist: (id: string) => {
        return get().watchlist.includes(id);
      },
    }),
    {
      name: 'bmo-payment-validation-workspace-v2',
      partialize: (state) => ({
        tabs: state.tabs.slice(0, 20),
        activeTabId: state.activeTabId,
        filters: state.filters,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
        autoRefresh: state.autoRefresh,
        compactMode: state.compactMode,
        watchlist: state.watchlist.slice(0, 50),
      }),
      // Fix for Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const state = JSON.parse(str);
          // Reconstruct Set from array
          if (state?.state?.selection?.ids) {
            state.state.selection.ids = new Set(state.state.selection.ids);
          }
          return state;
        },
        setItem: (name, value) => {
          // Convert Set to array for serialization
          const toStore = {
            ...value,
            state: {
              ...value.state,
              selection: value.state?.selection ? {
                ...value.state.selection,
                ids: Array.from(value.state.selection.ids || []),
              } : { ids: [], mode: 'multi' },
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

