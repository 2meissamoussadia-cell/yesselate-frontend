/**
 * Exemple de migration d'un WorkspaceStore vers la factory générique
 * ===================================================================
 * 
 * Ce fichier montre comment migrer un store existant vers la factory.
 * Pour une migration réelle, remplacer l'ancien store par celui-ci.
 * 
 * Avant (145 lignes) → Après (30 lignes)
 */

import {
  createGenericWorkspaceStore,
  GenericWorkspaceState,
  GenericFilter,
} from '../createGenericWorkspaceStore';

// === Types spécifiques au module Analytics ===
export type AnalyticsTabType = 'dashboard' | 'kpi' | 'trends' | 'comparison' | 'report' | 'export';

export interface AnalyticsTabData {
  dateRange?: { start: string; end: string };
  metrics?: string[];
  filters?: Record<string, unknown>;
}

export interface AnalyticsFilter extends GenericFilter {
  dateRange: { start: string; end: string };
  metrics?: string[];
  bureaux?: string[];
}

// === Création du store avec la factory ===
export const useAnalyticsWorkspaceStoreV2 = createGenericWorkspaceStore<
  AnalyticsTabType,
  AnalyticsTabData,
  AnalyticsFilter
>({
  moduleName: 'analytics',
  defaultTabType: 'dashboard',
  storageKey: 'bmo:analytics:workspace:v2',
  defaultFilter: {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  },
  maxTabs: 20,
});

// === Type du store pour les composants ===
export type AnalyticsWorkspaceStoreV2 = GenericWorkspaceState<
  AnalyticsTabType,
  AnalyticsTabData,
  AnalyticsFilter
>;

// === Exemple d'utilisation ===
/*
import { useAnalyticsWorkspaceStoreV2 } from '@/lib/stores/examples/analyticsWorkspaceStoreV2';

function MyComponent() {
  const { 
    tabs, 
    activeTabId, 
    openTab, 
    closeTab, 
    currentFilter,
    setFilter,
    commandPaletteOpen,
    setCommandPaletteOpen,
  } = useAnalyticsWorkspaceStoreV2();

  // Ouvrir un onglet
  openTab({
    id: 'trends-1',
    type: 'trends',
    title: 'Tendances Q1',
    data: { metrics: ['revenue', 'costs'] },
  });

  // Appliquer un filtre
  setFilter({ 
    dateRange: { start: '2026-01-01', end: '2026-03-31' },
    bureaux: ['casablanca', 'rabat'],
  });

  return (
    <div>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => closeTab(tab.id)}>
          {tab.title}
        </button>
      ))}
    </div>
  );
}
*/
