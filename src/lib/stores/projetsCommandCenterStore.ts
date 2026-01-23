/**
 * Store Zustand pour le Projets Command Center
 * Architecture identique au Blocked Command Center
 * Pilotage complet des projets pour le BMO
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (onglets niveau 1)
export type ProjetsMainCategory =
  | 'overview'    // Vue d'ensemble
  | 'active'      // Projets actifs
  | 'planning'    // En planification
  | 'delayed'     // En retard
  | 'completed'   // Terminés
  | 'by-bureau'   // Par bureau
  | 'by-team'     // Par équipe
  | 'priority'    // Prioritaires
  | 'analytics'   // Analytics
  | 'timeline'    // Timeline
  | 'kanban'      // Vue Kanban
  | 'budget';     // Vue budget

// Sous-catégories par thématique (onglets niveau 2)
export type ProjetsSubCategoryMap = {
  overview: 'summary' | 'kpis' | 'trends' | 'alerts';
  active: 'all' | 'execution' | 'review' | 'testing' | 'at-risk';
  planning: 'all' | 'conception' | 'estimation' | 'validation' | 'scheduled';
  delayed: 'all' | 'critical' | 'high' | 'medium' | 'recovery';
  completed: 'all' | 'this-month' | 'this-quarter' | 'this-year' | 'success';
  'by-bureau': 'all' | 'bf' | 'bm' | 'bj' | 'bct' | 'comparison';
  'by-team': 'all' | 'dev' | 'infra' | 'business' | 'support';
  priority: 'all' | 'strategic' | 'urgent' | 'client';
  analytics: 'overview' | 'performance' | 'budget' | 'resources' | 'risks';
  timeline: 'recent' | 'week' | 'month' | 'milestones';
  kanban: 'all' | 'by-status' | 'by-priority';
  budget: 'overview' | 'consumption' | 'forecast' | 'alerts';
};

export type ProjetsSubCategory = ProjetsSubCategoryMap[ProjetsMainCategory];

// Types de modales
export type ProjetsModalType =
  | 'project-detail'
  | 'new-project'
  | 'edit-project'
  | 'milestone'
  | 'team-assign'
  | 'budget-adjust'
  | 'risk-assess'
  | 'escalation'
  | 'stats'
  | 'export'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'confirm'
  | 'kpi-drilldown'
  | 'gantt-view'
  | 'resource-planning'
  | 'resolution-wizard'
  | 'decision-center';

// État de navigation
export interface ProjetsNavigationState {
  mainCategory: ProjetsMainCategory;
  subCategory: ProjetsSubCategory | null;
}

// État d'une modale
export interface ProjetsModalState {
  type: ProjetsModalType | null;
  isOpen: boolean;
  data: Record<string, unknown>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Configuration KPI Bar
export interface ProjetsKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number;
  autoRefresh: boolean;
}

// Filtres actifs
export interface ProjetsActiveFilters {
  status: ('active' | 'planning' | 'delayed' | 'completed' | 'on-hold' | 'cancelled')[];
  bureaux: string[];
  teams: string[];
  priority: ('high' | 'medium' | 'low')[];
  risk: ('high' | 'medium' | 'low')[];
  search: string;
  budgetRange: { min?: number; max?: number };
  progressRange: { min?: number; max?: number };
  dateRange?: { start: string; end: string };
  assignedTo?: string[];
  tags?: string[];
  type?: string[];
}

// Statistiques temps réel
export interface ProjetsStats {
  total: number;
  active: number;
  planning: number;
  delayed: number;
  completed: number;
  onHold: number;
  cancelled: number;
  avgProgress: number;
  avgBudgetUsage: number;
  totalBudget: number;
  budgetConsumed: number;
  overdueCount: number;
  atRiskCount: number;
  completedThisMonth: number;
  teamSize: number;
  onTimeDelivery: number;
  byBureau: { bureau: string; count: number; active: number; delayed: number }[];
  byType: { type: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  ts: string;
}

// Entrée d'historique projet
export interface ProjetsHistoryEntry {
  id: string;
  at: string;
  projectId: string;
  projectTitle: string;
  action: 'created' | 'updated' | 'status_change' | 'milestone' | 'budget_update' | 'team_change' | 'escalation' | 'completed';
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface ProjetsCommandCenterState {
  // Navigation
  navigation: ProjetsNavigationState;
  navigationHistory: ProjetsNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: ProjetsModalState;

  // Filtres
  filters: ProjetsActiveFilters;

  // KPIs
  kpiConfig: ProjetsKPIConfig;

  // Stats temps réel
  stats: ProjetsStats | null;
  statsLoading: boolean;

  // Sélections
  selectedIds: Set<string>;

  // Recherche globale
  globalSearch: string;

  // Live stats
  liveStats: {
    lastUpdate: string | null;
    isRefreshing: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'syncing';
  };

  // Historique des actions
  historyRegister: ProjetsHistoryEntry[];

  // Préférences
  autoRefresh: boolean;
  refreshInterval: number;
  viewMode: 'grid' | 'list' | 'kanban' | 'gantt';

  // Actions Navigation
  navigate: (main: ProjetsMainCategory, sub?: ProjetsSubCategory | null) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;

  // Actions Modal
  openModal: (type: ProjetsModalType, data?: Record<string, unknown>, options?: Partial<ProjetsModalState>) => void;
  closeModal: () => void;

  // Actions Filtres
  setFilter: <K extends keyof ProjetsActiveFilters>(key: K, value: ProjetsActiveFilters[K]) => void;
  resetFilters: () => void;

  // Actions KPI
  setKPIConfig: (config: Partial<ProjetsKPIConfig>) => void;
  toggleKPIBar: () => void;

  // Actions Stats
  setStats: (stats: ProjetsStats | null) => void;
  setStatsLoading: (loading: boolean) => void;

  // Actions Sélection
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: (ids?: string[]) => void;
  clearSelection: () => void;

  // Actions Recherche
  setGlobalSearch: (search: string) => void;

  // Actions Stats temps réel
  setLiveStats: (stats: Partial<ProjetsCommandCenterState['liveStats']>) => void;
  startRefresh: () => void;
  endRefresh: () => void;

  // Actions Historique
  addHistoryEntry: (entry: Omit<ProjetsHistoryEntry, 'id'>) => void;
  clearHistory: () => void;

  // Actions Préférences
  setAutoRefresh: (value: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setViewMode: (mode: 'grid' | 'list' | 'kanban' | 'gantt') => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: ProjetsNavigationState = {
  mainCategory: 'overview',
  subCategory: 'summary',
};

const defaultFilters: ProjetsActiveFilters = {
  status: [],
  bureaux: [],
  teams: [],
  priority: [],
  risk: [],
  search: '',
  budgetRange: {},
  progressRange: {},
  dateRange: undefined,
  assignedTo: [],
  tags: [],
  type: [],
};

const defaultKPIConfig: ProjetsKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30,
  autoRefresh: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const useProjetsCommandCenterStore = create<ProjetsCommandCenterState>()(
  persist(
    (set, get) => ({
      // Initial State
      navigation: defaultNavigation,
      navigationHistory: [],
      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,
      notificationsPanelOpen: false,
      modal: { type: null, isOpen: false, data: {} },
      filters: defaultFilters,
      kpiConfig: defaultKPIConfig,
      stats: null,
      statsLoading: false,
      selectedIds: new Set(),
      globalSearch: '',
      liveStats: {
        lastUpdate: null,
        isRefreshing: false,
        connectionStatus: 'connected',
      },
      historyRegister: [],
      autoRefresh: true,
      refreshInterval: 30000,
      viewMode: 'grid',

      // Navigation Actions
      navigate: (main, sub = null) => {
        const current = get().navigation;
        set({
          navigation: { mainCategory: main, subCategory: sub },
          navigationHistory: [...get().navigationHistory, current].slice(-20),
        });
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        set({
          navigation: previous,
          navigationHistory: history.slice(0, -1),
        });
      },

      resetNavigation: () => {
        set({
          navigation: defaultNavigation,
          navigationHistory: [],
        });
      },

      // UI Actions
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFullscreen: () => set({ fullscreen: !get().fullscreen }),
      toggleCommandPalette: () => set({ commandPaletteOpen: !get().commandPaletteOpen }),
      toggleNotificationsPanel: () => set({ notificationsPanelOpen: !get().notificationsPanelOpen }),

      // Modal Actions
      openModal: (type, data = {}, options = {}) => {
        set({
          modal: {
            type,
            isOpen: true,
            data,
            ...options,
          },
        });
      },

      closeModal: () => {
        set({
          modal: { type: null, isOpen: false, data: {} },
        });
      },

      // Filter Actions
      setFilter: (key, value) => {
        set({
          filters: { ...get().filters, [key]: value },
        });
      },

      resetFilters: () => set({ filters: defaultFilters }),

      // KPI Actions
      setKPIConfig: (config) => {
        set({
          kpiConfig: { ...get().kpiConfig, ...config },
        });
      },

      toggleKPIBar: () => {
        set({
          kpiConfig: { ...get().kpiConfig, collapsed: !get().kpiConfig.collapsed },
        });
      },

      // Stats Actions
      setStats: (stats) => set({ stats }),
      setStatsLoading: (loading) => set({ statsLoading: loading }),

      // Selection Actions
      toggleSelected: (id) => {
        set((state) => {
          const next = new Set(state.selectedIds);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return { selectedIds: next };
        });
      },

      selectAll: (ids) => {
        set((state) => {
          const next = new Set(state.selectedIds);
          ids.forEach((id) => next.add(id));
          return { selectedIds: next };
        });
      },

      deselectAll: (ids) => {
        set((state) => {
          const next = new Set(state.selectedIds);
          if (ids) {
            ids.forEach((id) => next.delete(id));
          } else {
            next.clear();
          }
          return { selectedIds: next };
        });
      },

      clearSelection: () => set({ selectedIds: new Set() }),

      // Recherche
      setGlobalSearch: (search) => set({ globalSearch: search }),

      // Stats temps réel
      setLiveStats: (stats) => {
        set({
          liveStats: { ...get().liveStats, ...stats },
        });
      },

      startRefresh: () => {
        set({
          liveStats: { ...get().liveStats, isRefreshing: true, connectionStatus: 'syncing' },
        });
      },

      endRefresh: () => {
        set({
          liveStats: {
            ...get().liveStats,
            isRefreshing: false,
            connectionStatus: 'connected',
            lastUpdate: new Date().toISOString(),
          },
        });
      },

      // History Actions
      addHistoryEntry: (entry) => {
        const id = `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          historyRegister: [{ ...entry, id }, ...state.historyRegister].slice(0, 500),
        }));
      },

      clearHistory: () => {
        set({ historyRegister: [] });
      },

      // Preference Actions
      setAutoRefresh: (value) => {
        set({ autoRefresh: value });
      },

      setRefreshInterval: (interval) => {
        set({ refreshInterval: interval });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },
    }),
    {
      name: 'bmo-projets-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        kpiConfig: state.kpiConfig,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
        viewMode: state.viewMode,
      }),
    }
  )
);

export type { ProjetsCommandCenterState };

