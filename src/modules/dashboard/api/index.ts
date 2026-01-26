/**
 * API Dashboard - Exports publics (Phase 2)
 * 
 * Point d'entrée unique pour toutes les fonctionnalités API du dashboard
 */

// Types
export type {
  SecurityContext,
  RequestMetadata,
  DashboardApiResponse,
  DashboardRouteParams,
  DashboardQueryParams,
  DashboardApiOptions,
  DashboardViewDataMap,
  ViewDataForRoute,
  ViewDataForNav,
} from './types';

export {
  DashboardRouteParamsSchema,
  DashboardQueryParamsSchema,
  DashboardApiErrorCode,
  DashboardApiError,
} from './types';

// Client API
export {
  fetchDashboardView,
  invalidateCache,
  clearCache,
} from './client';

// Sécurité (pour usage côté serveur uniquement)
export {
  extractSecurityContext,
  checkPermission,
  checkViewAccess,
  applyTenantFilter,
  logAccess,
  type RequiredPermission,
  type PermissionCheckResult,
} from './security';

// Read Models (pour usage côté serveur uniquement)
export {
  fetchReadModel,
  type ReadModelOptions,
} from './readModels';
