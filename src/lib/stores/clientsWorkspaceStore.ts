/**
 * ====================================================================
 * STORE: Clients Workspace - Pattern Pilotage
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ClientsTabType = 
  | 'inbox'          // Liste des clients
  | 'detail'         // Détail d'un client
  | 'prospects'      // Prospects
  | 'litiges'        // Clients en litige
  | 'historique'     // Historique relations
  | 'analytics';     // Dashboard analytique

export interface ClientsTab {
  id: string;
  type: ClientsTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface ClientsFilter {
  status?: 'active' | 'litige' | 'termine' | 'prospect';
  type?: 'particulier' | 'entreprise' | 'institution';
  segment?: 'premium' | 'standard' | 'occasionnel';
  search?: string;
}

interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Sous-catégories par catégorie principale
export const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'activity', label: 'Activité récente', badge: 12 },
  ],
  prospects: [
    { id: 'all', label: 'Tous', badge: 12 },
    { id: 'hot', label: 'Chauds', badge: 3, badgeType: 'critical' },
    { id: 'warm', label: 'Tièdes', badge: 5, badgeType: 'warning' },
    { id: 'cold', label: 'Froids', badge: 4 },
  ],
  premium: [
    { id: 'all', label: 'Tous', badge: 8 },
    { id: 'strategic', label: 'Stratégiques', badge: 3 },
    { id: 'growth', label: 'Croissance', badge: 5 },
  ],
  litiges: [
    { id: 'all', label: 'Tous', badge: 3 },
    { id: 'open', label: 'Ouverts', badge: 2, badgeType: 'critical' },
    { id: 'in_progress', label: 'En cours', badge: 1, badgeType: 'warning' },
    { id: 'resolved', label: 'Résolus' },
  ],
  historique: [
    { id: 'all', label: 'Tout' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
  ],
  contrats: [
    { id: 'all', label: 'Tous', badge: 24 },
    { id: 'active', label: 'Actifs', badge: 18 },
    { id: 'expiring', label: 'À renouveler', badge: 4, badgeType: 'warning' },
    { id: 'expired', label: 'Expirés', badge: 2 },
  ],
  performance: [
    { id: 'all', label: 'Vue générale' },
    { id: 'satisfaction', label: 'Satisfaction' },
    { id: 'revenue', label: 'Chiffre d\'affaires' },
    { id: 'retention', label: 'Rétention' },
  ],
  entreprises: [
    { id: 'all', label: 'Toutes', badge: 156 },
    { id: 'tpe', label: 'TPE', badge: 45 },
    { id: 'pme', label: 'PME', badge: 68 },
    { id: 'eti', label: 'ETI', badge: 32 },
    { id: 'ge', label: 'GE', badge: 11 },
  ],
  interactions: [
    { id: 'all', label: 'Toutes', badge: 28 },
    { id: 'pending', label: 'En attente', badge: 5, badgeType: 'warning' },
    { id: 'today', label: 'Aujourd\'hui', badge: 8 },
    { id: 'week', label: 'Cette semaine', badge: 15 },
  ],
};

interface ClientsWorkspaceState {
  tabs: ClientsTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: ClientsFilter;
  watchlist: string[];
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;
  exportModalOpen: boolean;
  directionPanelOpen: boolean;
  viewMode: 'dashboard' | 'workspace';

  // Navigation State (Command Center)
  activeCategory: string;
  activeSubCategory: string;
  sidebarCollapsed: boolean;
  navigationHistory: string[];
  notificationsPanelOpen: boolean;
  filtersPanelOpen: boolean;
  kpiBarCollapsed: boolean;
  isFullScreen: boolean;

  openTab: (tab: Omit<ClientsTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<ClientsFilter>) => void;
  clearFilter: () => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setDirectionPanelOpen: (open: boolean) => void;
  setViewMode: (mode: 'dashboard' | 'workspace') => void;
  setActiveCategory: (category: string) => void;
  setActiveSubCategory: (subCategory: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  goBack: () => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  setFiltersPanelOpen: (open: boolean) => void;
  setKpiBarCollapsed: (collapsed: boolean) => void;
  toggleFullScreen: () => void;
  reset: () => void;
}

const defaultTabs: ClientsTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Tous les clients', icon: '👥', data: { queue: 'all' }, closable: false },
];

export const useClientsWorkspaceStore = create<ClientsWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'inbox:all',
      selectedIds: new Set(),
      currentFilter: {},
      watchlist: [],
      commandPaletteOpen: false,
      statsModalOpen: false,
      exportModalOpen: false,
      directionPanelOpen: false,
      viewMode: 'dashboard',

      // Navigation State (Command Center)
      activeCategory: 'overview',
      activeSubCategory: 'all',
      sidebarCollapsed: false,
      navigationHistory: [],
      notificationsPanelOpen: false,
      filtersPanelOpen: false,
      kpiBarCollapsed: false,
      isFullScreen: false,

      openTab: (tab) => {
        const id = tab.id || `${tab.type}:${Date.now()}`;
        if (get().tabs.find(t => t.id === id)) { set({ activeTabId: id }); return; }
        set((state) => ({ tabs: [...state.tabs, { ...tab, id, closable: tab.closable ?? true }], activeTabId: id }));
      },

      closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        const tab = tabs.find(t => t.id === tabId);
        if (!tab || tab.closable === false) return;
        const newTabs = tabs.filter(t => t.id !== tabId);
        let newActiveId = activeTabId;
        if (activeTabId === tabId) {
          const idx = tabs.findIndex(t => t.id === tabId);
          newActiveId = newTabs[Math.min(idx, newTabs.length - 1)]?.id || null;
        }
        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (tabId) => { if (get().tabs.find(t => t.id === tabId)) set({ activeTabId: tabId }); },
      toggleSelected: (id) => set((state) => { const s = new Set(state.selectedIds); s.has(id) ? s.delete(id) : s.add(id); return { selectedIds: s }; }),
      selectAll: (ids) => set({ selectedIds: new Set(ids) }),
      clearSelection: () => set({ selectedIds: new Set() }),
      setFilter: (filter) => set((state) => ({ currentFilter: { ...state.currentFilter, ...filter } })),
      clearFilter: () => set({ currentFilter: {} }),
      addToWatchlist: (id) => set((state) => ({ watchlist: state.watchlist.includes(id) ? state.watchlist : [...state.watchlist, id] })),
      removeFromWatchlist: (id) => set((state) => ({ watchlist: state.watchlist.filter(wid => wid !== id) })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),
      setExportModalOpen: (open) => set({ exportModalOpen: open }),
      setDirectionPanelOpen: (open) => set({ directionPanelOpen: open }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveCategory: (category: string) => {
        const { activeCategory } = get();
        set((state) => ({
          navigationHistory: [...state.navigationHistory, activeCategory],
          activeCategory: category,
          activeSubCategory: 'all',
        }));
      },
      setActiveSubCategory: (subCategory: string) => set({ activeSubCategory: subCategory }),
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      goBack: () => {
        const { navigationHistory } = get();
        if (navigationHistory.length > 0) {
          const previousCategory = navigationHistory[navigationHistory.length - 1];
          set({
            navigationHistory: navigationHistory.slice(0, -1),
            activeCategory: previousCategory,
            activeSubCategory: 'all',
          });
        }
      },
      setNotificationsPanelOpen: (open: boolean) => set({ notificationsPanelOpen: open }),
      setFiltersPanelOpen: (open: boolean) => set({ filtersPanelOpen: open }),
      setKpiBarCollapsed: (collapsed: boolean) => set({ kpiBarCollapsed: collapsed }),
      toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
      reset: () => set({ tabs: defaultTabs, activeTabId: 'inbox:all', selectedIds: new Set(), currentFilter: {}, commandPaletteOpen: false }),
    }),
    { name: 'clients:workspace', partialize: (state) => ({ watchlist: state.watchlist, viewMode: state.viewMode }) }
  )
);

