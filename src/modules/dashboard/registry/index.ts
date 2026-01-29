/**
 * Barrel du registry Dashboard
 *
 * Point d’entrée du dossier registry. dashboardRegistry.tsx est la source de vérité
 * (toutes les entrées). index.tsx est un registry complémentaire (loaders API + fallback).
 */

export { dashboardRegistry, navToKey } from './dashboardRegistry';
export type { NavKey } from './dashboardRegistry';

export type { OverviewSummaryDashboardData } from '../types/dashboard.readmodels';
export type { ViewEntry, Loader, LoaderResult } from '../types/dashboard';
export type {
  DataResult,
  LoaderFn,
  TypedLoaderFn,
  DashboardRegistry,
} from './dashboardRegistry';

export { useDashboardView } from './useDashboardView';
