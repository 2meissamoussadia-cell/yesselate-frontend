import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types métier Contrats BTP
// ================================
export type ContractTabType = 
  | 'dashboard'
  | 'inbox' 
  | 'contrat' 
  | 'comparateur' 
  | 'wizard' 
  | 'audit' 
  | 'workflow'
  | 'partenaire'
  | 'analytics';

export type ContractQueue = 
  | 'pending_bj'      // En attente validation BJ
  | 'pending_bmo'     // En attente signature BMO
  | 'signed'          // Signés
  | 'expired'         // Expirés
  | 'urgent'          // Urgents (< 7 jours)
  | 'high_risk'       // Risque élevé (score >= 70)
  | 'marche'          // Type: Marchés
  | 'avenant'         // Type: Avenants
  | 'sous_traitance'  // Type: Sous-traitance
  | 'all';            // Tous

export type ContractWorkflowStep = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PENDING_BJ'
  | 'PENDING_BMO'
  | 'SIGNED'
  | 'REJECTED'
  | 'ARCHIVED';

export interface ContractTab {
  id: string;
  type: ContractTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  closable?: boolean;
  pinned?: boolean;
  modified?: boolean;
  parentId?: string; // Pour les sous-onglets
}

export interface ContractFilter {
  search: string;
  types: string[];
  bureaux: string[];
  workflows: ContractWorkflowStep[];
  riskMin: number;
  riskMax: number;
  amountMin: number;
  amountMax: number;
  expiryDays: number | null;
  sortBy: 'risk' | 'amount' | 'expiry' | 'date';
  sortDir: 'asc' | 'desc';
}

export interface ContractSelection {
  ids: Set<string>;
  lastSelectedId: string | null;
}

export interface PinnedView {
  key: string;
  title: string;
  icon: string;
  queue: ContractQueue;
  filters?: Partial<ContractFilter>;
}

export interface ContractWorkspaceState {
  // Onglets
  tabs: ContractTab[];
  activeTabId: string | null;
  
  // Sous-onglets par onglet parent
  subTabsMap: Record<string, string>; // parentId -> activeSubTabId
  
  // Filtres globaux
  filters: ContractFilter;
  
  // Sélection multiple
  selection: ContractSelection;
  
  // Vues épinglées (watchlist)
  pinnedViews: PinnedView[];
  
  // Préférences UI
  autoRefresh: boolean;
  viewDensity: 'compact' | 'normal' | 'comfortable';
  showRiskIndicators: boolean;
  showAuditTrail: boolean;
  
  // Historique de navigation
  navigationHistory: string[];
  historyIndex: number;
  
  // Actions onglets
  openTab: (tab: ContractTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<ContractTab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  duplicateTab: (id: string) => void;
  pinTab: (id: string) => void;
  unpinTab: (id: string) => void;
  
  // Actions sous-onglets
  setSubTab: (parentId: string, subTabId: string) => void;
  getSubTab: (parentId: string) => string | null;
  
  // Actions filtres
  setFilter: <K extends keyof ContractFilter>(key: K, value: ContractFilter[K]) => void;
  resetFilters: () => void;
  
  // Actions sélection
  toggleSelection: (id: string, shiftKey?: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  
  // Actions vues épinglées
  pinView: (view: PinnedView) => void;
  unpinView: (key: string) => void;
  
  // Actions préférences
  setAutoRefresh: (value: boolean) => void;
  setViewDensity: (density: 'compact' | 'normal' | 'comfortable') => void;
  toggleRiskIndicators: () => void;
  toggleAuditTrail: () => void;
  
  // Actions navigation
  goBack: () => boolean;
  goForward: () => boolean;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
}

// ================================
// Valeurs par défaut
// ================================
const defaultFilters: ContractFilter = {
  search: '',
  types: [],
  bureaux: [],
  workflows: [],
  riskMin: 0,
  riskMax: 100,
  amountMin: 0,
  amountMax: Number.MAX_SAFE_INTEGER,
  expiryDays: null,
  sortBy: 'risk',
  sortDir: 'desc',
};

const defaultSelection: ContractSelection = {
  ids: new Set(),
  lastSelectedId: null,
};

// ================================
// Store
// ================================
export const useValidationContratsWorkspaceStore = create<ContractWorkspaceState>()(
  persist(
    (set, get) => ({
      // État initial
      tabs: [],
      activeTabId: null,
      subTabsMap: {},
      filters: defaultFilters,
      selection: defaultSelection,
      pinnedViews: [],
      autoRefresh: true,
      viewDensity: 'normal',
      showRiskIndicators: true,
      showAuditTrail: true,
      navigationHistory: [],
      historyIndex: -1,

      // Actions onglets
      openTab: (tab: ContractTab) => {
        const { tabs, activeTabId, navigationHistory, historyIndex } = get();
        const existing = tabs.find((t) => t.id === tab.id);

        if (existing) {
          // Onglet existe, on l'active
          const newHistory = [...navigationHistory.slice(0, historyIndex + 1), tab.id];
          set({ 
            activeTabId: tab.id,
            navigationHistory: newHistory,
            historyIndex: newHistory.length - 1,
          });
        } else {
          // Nouvel onglet
          const newHistory = [...navigationHistory.slice(0, historyIndex + 1), tab.id];
          set({
            tabs: [...tabs, { ...tab, closable: tab.closable ?? true }],
            activeTabId: tab.id,
            navigationHistory: newHistory,
            historyIndex: newHistory.length - 1,
          });
        }
      },

      closeTab: (id: string) => {
        const { tabs, activeTabId, pinnedViews } = get();
        const tab = tabs.find((t) => t.id === id);
        
        // Ne pas fermer les onglets épinglés
        if (tab?.pinned) return;
        
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

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (id: string) => {
        const { tabs, navigationHistory, historyIndex } = get();
        const exists = tabs.some((t) => t.id === id);
        if (exists) {
          const newHistory = [...navigationHistory.slice(0, historyIndex + 1), id];
          set({ 
            activeTabId: id,
            navigationHistory: newHistory,
            historyIndex: newHistory.length - 1,
          });
        }
      },

      updateTab: (id: string, updates: Partial<ContractTab>) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
        }));
      },

      closeAllTabs: () => {
        const { tabs } = get();
        // Garder les onglets épinglés
        const pinnedTabs = tabs.filter((t) => t.pinned);
        set({ 
          tabs: pinnedTabs, 
          activeTabId: pinnedTabs.length > 0 ? pinnedTabs[0].id : null 
        });
      },

      closeOtherTabs: (id: string) => {
        const { tabs } = get();
        const targetTab = tabs.find((t) => t.id === id);
        const pinnedTabs = tabs.filter((t) => t.pinned && t.id !== id);
        if (targetTab) {
          set({ tabs: [targetTab, ...pinnedTabs], activeTabId: id });
        }
      },

      duplicateTab: (id: string) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === id);
        if (tab) {
          const newId = `${tab.id}-copy-${Date.now()}`;
          const newTab = { ...tab, id: newId, title: `${tab.title} (copie)`, pinned: false };
          set({
            tabs: [...tabs, newTab],
            activeTabId: newId,
          });
        }
      },

