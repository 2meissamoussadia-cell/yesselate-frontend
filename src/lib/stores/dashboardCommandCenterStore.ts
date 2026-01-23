'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export type DashboardMainCategory = 
  | 'overview' 
  | 'performance' 
  | 'actions' 
  | 'risks' 
  | 'decisions' 
  | 'realtime';

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
  navigate: (
    mainCategory: DashboardMainCategory, 
    subCategory?: string | null, 
    filter?: string | null
  ) => void;
  setMainCategory: (category: DashboardMainCategory) => void;
  setSubCategory: (category: string | null) => void;
  setFilter: (filter: string | null) => void;
  resetNavigation: () => void;
  goBack: () => void;
  navigationHistory: DashboardNavigation[];

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
}

// ============================================
// STORE
// ============================================

export const useDashboardCommandCenterStore = create<DashboardCommandCenterStore>()(
  devtools(
    (set, get) => ({
      // Initial navigation state
      navigation: {
        mainCategory: 'overview',
        subCategory: 'summary',
        subSubCategory: 'dashboard',
      },
      navigationHistory: [],

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

        // Log pour debug
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 [Store] Navigate appelé:', { 
            mainCategory, 
            subCategory, 
            subSubCategory,
            currentNavigation: current,
            newNavigation 
          });
        }

        // CORRECTION: Utiliser set avec fonction updater pour garantir la mise à jour
        // Forcer la mise à jour en créant un nouvel objet pour déclencher les re-renders
        set((state) => {
          const updated = {
            ...state,
            navigation: { ...newNavigation }, // Nouvel objet pour forcer le re-render
            navigationHistory: [...state.navigationHistory, current].slice(-20),
          };
          
          // Log après mise à jour pour vérifier
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [Store] Navigation mise à jour dans set:', updated.navigation);
            console.log('✅ [Store] État complet après mise à jour:', {
              mainCategory: updated.navigation.mainCategory,
              subCategory: updated.navigation.subCategory,
              subSubCategory: updated.navigation.subSubCategory,
            });
          }
          
          return updated;
        }, false, { type: 'navigate', payload: newNavigation });
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
              mainCategory: 'overview',
              subCategory: 'summary',
              subSubCategory: 'dashboard',
            },
            navigationHistory: [],
          },
          false,
          { type: 'resetNavigation' }
        );
      },

      // Go back dans l'historique
      goBack: () => {
        const history = get().navigationHistory;
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        set(
          (state) => ({
            navigation: previous,
            navigationHistory: state.navigationHistory.slice(0, -1),
          }),
          false,
          { type: 'goBack' }
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
        if (process.env.NODE_ENV === 'development') {
          console.log('⚡ [Store] Quick Action:', action, payload);
        }
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
