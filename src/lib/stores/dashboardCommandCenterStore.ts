'use client';

import { create } from 'zustand';
import { logger } from '@/lib/utils/logger';
import { devtools } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export type DashboardMainCategory = 
  | 'pilotage' 
  | 'chantiers' 
  | 'finance' 
  | 'clients' 
  | 'rh' 
  | 'systeme'
  | 'overview' 
  | 'performance' 
  | 'actions' 
  | 'risks' 
  | 'decisions' 
  | 'realtime'
  | 'administration';

export type DashboardSubCategory =
  | 'summary'
  | 'kpis'
  | 'bureaux'
  | 'trends'
  | 'validation'
  | 'budget'
  | 'delays'
  | 'comparison'
  | 'all'
  | 'urgent'
  | 'blocked'
  | 'pending'
  | 'completed'
  | 'critical'
  | 'warnings'
  | 'blocages'
  | 'payments'
  | 'contracts'
  | 'executed'
  | 'timeline'
  | 'audit'
  | 'live'
  | 'alerts'
  | 'notifications'
  | 'sync';

export interface DashboardNavigation {
  mainCategory: DashboardMainCategory;
  subCategory: string | null;
  subSubCategory: string | null;
}

export type CacheEntry = {
  data: any;
  fetchedAt: number;
  ttl: number;
};

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: Record<string, any>;
}

