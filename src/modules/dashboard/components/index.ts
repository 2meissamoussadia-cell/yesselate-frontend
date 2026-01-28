/**
 * Export des composants du module Dashboard
 */

export { 
  DashboardContentRouter,
  useNavigationView,
  useIsViewActive,
  NavigationDebugger,
  DashboardContentRouterWithProps,
} from './DashboardContentRouter';

export type { DashboardContentRouterProps } from './DashboardContentRouter';

export { DashboardRegistryView } from './DashboardRegistryView';
export { DashboardContentSwitch } from './DashboardContentSwitch';
export { DashboardViewRouter } from './DashboardViewRouter';
export { DashboardKPIBar } from './DashboardKPIBar';
export { DashboardKPIBarWithExport } from './DashboardKPIBarWithExport';
export type { KPIData } from './DashboardKPIBar';
export { DashboardFooter } from './DashboardFooter';
export { DashboardBreadcrumbs } from './DashboardBreadcrumbs';
export { DashboardCommandCenterPage } from './DashboardCommandCenterPage';
export { DashboardModals } from './DashboardModals';
export { DashboardUrlSync } from './DashboardUrlSync';
export { DynamicSidebar } from './DynamicSidebar';
export { DynamicSubnav } from './DynamicSubnav';
export { KPINotifications } from './KPINotifications';
export { AlertNotifications } from './AlertNotifications';
export { AlertKPITiles } from './AlertKPITiles';
export { AlertDetailModal } from './AlertDetailModal';
export type { KPINotification } from './KPINotifications';
export { LastUpdateDisplay } from './LastUpdateDisplay';
export { ContentLoadingSkeleton } from './ContentLoadingSkeleton';
export { KPISparkline } from './shared/KPISparkline';
export type { KPITone, KPITrend } from './shared/KPISparkline';
export { EnterpriseBadge } from './shared/EnterpriseBadge';
export type { EnterpriseBadgeVariant } from './shared/EnterpriseBadge';

// Export des vues
export * from './views';

// Export des boutons de navigation
export * from './buttons';

