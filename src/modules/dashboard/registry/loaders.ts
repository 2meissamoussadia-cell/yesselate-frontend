/**
 * Loaders API simples pour le Dashboard Registry v20
 * 
 * Loaders qui appellent directement l'API avec fetch
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
import { createLogger } from '../utils/logger';

const logger = createLogger('RegistryLoaders');

// ============================================================================
// Helper pour créer un loader API simple
// ============================================================================

/**
 * Crée un loader qui appelle l'API avec fetch
 * 
 * @template TData - Type de données attendu
 * @param nav - Clé de navigation par défaut (utilisée si nav passé est null)
 * @returns LoaderResult avec les données et métadonnées
 */
function createApiLoader<TData extends DashboardViewData>(
  nav: NavKey
): Loader<TData> {
  return async (currentNav: NavKey): Promise<LoaderResult<TData>> => {
    // Utiliser la navigation passée en paramètre (plus précise)
    const targetNav = currentNav || nav;
    const cacheKey = navToKey(targetNav);
    
    // Construire l'URL de l'API
    const url = `/api/dashboard/${targetNav.main}/${targetNav.sub ?? ''}/${targetNav.leaf ?? ''}`;
    
    try {
      // Appel API avec fetch
      const res = await fetch(url, { 
        cache: 'no-store', // Pas de cache pour toujours avoir les données fraîches
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`API request failed: ${res.status} ${res.statusText}`);
      }
      
      const data = (await res.json()) as TData;
      
      return {
        key: cacheKey,
        fetchedAt: Date.now(),
        data,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error loading data for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
      
      // En cas d'erreur, retourner un résultat vide plutôt que de faire échouer le rendu
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
export const loadOverviewSummaryDashboard: Loader<OverviewSummaryDashboardData> =
  createApiLoader<OverviewSummaryDashboardData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'dashboard',
  });

/**
 * Loader API pour overview/summary/points
 */
export const loadOverviewSummaryPoints: Loader<OverviewSummaryPointsData> =
  createApiLoader<OverviewSummaryPointsData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'points',
  });

/**
 * Loader API pour overview/kpis/highlights
 */
export const loadOverviewKpisHighlights: Loader<OverviewKpisHighlightsData> =
  createApiLoader<OverviewKpisHighlightsData>({
    main: 'overview',
    sub: 'kpis',
    leaf: 'highlights',
  });

/**
 * Loader API pour performance/kpis/projets
 */
export const loadKpisProjets: Loader<KpisProjetsData> =
  createApiLoader<KpisProjetsData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'projets',
  });

/**
 * Loader API pour performance/kpis/demandes
 */
export const loadKpisDemandes: Loader<KpisDemandesData> =
  createApiLoader<KpisDemandesData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'demandes',
  });

/**
 * Loader API pour performance/kpis/budget
 */
export const loadKpisBudget: Loader<KpisBudgetData> =
  createApiLoader<KpisBudgetData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'budget',
  });