export interface DashboardCommandCenterStore {
  // Navigation
  navigation: DashboardNavigation;
  /** Timestamp du dernier navigate() (pour la sync URL : ne pas réappliquer l’URL tout de suite). */
  lastNavigatedAt: number;
  navigate: (
    mainCategory: DashboardMainCategory, 
    subCategory?: string | null, 
    filter?: string | null
  ) => void;
  /**
   * Alias compat: certains composants/historiques utilisent `navigateTo`.
   * Même signature que `navigate`.
   */
  navigateTo: (
    mainCategory: DashboardMainCategory,
    subCategory?: string | null,
    filter?: string | null
  ) => void;
  setMainCategory: (category: DashboardMainCategory) => void;
  setSubCategory: (category: string | null) => void;
  setFilter: (filter: string | null) => void;
  resetNavigation: () => void;
  goBack: () => void;
  goForward: () => void;
  navigationHistory: DashboardNavigation[];
  forwardHistory: DashboardNavigation[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  notificationsPanelOpen: boolean;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  toggleNotificationsPanel: () => void;
  toggleCommandPalette: () => void;

  // Live Stats
  liveStats: {
    lastUpdate: string | null;
    isRefreshing: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'syncing';
    total?: number;
    performance?: number;
    actions?: number;
    risks?: number;
    decisions?: number;
    realtime?: number;
  };
  startRefresh: () => void;
  endRefresh: () => void;
  /** Phase 2 #8: met à jour liveStats.lastUpdate (ex. après chargement vue) */
  setLastDataUpdate: (isoString: string) => void;

  // KPI Config
  kpiConfig: {
    visible: boolean;
    collapsed: boolean;
    refreshInterval: number;
    autoRefresh: boolean;
  };
  setKPIConfig: (config: Partial<{ visible: boolean; collapsed: boolean; refreshInterval: number; autoRefresh: boolean }>) => void;

  // Display Config
  displayConfig: {
    viewMode: 'compact' | 'extended';
    theme: 'dark' | 'light' | 'system';
    focusMode: boolean;
    presentationMode: boolean;
  };
  setDisplayConfig: (config: Partial<{ viewMode: 'compact' | 'extended'; theme: 'dark' | 'light' | 'system'; focusMode: boolean; presentationMode: boolean }>) => void;

  // Modal management
  modal: ModalState;
  openModal: (type: string, data?: Record<string, any>) => void;
  closeModal: () => void;

  // Quick actions
  quickAction: (action: string, payload?: any) => void;

  // Cache management
  cache: Record<string, CacheEntry>;
  setCache: (key: string, entry: CacheEntry) => void;
  /** Invalide tout le cache des vues et déclenche un rechargement des données (refresh global KPIs). */
  invalidateAllViews: () => void;
  /** Timestamp incrémenté à chaque invalidateAllViews pour forcer le rechargement du ContentSwitch. */
  viewDataRefreshTrigger: number;
}

// ============================================
// STORE
// ============================================

export const useDashboardCommandCenterStore = create<DashboardCommandCenterStore>()(
  devtools(
    (set, get) => ({
      // Initial navigation state — Tableau de bord DG (6 blocs métier)
      navigation: {
        mainCategory: 'pilotage',
        subCategory: 'dashboard',
        subSubCategory: 'default',
      },
      lastNavigatedAt: 0,
      navigationHistory: [],
      forwardHistory: [],

      // Cache initial
      cache: {},

      // UI State
      sidebarCollapsed: false,
      fullscreen: false,
      notificationsPanelOpen: false,
      commandPaletteOpen: false,

      // Live Stats
      liveStats: {
        lastUpdate: null,
        isRefreshing: false,
        connectionStatus: 'connected',
      },

      // KPI Config
      kpiConfig: {
        visible: true,
        collapsed: false,
        refreshInterval: 30,
        autoRefresh: true,
      },

      // Display Config
      displayConfig: {
        viewMode: 'extended',
        theme: 'dark',
        focusMode: false,
        presentationMode: false,
      },

      // Navigate simplifié selon la structure proposée
      navigate: (mainCategory, subCategory = null, subSubCategory = null) => {
        const current = get().navigation;
        const newNavigation: DashboardNavigation = {
          mainCategory,
          subCategory: subCategory || null,
          subSubCategory: subSubCategory || null,
        };

        // CORRECTION: Utiliser set avec fonction updater pour garantir la mise à jour
        // Forcer la mise à jour en créant un nouvel objet pour déclencher les re-renders
        set((state) => {
          const updated = {
            ...state,
            navigation: { ...newNavigation }, // Nouvel objet pour forcer le re-render
            lastNavigatedAt: Date.now(),
            navigationHistory: [...state.navigationHistory, current].slice(-20),
            forwardHistory: [], // Nouvelle navigation vide la pile "avancer"
          };

          return updated;
        }, false, { type: 'navigate', payload: newNavigation });
      },

      // Alias compat (évite les "ça ne réagit pas" si un composant appelle navigateTo)
      navigateTo: (mainCategory, subCategory = null, subSubCategory = null) => {
        get().navigate(mainCategory, subCategory, subSubCategory);
      },

      // Set main category seul
      setMainCategory: (category: DashboardMainCategory) => {
        set(
          (state) => ({
            navigation: {
              ...state.navigation,
              mainCategory: category,
            },
          }),
          false,
          { type: 'setMainCategory', payload: category }
        );
      },

      // Set sub category seul
      setSubCategory: (category: string | null) => {
        set(
          (state) => ({
            navigation: {
              ...state.navigation,
              subCategory: category,
            },
          }),
          false,
          { type: 'setSubCategory', payload: category }
        );
      },

      // Set subSubCategory seul
      setFilter: (subSubCategory: string | null) => {
        set(
          (state) => ({
            navigation: {
              ...state.navigation,
              subSubCategory,
            },
          }),
          false,
          { type: 'setFilter', payload: subSubCategory }
        );
      },

      // Reset navigation au state initial
      resetNavigation: () => {
        set(
          {
            navigation: {
              mainCategory: 'pilotage',
              subCategory: 'dashboard',
              subSubCategory: 'default',
            },
            navigationHistory: [],
            forwardHistory: [],
          },
          false,
          { type: 'resetNavigation' }
        );
      },

      // Retour : aller à la vue précédente
      goBack: () => {
        const history = get().navigationHistory;
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        const current = get().navigation;
        set(
          (state) => ({
            navigation: previous,
            navigationHistory: state.navigationHistory.slice(0, -1),
            forwardHistory: [...state.forwardHistory, current].slice(-20),
            lastNavigatedAt: Date.now(),
          }),
          false,
          { type: 'goBack' }
        );
      },

      // Avancer : revenir après un "retour"
      goForward: () => {
        const forward = get().forwardHistory;
        if (forward.length === 0) return;
        const next = forward[forward.length - 1];
        const current = get().navigation;
        set(
          (state) => ({
            navigation: next,
            forwardHistory: state.forwardHistory.slice(0, -1),
            navigationHistory: [...state.navigationHistory, current].slice(-20),
            lastNavigatedAt: Date.now(),
          }),
          false,
          { type: 'goForward' }
        );
      },

      // UI Toggles
      toggleSidebar: () => {
        set(
          (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
          false,
          { type: 'toggleSidebar' }
        );
      },

      toggleFullscreen: () => {
        set(
          (state) => ({ fullscreen: !state.fullscreen }),
          false,
          { type: 'toggleFullscreen' }
        );
      },

      toggleNotificationsPanel: () => {
        set(
          (state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen }),
          false,
          { type: 'toggleNotificationsPanel' }
        );
      },

      toggleCommandPalette: () => {
        set(
          (state) => ({ commandPaletteOpen: !state.commandPaletteOpen }),
          false,
          { type: 'toggleCommandPalette' }
        );
      },

      // Live Stats
      startRefresh: () => {
        set(
          (state) => ({
            liveStats: {
              ...state.liveStats,
              isRefreshing: true,
            },
          }),
          false,
          { type: 'startRefresh' }
        );
      },

      endRefresh: () => {
        set(
          (state) => ({
            liveStats: {
              ...state.liveStats,
              isRefreshing: false,
              lastUpdate: new Date().toISOString(),
            },
          }),
          false,
          { type: 'endRefresh' }
        );
      },

      setLastDataUpdate: (isoString) => {
        set(
          (state) => ({
            liveStats: {
              ...state.liveStats,
              lastUpdate: isoString,
            },
          }),
          false,
          { type: 'setLastDataUpdate', payload: isoString }
        );
      },

      // KPI Config
      setKPIConfig: (config) => {
        set(
          (state) => ({
            kpiConfig: {
              ...state.kpiConfig,
              ...config,
            },
          }),
          false,
          { type: 'setKPIConfig', payload: config }
        );
      },

      // Display Config
      setDisplayConfig: (config) => {
        set(
          (state) => ({
            displayConfig: {
              ...state.displayConfig,
              ...config,
            },
          }),
          false,
          { type: 'setDisplayConfig', payload: config }
        );
      },

      // Modal management
      modal: {
        isOpen: false,
        type: null,
        data: undefined,
      },

      openModal: (type: string, data?: Record<string, any>) => {
        set(
          {
            modal: {
              isOpen: true,
              type,
              data,
            },
          },
          false,
          { type: 'openModal', payload: { type, data } }
        );
      },

      closeModal: () => {
        set(
          {
            modal: {
              isOpen: false,
              type: null,
              data: undefined,
            },
          },
          false,
          { type: 'closeModal' }
        );
      },

      // Quick actions pour futures extensions
      quickAction: (action: string, payload?: any) => {
        logger.debug('Quick Action', { component: 'dashboardCommandCenterStore', action, payload });
        // Logique des actions rapides ici
      },

      // Cache management
      setCache: (key: string, entry: CacheEntry) => {
        set(
          (state) => ({
            ...state,
            cache: {
              ...state.cache,
              [key]: entry,
            },
          }),
          false,
          { type: 'setCache', payload: { key, entry } }
        );
      },

      invalidateAllViews: () => {
        set(
          (state) => ({
            ...state,
            cache: {},
            viewDataRefreshTrigger: Date.now(),
          }),
          false,
          { type: 'invalidateAllViews' }
        );
      },
    }),
    {
      name: 'DashboardCommandCenter',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// HOOKS UTILITAIRES
// ============================================

/**
 * Hook pour naviguer facilement
 * Usage: const nav = useNavigate(); nav.overview(); nav.overview('summary', 'highlights');
 */
export function useNavigate() {
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);

  return {
    overview: (subCat?: string, filter?: string) => 
      navigate('overview', subCat || 'summary', filter || 'dashboard'),
    
    performance: (subCat?: string, filter?: string) => 
      navigate('performance', subCat || 'kpis', filter),
    
    actions: () => 
      navigate('actions', null, null),
    
    risks: () => 
      navigate('risks', null, null),
    
    decisions: () => 
      navigate('decisions', null, null),
    
    realtime: () => 
      navigate('realtime', null, null),
  };
}

/**
 * Hook pour check si une vue est active
 * Usage: const isActive = useIsActive('overview', 'summary', 'dashboard');
 */
export function useIsActive(
  mainCategory?: DashboardMainCategory | null,
  subCategory?: string | null,
  subSubCategory?: string | null
) {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);

  if (mainCategory && navigation.mainCategory !== mainCategory) return false;
  if (subCategory !== undefined && navigation.subCategory !== subCategory) return false;
  if (subSubCategory !== undefined && navigation.subSubCategory !== subSubCategory) return false;

  return true;
}

/**
 * Hook pour obtenir l'état de navigation avec sélecteur
 */
export function useNavigationState() {
  return useDashboardCommandCenterStore((state) => state.navigation);
}
