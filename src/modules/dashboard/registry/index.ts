/**
 * Export unifié du registry Dashboard v20
 * 
 * ARCHITECTURE v20:
 * - dashboardRegistry.tsx : Registry principal avec toutes les entrées (source de vérité)
 * - index.tsx : Registry complémentaire avec loaders API + fallback (3 entrées de base)
 * - Tous les exports centralisés ici pour cohérence
 * 
 * NOTE: dashboardRegistry.tsx contient toutes les entrées et est la source principale.
 * index.tsx sera progressivement fusionné dans dashboardRegistry.tsx.
 */

// ✅ v20: dashboardRegistry.tsx est la source principale (toutes les entrées)
export { dashboardRegistry } from './dashboardRegistry';
export { navToKey } from './dashboardRegistry';
export type { NavKey } from './dashboardRegistry';

// Types
export type { OverviewSummaryDashboardData } from '../types/dashboard.readmodels';
export type { ViewEntry, Loader, LoaderResult } from '../types/dashboard';

// Types additionnels depuis dashboardRegistry.tsx
export type { 
  DataResult, 
  LoaderFn, 
  TypedLoaderFn,
  DashboardRegistry 
} from './dashboardRegistry';

// Hook pour utiliser le registry
export { useDashboardView } from './useDashboardView';
