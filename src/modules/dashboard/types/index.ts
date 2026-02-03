/**
 * Export centralisé des types du Dashboard
 */

// Types de navigation et registry
export type {
  Main,
  Sub,
  Leaf,
  NavKey,
  LoaderResult,
  Loader,
  ViewRenderArgs,
  ViewEntry,
} from './dashboard';

export { navToKey } from './dashboard';

// Types de navigation existants (pour compatibilité)
export type {
  DashboardMainCategory,
  DashboardNavMainCategory,
  DashboardSubCategory,
  DashboardSubSubCategory,
  DashboardNavItem,
  NavRequires,
  NavNode,
} from './dashboardNavigationTypes';

// Types de données du registry (nouveaux)
export type {
  BaseKPIData,
  TrendDataPoint,
  MonthlyComparisonDataPoint,
  CategoryDistributionDataPoint,
  OverviewSummaryDashboardData,
  OverviewSummaryPointsData,
  OverviewKpisHighlightsData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  ValidationsGlobalData,
  DashboardViewData,
  TypedLoaderFn,
} from './dashboardDataTypes';

export {
  isOverviewSummaryDashboardData,
  isKpisProjetsData,
  isKpisDemandesData,
  isKpisBudgetData,
} from './dashboardDataTypes';

// Types domaine (chantiers, contacts, créances, validations, alertes, export, notifications)
export type {
  Contact,
  Chantier,
  Creance,
  Validation,
  KPIAlert,
  ExportConfig,
  Notification,
} from './dashboardDomain';

// Ré-export des types Read Models (Phase 2)
export type {
  Main as ReadModelMain,
  Sub as ReadModelSub,
  Leaf as ReadModelLeaf,
  DashboardReadModelData,
} from './dashboard.readmodels';