      pinTab: (id: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => 
            tab.id === id ? { ...tab, pinned: true, closable: false } : tab
          ),
        }));
      },

      unpinTab: (id: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => 
            tab.id === id ? { ...tab, pinned: false, closable: true } : tab
          ),
        }));
      },

      // Actions sous-onglets
      setSubTab: (parentId: string, subTabId: string) => {
        set((state) => ({
          subTabsMap: { ...state.subTabsMap, [parentId]: subTabId },
        }));
      },

      getSubTab: (parentId: string) => {
        return get().subTabsMap[parentId] ?? null;
      },

      // Actions filtres
      setFilter: <K extends keyof ContractFilter>(key: K, value: ContractFilter[K]) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      // Actions sélection
      toggleSelection: (id: string, shiftKey?: boolean) => {
        const { selection } = get();
        const newIds = new Set(selection.ids);
        
        if (newIds.has(id)) {
          newIds.delete(id);
        } else {
          newIds.add(id);
        }
        
        set({
          selection: {
            ids: newIds,
            lastSelectedId: id,
          },
        });
      },

      selectAll: (ids: string[]) => {
        set({
          selection: {
            ids: new Set(ids),
            lastSelectedId: ids.length > 0 ? ids[ids.length - 1] : null,
          },
        });
      },

      clearSelection: () => {
        set({ selection: defaultSelection });
      },

      isSelected: (id: string) => {
        return get().selection.ids.has(id);
      },

      // Actions vues épinglées
      pinView: (view: PinnedView) => {
        set((state) => {
          const exists = state.pinnedViews.some((v) => v.key === view.key);
          if (exists) return state;
          return {
            pinnedViews: [view, ...state.pinnedViews].slice(0, 20),
          };
        });
      },

      unpinView: (key: string) => {
        set((state) => ({
          pinnedViews: state.pinnedViews.filter((v) => v.key !== key),
        }));
      },

      // Actions préférences
      setAutoRefresh: (value: boolean) => {
        set({ autoRefresh: value });
      },

      setViewDensity: (density: 'compact' | 'normal' | 'comfortable') => {
        set({ viewDensity: density });
      },

      toggleRiskIndicators: () => {
        set((state) => ({ showRiskIndicators: !state.showRiskIndicators }));
      },

      toggleAuditTrail: () => {
        set((state) => ({ showAuditTrail: !state.showAuditTrail }));
      },

      // Actions navigation
      goBack: () => {
        const { navigationHistory, historyIndex, tabs } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const targetId = navigationHistory[newIndex];
          const exists = tabs.some((t) => t.id === targetId);
          if (exists) {
            set({ activeTabId: targetId, historyIndex: newIndex });
            return true;
          }
        }
        return false;
      },

      goForward: () => {
        const { navigationHistory, historyIndex, tabs } = get();
        if (historyIndex < navigationHistory.length - 1) {
          const newIndex = historyIndex + 1;
          const targetId = navigationHistory[newIndex];
          const exists = tabs.some((t) => t.id === targetId);
          if (exists) {
            set({ activeTabId: targetId, historyIndex: newIndex });
            return true;
          }
        }
        return false;
      },

      canGoBack: () => {
        return get().historyIndex > 0;
      },

      canGoForward: () => {
        const { navigationHistory, historyIndex } = get();
        return historyIndex < navigationHistory.length - 1;
      },
    }),
    {
      name: 'bmo-validation-contrats-workspace-v2',
      partialize: (state) => ({
        tabs: state.tabs.slice(0, 30),
        activeTabId: state.activeTabId,
        subTabsMap: state.subTabsMap,
        pinnedViews: state.pinnedViews.slice(0, 20),
        autoRefresh: state.autoRefresh,
        viewDensity: state.viewDensity,
        showRiskIndicators: state.showRiskIndicators,
        showAuditTrail: state.showAuditTrail,
        // Ne pas persister: filters, selection, navigationHistory
      }),
      // Sérialisation custom pour gérer les Sets
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name: string, value: unknown) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

