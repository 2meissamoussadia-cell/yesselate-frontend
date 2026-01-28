/**
 * Store Zustand pour le Blocked Command Center
 * Architecture identique au Dashboard Command Center
 * Pilotage et résolution des blocages pour le BMO
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (onglets niveau 1)
export type BlockedMainCategory =
  | 'overview'    // Vue d'ensemble
  | 'queue'       // Files d'attente (tous les blocages)
  | 'critical'    // Blocages critiques
  | 'matrix'      // Matrice urgence (impact x délai)
  | 'bureaux'     // Par bureau
  | 'timeline'    // Timeline chronologique
  | 'decisions'   // Décisions (résolutions, escalades)
  | 'audit';      // Audit trail

// Sous-catégories par thématique (onglets niveau 2)
export type BlockedSubCategoryMap = {
  overview: 'summary' | 'kpis' | 'trends' | 'alerts';
  queue: 'all' | 'critical' | 'high' | 'medium' | 'low';
  critical: 'urgent' | 'sla' | 'escalated';
  matrix: 'impact' | 'delay' | 'amount' | 'combined' | 'kanban';
  bureaux: 'all' | 'most' | 'comparison';
  timeline: 'recent' | 'week' | 'month' | 'history';
  decisions: 'pending' | 'resolved' | 'escalated' | 'substituted';
  audit: 'trail' | 'chain' | 'reports' | 'export';
};

export type BlockedSubCategory = BlockedSubCategoryMap[BlockedMainCategory];

// Types de modales
export type BlockedModalType =
  | 'dossier-detail'
  | 'dossier-detail-enriched'
  | 'resolution'
  | 'resolution-advanced'
  | 'escalation'
  | 'substitution'
  | 'decision-center'
  | 'stats'
  | 'export'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'confirm'
  | 'kpi-drilldown'
  | 'alert-detail'
  | 'resolution-wizard'; // Wizard de résolution guidé

// État de navigation
export interface BlockedNavigationState {
  mainCategory: BlockedMainCategory;
  subCategory: BlockedSubCategory | null;
}

// État d'une modale
export interface BlockedModalState {
  type: BlockedModalType | null;
  isOpen: boolean;
  data: Record<string, unknown>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Configuration KPI Bar
export interface BlockedKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number;
  autoRefresh: boolean;
}

// Filtres actifs
export interface BlockedActiveFilters {
  impact: ('critical' | 'high' | 'medium' | 'low')[];
  bureaux: string[];
  types: string[];
  status: ('pending' | 'escalated' | 'resolved' | 'substituted')[];
  search: string;
  delayRange: { min?: number; max?: number };
  amountRange: { min?: number; max?: number };
  dateRange?: { start: string; end: string };
  assignedTo?: string[];
  tags?: string[];
}

// Statistiques temps réel
export interface BlockedStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgDelay: number;
  avgPriority: number;
  totalAmount: number;
  overdueSLA: number;
  resolvedToday: number;
  escalatedToday: number;
  byBureau: { bureau: string; count: number; critical: number }[];
  byType: { type: string; count: number }[];
  ts: string;
}

// Entrée du registre de décision (pour audit)
export interface BlockedDecisionEntry {
  id: string;
  at: string;
  batchId?: string;
  action: 'resolution' | 'escalation' | 'substitution' | 'complement' | 'audit';
  dossierId: string;
  dossierSubject: string;
  bureau: string;
  impact: string;
  delay: number;
  amount: number;
  priority: number;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  hash: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface BlockedCommandCenterState {
  // Navigation
  navigation: BlockedNavigationState;
  navigationHistory: BlockedNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: BlockedModalState;

  // Filtres
  filters: BlockedActiveFilters;

  // KPIs
  kpiConfig: BlockedKPIConfig;

  // Stats temps réel
  stats: BlockedStats | null;
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

  // Registre des décisions (audit trail)
  decisionRegister: BlockedDecisionEntry[];
  lastDecisionHash: string | null;

  // Préférences
  autoRefresh: boolean;
  refreshInterval: number;

  // Actions Navigation
  navigate: (main: BlockedMainCategory, sub?: BlockedSubCategory | null) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;

  // Actions Modal
  openModal: (type: BlockedModalType, data?: Record<string, unknown>, options?: Partial<BlockedModalState>) => void;
  closeModal: () => void;

  // Actions Filtres
  setFilter: <K extends keyof BlockedActiveFilters>(key: K, value: BlockedActiveFilters[K]) => void;
  resetFilters: () => void;

  // Actions KPI
  setKPIConfig: (config: Partial<BlockedKPIConfig>) => void;
  toggleKPIBar: () => void;

  // Actions Stats
  setStats: (stats: BlockedStats | null) => void;
  setStatsLoading: (loading: boolean) => void;

  // Actions Sélection
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: (ids?: string[]) => void;
  clearSelection: () => void;

  // Actions Recherche
  setGlobalSearch: (search: string) => void;

  // Actions Stats temps réel
  setLiveStats: (stats: Partial<BlockedCommandCenterState['liveStats']>) => void;
  startRefresh: () => void;
  endRefresh: () => void;

  // Actions Registre décisions
  addDecision: (entry: Omit<BlockedDecisionEntry, 'id'>) => void;
  clearDecisionRegister: () => void;

  // Actions Préférences
  setAutoRefresh: (value: boolean) => void;
  setRefreshInterval: (interval: number) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: BlockedNavigationState = {
  mainCategory: 'overview',
  subCategory: 'summary',
};

const defaultFilters: BlockedActiveFilters = {
  impact: [],
  bureaux: [],
  types: [],
  status: [],
  search: '',
  delayRange: {},
  amountRange: {},
  dateRange: undefined,
  assignedTo: [],
  tags: [],
};

const defaultKPIConfig: BlockedKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30,
  autoRefresh: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const useBlockedCommandCenterStore = create<BlockedCommandCenterState>()(
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
      decisionRegister: [],
      lastDecisionHash: null,
      autoRefresh: true,
      refreshInterval: 30000,

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

      // Decision Register Actions
      addDecision: (entry) => {
        const id = `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          decisionRegister: [{ ...entry, id }, ...state.decisionRegister].slice(0, 500),
          lastDecisionHash: entry.hash,
        }));
      },

      clearDecisionRegister: () => {
        set({ decisionRegister: [], lastDecisionHash: null });
      },

      // Preference Actions
      setAutoRefresh: (value) => {
        set({ autoRefresh: value });
      },

      setRefreshInterval: (interval) => {
        set({ refreshInterval: interval });
      },
    }),
    {
      name: 'bmo-blocked-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        kpiConfig: state.kpiConfig,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
      }),
    }
  )
);

export type { BlockedCommandCenterState };

