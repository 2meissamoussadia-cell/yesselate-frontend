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
export type { KPIData } from './DashboardKPIBar';
export { DashboardFooter } from './DashboardFooter';
export { DashboardBreadcrumbs } from './DashboardBreadcrumbs';
export { default as DashboardCommandCenterPage } from './DashboardCommandCenterPage';
export { DashboardUrlSync } from './DashboardUrlSync';
export { DynamicSidebar } from './DynamicSidebar';
export { DynamicSubnav } from './DynamicSubnav';
export { KPINotifications } from './KPINotifications';
export type { KPINotification } from './KPINotifications';
export { LastUpdateDisplay } from './LastUpdateDisplay';
export { ContentLoadingSkeleton } from './ContentLoadingSkeleton';
export { KPISparkline } from './shared/KPISparkline';
export type { KPITone, KPITrend } from './shared/KPISparkline';

// Export des vues
export * from './views';

// Export des boutons de navigation
export * from './buttons';

