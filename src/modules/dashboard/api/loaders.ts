/**
 * Loaders API pour le Dashboard Registry v20
 * 
 * Remplace les loaders mockés par des appels API réels
 * Compatible avec le contrat Loader<TData> du registry
 * Utilise le système de logging unifié
 */

import { navToKey, type NavKey } from '../types/dashboard';
import type { Loader, LoaderResult } from '../types/dashboard';
import type {
  OverviewSummaryDashboardData,
  OverviewSummaryPointsData,
  OverviewKpisHighlightsData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  DashboardViewData,
} from '../types/dashboardDataTypes';
import { fetchDashboardView } from './client';
import { createLogger } from '../utils/logger';

const logger = createLogger('DashboardLoaders');

// ============================================================================
// Helper pour créer un loader API standardisé
// ============================================================================

/**
 * Crée un loader API qui appelle fetchDashboardView
 * 
 * @template TData - Type de données attendu
 * @param nav - Clé de navigation
 * @returns LoaderResult avec les données et métadonnées
 */
function createApiLoader<TData extends DashboardViewData>(
  nav: NavKey
): Loader<TData> {
  return async (currentNav: NavKey): Promise<LoaderResult<TData>> => {
    // Utiliser la navigation passée en paramètre (plus précise)
    const targetNav = currentNav || nav;
    const cacheKey = navToKey(targetNav);
    
    try {
      // Appel API avec typage strict
      const data = await fetchDashboardView<TData>(targetNav as NavKey & { main: typeof targetNav.main; sub: typeof targetNav.sub; leaf: typeof targetNav.leaf });
      
      return {
        key: cacheKey,
        fetchedAt: Date.now(),
        data: data as TData,
      };
    } catch (error) {
      // En cas d'erreur, logger et retourner un résultat vide plutôt que de faire échouer le rendu
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error loading data for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
      
      return {
        key: cacheKey,
        fetchedAt: Date.now(),
        data: {} as TData,
      };
    }
  };
}

// ============================================================================
// Loaders API par vue
// ============================================================================

/**
 * Loader API pour overview/summary/dashboard
 */
export const loadOverviewSummaryDashboardApi: Loader<OverviewSummaryDashboardData> =
  createApiLoader<OverviewSummaryDashboardData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'dashboard',
  });

/**
 * Loader API pour overview/summary/points
 */
export const loadOverviewSummaryPointsApi: Loader<OverviewSummaryPointsData> =
  createApiLoader<OverviewSummaryPointsData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'points',
  });

/**
 * Loader API pour overview/kpis/highlights
 */
export const loadOverviewKpisHighlightsApi: Loader<OverviewKpisHighlightsData> =
  createApiLoader<OverviewKpisHighlightsData>({
    main: 'overview',
    sub: 'kpis',
    leaf: 'highlights',
  });

/**
 * Loader API pour performance/kpis/projets
 */
export const loadKpisProjetsApi: Loader<KpisProjetsData> =
  createApiLoader<KpisProjetsData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'projets',
  });

/**
 * Loader API pour performance/kpis/demandes
 */
export const loadKpisDemandesApi: Loader<KpisDemandesData> =
  createApiLoader<KpisDemandesData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'demandes',
  });

/**
 * Loader API pour performance/kpis/budget
 */
export const loadKpisBudgetApi: Loader<KpisBudgetData> =
  createApiLoader<KpisBudgetData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'budget',
  });

// ============================================================================
// Helper pour créer un loader dynamique depuis une NavKey
// ============================================================================

/**
 * Crée un loader API dynamique depuis une clé de navigation
 * Utile pour les routes non encore définies explicitement
 */
export function createDynamicApiLoader<TData extends DashboardViewData = DashboardViewData>(
  nav: NavKey
): Loader<TData> {
  return createApiLoader<TData>(nav);
}
