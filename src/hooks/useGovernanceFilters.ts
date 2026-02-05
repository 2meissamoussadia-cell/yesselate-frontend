// ============================================
// Hook pour gérer les filtres de la page Governance
// Gère la sérialisation/désérialisation JSON pour les objets complexes
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePageNavigation } from './usePageNavigation';
import { logger } from '@/lib/utils/logger';
import type { Severity } from '@/lib/types/alerts.types';

export type TabValue = 'raci' | 'alerts';

type AlertType = 'system' | 'blocked' | 'payment' | 'contract';

export interface GovernanceFilters {
  severity?: Severity;
  type?: AlertType;
  bureau?: string;
  status?: 'all' | 'open' | 'acknowledged' | 'resolved';
}

export interface SavedView {
  id: string;
  name: string;
  filters: GovernanceFilters;
  search?: string;
}

export interface GovernanceState {
  activeTab: TabValue;
  search: string;
  filters: GovernanceFilters;
  activeViewId: string;
  views: SavedView[];
}

const DEFAULT_VIEWS: SavedView[] = [
  { id: 'all', name: 'Toutes', filters: { status: 'all' } },
  { id: 'urgent', name: 'Mes urgences', filters: { severity: 'critical', status: 'open' } },
  { id: 'finance', name: 'Finance', filters: { type: 'payment', status: 'open' } },
  { id: 'blocked', name: 'Bloqués >5j', filters: { type: 'blocked', status: 'open' } },
];

/**
 * Sérialise un objet de filtres en string JSON pour l'URL
 */
function serializeFilters(filters: GovernanceFilters): string {
  try {
    return JSON.stringify(filters);
  } catch {
    return '';
  }
}

/**
 * Désérialise une string JSON en objet de filtres avec validation stricte
 */
function deserializeFilters(serialized: string | null): GovernanceFilters {
  if (!serialized) return { status: 'all' };
  
  try {
    const parsed = JSON.parse(serialized);
    
    // Validation stricte du schéma
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { status: 'all' };
    }
    
    // Construire un objet de filtres valide avec validation de chaque champ
    const validFilters: GovernanceFilters = { status: 'all' };
    
    // Valider severity
    if (parsed.severity && typeof parsed.severity === 'string') {
      const validSeverities: Severity[] = ['critical', 'warning', 'info', 'success'];
      if (validSeverities.includes(parsed.severity as Severity)) {
        validFilters.severity = parsed.severity as Severity;
      }
    }
    
    // Valider type
    if (parsed.type && typeof parsed.type === 'string') {
      const validTypes: AlertType[] = ['system', 'blocked', 'payment', 'contract'];
      if (validTypes.includes(parsed.type as AlertType)) {
        validFilters.type = parsed.type as AlertType;
      }
    }
    
    // Valider bureau
    if (parsed.bureau && typeof parsed.bureau === 'string') {
      validFilters.bureau = parsed.bureau;
    }
    
    // Valider status
    if (parsed.status && typeof parsed.status === 'string') {
      const validStatuses: Array<'all' | 'open' | 'acknowledged' | 'resolved'> = ['all', 'open', 'acknowledged', 'resolved'];
      if (validStatuses.includes(parsed.status)) {
        validFilters.status = parsed.status;
      }
    }
    
    return validFilters;
  } catch {
    // Si le parsing échoue, retourner les filtres par défaut
    return { status: 'all' };
  }
}

/**
 * Hook pour gérer les filtres de la page Governance
 * Gère automatiquement la synchronisation URL ↔ localStorage
 */
