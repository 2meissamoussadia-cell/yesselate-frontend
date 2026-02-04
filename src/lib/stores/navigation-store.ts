// ============================================
// Store Zustand pour les métadonnées de navigation
// Gère les comptages de pages, filtres persistants et historique
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageCounts } from '@/lib/services/navigation.service';

interface NavigationState {
  // Comptages pour les badges
  pageCounts: PageCounts;
  
  // Historique de navigation
  navigationHistory: string[];
  maxHistorySize: number;
  
  // État de chargement des pages
  loadingPages: Set<string>;
  
  // Filtres persistants par page
  pageFilters: Record<string, Record<string, any>>;
  
  // Actions
  updatePageCount: (pageId: string, count: number) => void;
  updatePageCounts: (counts: Partial<PageCounts>) => void;
  addToHistory: (route: string) => void;
  getPreviousRoute: () => string | null;
  setPageFilter: (pageId: string, filters: Record<string, any>) => void;
  getPageFilter: (pageId: string) => Record<string, any>;
  setPageLoading: (pageId: string, loading: boolean) => void;
  isPageLoading: (pageId: string) => boolean;
  clearFilters: (pageId?: string) => void;
  reset: () => void;
}

const initialState = {
  pageCounts: {},
  navigationHistory: [],
  maxHistorySize: 50,
  loadingPages: new Set<string>(),
  pageFilters: {},
};

export const usePageMetaStore = create<NavigationState>()(
  (set, get) => ({
      ...initialState,
      
      updatePageCount: (pageId: string, count: number) => {
        set((state) => ({
          pageCounts: {
            ...state.pageCounts,
            [pageId]: count,
          },
        }));
      },
      
      updatePageCounts: (counts: Partial<PageCounts>) => {
        set((state) => ({
          pageCounts: {
            ...state.pageCounts,
            ...counts,
          },
        }));
      },
      
      addToHistory: (route: string) => {
        set((state) => {
          const history = [...state.navigationHistory];
          // Éviter les doublons consécutifs
          if (history[history.length - 1] !== route) {
            history.push(route);
            // Limiter la taille
            if (history.length > state.maxHistorySize) {
              history.shift();
            }
          }
          return { navigationHistory: history };
        });
      },
      
      getPreviousRoute: () => {
        const history = get().navigationHistory;
        if (history.length < 2) return null;
        return history[history.length - 2];
      },
      
      setPageFilter: (pageId: string, filters: Record<string, any>) => {
        set((state) => ({
          pageFilters: {
            ...state.pageFilters,
            [pageId]: filters,
          },
        }));
      },
      
      getPageFilter: (pageId: string) => {
        return get().pageFilters[pageId] || {};
      },
      
      setPageLoading: (pageId: string, loading: boolean) => {
        set((state) => {
          const loadingPages = new Set(state.loadingPages);
          if (loading) {
            loadingPages.add(pageId);
          } else {
            loadingPages.delete(pageId);
          }
          return { loadingPages };
        });
      },
      
      isPageLoading: (pageId: string) => {
        return get().loadingPages.has(pageId);
      },
      
      clearFilters: (pageId?: string) => {
        set((state) => {
          if (pageId) {
            const { [pageId]: _, ...rest } = state.pageFilters;
            return { pageFilters: rest };
          }
          return { pageFilters: {} };
        });
      },
      
      reset: () => {
        set(initialState);
      },
    })
);

