/**
 * Store de Navigation BTP pour Analytics
 * Extension du store principal pour supporter la hiérarchie BTP (Domaine > Module > Sous-module)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalyticsDomain, AnalyticsModule, AnalyticsSubModule } from '@/lib/config/analyticsBTPArchitecture';
import { findDomain, findModule, findSubModule } from '@/lib/config/analyticsBTPArchitecture';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BTPNavigationState {
  domainId: string | null;
  moduleId: string | null;
  subModuleId: string | null;
}

export interface BTPNavigationHistory {
  domainId: string | null;
  moduleId: string | null;
  subModuleId: string | null;
  timestamp: number;
}

interface AnalyticsBTPNavigationState {
  // Navigation BTP
  navigation: BTPNavigationState;
  navigationHistory: BTPNavigationHistory[];

  // Navigation Actions
  navigateToDomain: (domainId: string) => void;
  navigateToModule: (domainId: string, moduleId: string) => void;
  navigateToSubModule: (domainId: string, moduleId: string, subModuleId: string) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Helpers
  getCurrentDomain: () => AnalyticsDomain | null;
  getCurrentModule: () => AnalyticsModule | null;
  getCurrentSubModule: () => AnalyticsSubModule | null;
  getNavigationPath: () => string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: BTPNavigationState = {
  domainId: null, // Laisser null pour afficher la vue d'accueil
  moduleId: null,
  subModuleId: null,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useAnalyticsBTPNavigationStore = create<AnalyticsBTPNavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      navigation: { ...defaultNavigation },
      navigationHistory: [],

      // Navigation Actions
      navigateToDomain: (domainId: string) => {
        const current = get().navigation;
        // Si domainId est vide, revenir à l'accueil
        if (!domainId || domainId === '') {
          set((state) => ({
            navigationHistory: [
              ...state.navigationHistory.slice(-9),
              {
                domainId: current.domainId,
                moduleId: current.moduleId,
                subModuleId: current.subModuleId,
                timestamp: Date.now(),
              },
            ],
            navigation: {
              domainId: null,
              moduleId: null,
              subModuleId: null,
            },
          }));
          return;
        }
        set((state) => ({
          navigationHistory: [
            ...state.navigationHistory.slice(-9),
            {
              domainId: current.domainId,
              moduleId: current.moduleId,
              subModuleId: current.subModuleId,
              timestamp: Date.now(),
            },
          ],
          navigation: {
            domainId,
            moduleId: null,
            subModuleId: null,
          },
        }));
      },

      navigateToModule: (domainId: string, moduleId: string) => {
        const current = get().navigation;
        set((state) => ({
          navigationHistory: [
            ...state.navigationHistory.slice(-9),
            {
              domainId: current.domainId,
              moduleId: current.moduleId,
              subModuleId: current.subModuleId,
              timestamp: Date.now(),
            },
          ],
          navigation: {
            domainId,
            moduleId,
            subModuleId: null,
          },
        }));
      },

      navigateToSubModule: (domainId: string, moduleId: string, subModuleId: string) => {
        const current = get().navigation;
        set((state) => ({
          navigationHistory: [
            ...state.navigationHistory.slice(-9),
            {
              domainId: current.domainId,
              moduleId: current.moduleId,
              subModuleId: current.subModuleId,
              timestamp: Date.now(),
            },
          ],
          navigation: {
            domainId,
            moduleId,
            subModuleId,
          },
        }));
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length > 0) {
          const previous = history[history.length - 1];
          set({
            navigation: {
              domainId: previous.domainId,
              moduleId: previous.moduleId,
              subModuleId: previous.subModuleId,
            },
            navigationHistory: history.slice(0, -1),
          });
        }
      },

      resetNavigation: () => {
        set({
          navigation: { ...defaultNavigation },
          navigationHistory: [],
        });
      },

      // Helpers
      getCurrentDomain: () => {
        const { domainId } = get().navigation;
        if (!domainId) return null;
        return findDomain(domainId) || null;
      },

      getCurrentModule: () => {
        const { domainId, moduleId } = get().navigation;
        if (!domainId || !moduleId) return null;
        return findModule(domainId, moduleId) || null;
      },

      getCurrentSubModule: () => {
        const { domainId, moduleId, subModuleId } = get().navigation;
        if (!domainId || !moduleId || !subModuleId) return null;
        return findSubModule(domainId, moduleId, subModuleId) || null;
      },

      getNavigationPath: () => {
        const { domainId, moduleId, subModuleId } = get().navigation;
        const path: string[] = [];
        if (domainId) path.push(domainId);
        if (moduleId) path.push(moduleId);
        if (subModuleId) path.push(subModuleId);
        return path;
      },
    }),
    {
      name: 'analytics-btp-navigation-storage',
      partialize: (state) => ({
        navigation: state.navigation,
        navigationHistory: state.navigationHistory.slice(-5), // Garder seulement les 5 dernières
      }),
    }
  )
);

