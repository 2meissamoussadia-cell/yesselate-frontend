/**
 * ====================================================================
 * STORE: Tickets Clients Workspace - Pattern Pilotage v2.0
 * Architecture Command Center (similaire à Analytics/Gouvernance/Blocked)
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TicketsActiveFilters } from '@/components/features/bmo/workspace/tickets/command-center/TicketsFiltersPanel';

export type TicketsTabType = 
  | 'inbox'          // Liste des tickets
  | 'detail'         // Détail d'un ticket
  | 'urgent'         // Tickets urgents
  | 'assignes'       // Mes tickets assignés
  | 'timeline'       // Timeline
  | 'audit'          // Audit trail
  | 'matrix'         // Matrice urgence/impact
  | 'analytics';     // Dashboard analytique

export interface TicketsTab {
  id: string;
  type: TicketsTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface TicketsFilter {
  status?: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  category?: 'technique' | 'commercial' | 'facturation' | 'livraison' | 'qualite' | 'autre';
  assignee?: string;
  client?: string;
  search?: string;
}

// Note: TicketsActiveFilters est défini dans TicketsFiltersPanel.tsx
// On le réutilise ici pour éviter les doublons

// Live statistics
export interface TicketsStats {
  total: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  slaBreached: number;
  satisfactionScore: number;
  resolvedToday: number;
  createdToday: number;
  byCategory: { category: string; count: number }[];
  byAgent: { agent: string; count: number; resolved: number }[];
  ts: string;
}

// Navigation state for command center
export interface TicketsNavigation {
  mainCategory: string;
  subCategory: string;
  filter: string | null;
}

// KPI config state
export interface TicketsKPIConfig {
  visible: boolean;
  collapsed: boolean;
}

// Modal types
export type TicketsModalType = 
  | 'stats'
  | 'decision-center'
  | 'export'
  | 'shortcuts'
  | 'settings'
  | 'ticket-detail'
  | 'kpi-drilldown'
  | 'templates'
  | 'confirm'
  | null;

// Decision register entry (for audit trail)
export interface TicketsDecisionEntry {
  id: string;
  at: string;
  action: 'escalated' | 'resolved' | 'assigned' | 'closed' | 'reopened';
  ticketId: string;
  ticketReference: string;
  userId: string;
  userName: string;
  userRole: string;
  notes: string;
  hash?: string;
}

interface TicketsWorkspaceState {
  // Existing tab state
  tabs: TicketsTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: TicketsFilter;
  watchlist: string[];
  
  // UI state
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;
  directionPanelOpen: boolean;
  notificationsPanelOpen: boolean;
  filtersPanelOpen: boolean;
  viewMode: 'dashboard' | 'workspace';
  fullscreen: boolean;
  
  // Command Center navigation
  navigation: TicketsNavigation;
  navigationHistory: string[];
  sidebarCollapsed: boolean;
  kpiConfig: TicketsKPIConfig;
  
  // Modal state
  modal: {
    isOpen: boolean;
    type: TicketsModalType;
    data: Record<string, unknown>;
  };
  
  // Decision register (audit trail)
  decisionRegister: TicketsDecisionEntry[];
  
  // Active filters for advanced panel
  filters: TicketsActiveFilters;
  
  // Live statistics
  liveStats: TicketsStats | null;
  isRefreshing: boolean;

  // Tab actions
  openTab: (tab: Omit<TicketsTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  
  // Selection actions
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Filter actions
  setFilter: (filter: Partial<TicketsFilter>) => void;
  clearFilter: () => void;
  
  // Watchlist actions
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  
  // UI actions
  setCommandPaletteOpen: (open: boolean) => void;
  openCommandPalette: () => void;
  setStatsModalOpen: (open: boolean) => void;
  setDirectionPanelOpen: (open: boolean) => void;
  toggleNotificationsPanel: () => void;
  toggleFiltersPanel: () => void;
  setViewMode: (mode: 'dashboard' | 'workspace') => void;
  toggleFullscreen: () => void;
  
  // Command Center navigation actions
  navigate: (mainCategory: string, subCategory?: string, filter?: string | null) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setKPIConfig: (config: Partial<TicketsKPIConfig>) => void;
  
  // Modal actions
  openModal: (type: TicketsModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  
  // Decision register actions
  addDecision: (entry: Omit<TicketsDecisionEntry, 'id'>) => void;
  clearDecisions: () => void;
  
  // Advanced filters actions
  setFilters: (filters: Partial<TicketsActiveFilters>) => void;
  clearFilters: () => void;
  
  // Stats actions
  setStats: (stats: TicketsStats | null) => void;
  startRefresh: () => void;
  endRefresh: () => void;
  
  reset: () => void;
}

const defaultTabs: TicketsTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Tous les tickets', icon: '🎫', data: { queue: 'all' }, closable: false },
];

const defaultNavigation: TicketsNavigation = {
  mainCategory: 'overview',
  subCategory: 'all',
  filter: null,
};

export const useTicketsWorkspaceStore = create<TicketsWorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: defaultTabs,
      activeTabId: 'inbox:all',
      selectedIds: new Set(),
      currentFilter: {},
      watchlist: [],
      commandPaletteOpen: false,
      statsModalOpen: false,
      directionPanelOpen: false,
      notificationsPanelOpen: false,
      filtersPanelOpen: false,
      viewMode: 'dashboard',
      fullscreen: false,
      navigation: defaultNavigation,
      navigationHistory: [],
      sidebarCollapsed: false,
      kpiConfig: { visible: true, collapsed: false },
      modal: { isOpen: false, type: null, data: {} },
      decisionRegister: [],
      filters: {
        priority: [],
        status: [],
        category: [],
        agents: [],
        clients: [],
        search: '',
        responseTimeRange: {},
        dateRange: undefined,
        tags: [],
        sla: [],
        assigneeId: null,
        clientId: null,
        slaBreached: null,
        unassigned: null,
        vipOnly: false,
        dateFrom: '',
        dateTo: '',
      } as TicketsActiveFilters,
      liveStats: null,
      isRefreshing: false,

      // Tab actions
      openTab: (tab) => {
        const id = tab.id || `${tab.type}:${Date.now()}`;
        if (get().tabs.find(t => t.id === id)) { 
          set({ activeTabId: id }); 
          return; 
        }
        set((state) => ({ 
          tabs: [...state.tabs, { ...tab, id, closable: tab.closable ?? true }], 
          activeTabId: id 
        }));
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

      setActiveTab: (tabId) => { 
        if (get().tabs.find(t => t.id === tabId)) set({ activeTabId: tabId }); 
      },

      // Selection actions
      toggleSelected: (id) => set((state) => { 
        const s = new Set(state.selectedIds); 
        s.has(id) ? s.delete(id) : s.add(id); 
        return { selectedIds: s }; 
      }),
      selectAll: (ids) => set({ selectedIds: new Set(ids) }),
      clearSelection: () => set({ selectedIds: new Set() }),

      // Filter actions
      setFilter: (filter) => set((state) => ({ 
        currentFilter: { ...state.currentFilter, ...filter } 
      })),
      clearFilter: () => set({ currentFilter: {} }),

      // Watchlist actions
      addToWatchlist: (id) => set((state) => ({ 
        watchlist: state.watchlist.includes(id) ? state.watchlist : [...state.watchlist, id] 
      })),
      removeFromWatchlist: (id) => set((state) => ({ 
        watchlist: state.watchlist.filter(wid => wid !== id) 
      })),

      // UI actions
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),
      setDirectionPanelOpen: (open) => set({ directionPanelOpen: open }),
      toggleNotificationsPanel: () => set((state) => ({ 
        notificationsPanelOpen: !state.notificationsPanelOpen 
      })),
      toggleFiltersPanel: () => set((state) => ({ 
        filtersPanelOpen: !state.filtersPanelOpen 
      })),
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),

      // Command Center navigation actions
      navigate: (mainCategory, subCategory = 'all', filter = null) => {
        const { navigation } = get();
        // Add current state to history if changing main category
        if (mainCategory !== navigation.mainCategory) {
          set((state) => ({
            navigationHistory: [...state.navigationHistory, navigation.mainCategory],
            navigation: { mainCategory, subCategory, filter },
          }));
        } else {
          set({
            navigation: { mainCategory, subCategory, filter },
          });
        }
      },

      goBack: () => {
        const { navigationHistory } = get();
        if (navigationHistory.length > 0) {
          const previousCategory = navigationHistory[navigationHistory.length - 1];
          set({
            navigationHistory: navigationHistory.slice(0, -1),
            navigation: { mainCategory: previousCategory, subCategory: 'all', filter: null },
          });
        }
      },

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setKPIConfig: (config) => set((state) => ({ 
        kpiConfig: { ...state.kpiConfig, ...config } 
      })),

      // Modal actions
      openModal: (type, data = {}) => set({ 
        modal: { isOpen: true, type, data } 
      }),
      closeModal: () => set({ 
        modal: { isOpen: false, type: null, data: {} } 
      }),

      // Decision register actions
      addDecision: (entry) => set((state) => ({
        decisionRegister: [
          { ...entry, id: `DEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
          ...state.decisionRegister,
        ].slice(0, 100), // Keep last 100 entries
      })),
      clearDecisions: () => set({ decisionRegister: [] }),
      
      // Advanced filters actions
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      clearFilters: () => set({
        filters: {
          priority: [],
          status: [],
          category: [],
          agents: [],
          clients: [],
          search: '',
          responseTimeRange: {},
          dateRange: undefined,
          tags: [],
          sla: [],
          assigneeId: null,
          clientId: null,
          slaBreached: null,
          unassigned: null,
          vipOnly: false,
          dateFrom: '',
          dateTo: '',
        } as TicketsActiveFilters,
      }),
      
      // Stats actions
      setStats: (stats) => set({ liveStats: stats }),
      startRefresh: () => set({ isRefreshing: true }),
      endRefresh: () => set({ isRefreshing: false }),

      reset: () => set({ 
        tabs: defaultTabs, 
        activeTabId: 'inbox:all', 
        selectedIds: new Set(), 
        currentFilter: {}, 
        commandPaletteOpen: false,
        navigation: defaultNavigation,
        navigationHistory: [],
        modal: { isOpen: false, type: null, data: {} },
      }),
    }),
    { 
      name: 'tickets:workspace', 
      partialize: (state) => ({ 
        watchlist: state.watchlist, 
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiConfig: state.kpiConfig,
      }) 
    }
  )
);