export function useGovernanceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateFilters, getFilters } = usePageNavigation('governance');

  // État local
  const [activeTab, setActiveTab] = useState<TabValue>('raci');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<GovernanceFilters>({ status: 'all' });
  const [activeViewId, setActiveViewId] = useState<string>('all');
  const [views, setViews] = useState<SavedView[]>(DEFAULT_VIEWS);

  // Initialisation depuis l'URL au montage
  useEffect(() => {
    try {
      // Lire depuis l'URL en priorité (source de vérité)
      const urlTab = searchParams.get('activeTab') as TabValue | null;
      const urlSearch = searchParams.get('search') || '';
      const urlFilters = searchParams.get('filters');
      const urlViewId = searchParams.get('activeViewId') || 'all';

      if (urlTab && (urlTab === 'raci' || urlTab === 'alerts')) {
        setActiveTab(urlTab);
      }

      if (urlSearch) {
        setSearch(urlSearch);
      }

      if (urlFilters) {
        const deserialized = deserializeFilters(urlFilters);
        setFilters(deserialized);
      }

      if (urlViewId) {
        setActiveViewId(urlViewId);
      }

      // Si pas de paramètres URL, essayer de restaurer depuis localStorage (fallback uniquement)
      if (!urlTab && !urlSearch && !urlFilters && urlViewId === 'all') {
        const saved = getFilters?.();
        if (saved) {
          if (saved.activeTab && (saved.activeTab === 'raci' || saved.activeTab === 'alerts')) {
            setActiveTab(saved.activeTab as TabValue);
          }
          if (saved.search && typeof saved.search === 'string') {
            setSearch(saved.search);
          }
          if (saved.filters) {
            // Toujours utiliser deserializeFilters pour la validation
            if (typeof saved.filters === 'string') {
              setFilters(deserializeFilters(saved.filters));
            } else if (typeof saved.filters === 'object' && saved.filters !== null) {
              // Re-valider même si c'est un objet
              const validated = deserializeFilters(JSON.stringify(saved.filters));
              setFilters(validated);
            }
          }
          if (saved.activeViewId && typeof saved.activeViewId === 'string') {
            setActiveViewId(saved.activeViewId);
          }
        }
      }
    } catch (error) {
      logger.error('Erreur lors de la lecture des filtres', error instanceof Error ? error : undefined, { component: 'useGovernanceFilters' });
      // En cas d'erreur, utiliser les valeurs par défaut
      setActiveTab('raci');
      setSearch('');
      setFilters({ status: 'all' });
      setActiveViewId('all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Dépendre de searchParams pour réagir aux changements d'URL

  // Synchroniser avec l'URL et localStorage quand l'état change
  useEffect(() => {
    try {
      const params = new URLSearchParams();

      // Tab (seulement si différent de 'raci' par défaut)
      if (activeTab !== 'raci') {
        params.set('activeTab', activeTab);
      }

      // Search
      if (search) {
        params.set('search', search);
      }

      // Filters (sérialisé en JSON)
      const serializedFilters = serializeFilters(filters);
      if (serializedFilters && serializedFilters !== '{}') {
        params.set('filters', serializedFilters);
      }

      // ActiveViewId
      if (activeViewId && activeViewId !== 'all') {
        params.set('activeViewId', activeViewId);
      }

      // Mettre à jour l'URL (priorité)
      const queryString = params.toString();
      const newUrl = queryString
        ? `/maitre-ouvrage/governance?${queryString}`
        : '/maitre-ouvrage/governance';

      router.replace(newUrl, { scroll: false });

      // Sauvegarder dans localStorage APRÈS mise à jour URL (décalé pour éviter conflits)
      const timeoutId = setTimeout(() => {
        try {
          updateFilters?.({
            activeTab,
            search,
            filters: serializedFilters, // Sauvegarder la version sérialisée
            activeViewId,
          });
        } catch (err) {
          logger.error('Erreur lors de la sauvegarde localStorage', err instanceof Error ? err : undefined, { component: 'useGovernanceFilters' });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde des filtres', error instanceof Error ? error : undefined, { component: 'useGovernanceFilters' });
    }
  }, [activeTab, search, filters, activeViewId, router, updateFilters]);

  // Fonctions de mise à jour
  const updateTab = useCallback((tab: TabValue) => {
    setActiveTab(tab);
  }, []);

  const updateSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
  }, []);

  const updateFiltersState = useCallback((newFilters: GovernanceFilters | ((prev: GovernanceFilters) => GovernanceFilters)) => {
    setFilters(prev => {
      const next = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      return next;
    });
  }, []);

  const updateViewId = useCallback((viewId: string) => {
    setActiveViewId(viewId);
  }, []);

  const saveView = useCallback((view: Omit<SavedView, 'id'>) => {
    const newView: SavedView = {
      ...view,
      id: `view-${Date.now()}`,
    };
    setViews(prev => [...prev, newView]);
    setActiveViewId(newView.id);
    return newView;
  }, []);

  const deleteView = useCallback((viewId: string) => {
    setViews(prev => prev.filter(v => v.id !== viewId));
    if (activeViewId === viewId) {
      setActiveViewId('all');
    }
  }, [activeViewId]);

  // Vue active calculée
  const activeView = useMemo(() => {
    return views.find(v => v.id === activeViewId) || views[0];
  }, [views, activeViewId]);

  // État complet
  const state: GovernanceState = useMemo(() => ({
    activeTab,
    search,
    filters,
    activeViewId,
    views,
  }), [activeTab, search, filters, activeViewId, views]);

  return {
    // État
    state,
    activeTab,
    search,
    filters,
    activeViewId,
    views,
    activeView,

    // Actions
    updateTab,
    updateSearch,
    updateFilters: updateFiltersState,
    updateViewId,
    saveView,
    deleteView,
  };
}


