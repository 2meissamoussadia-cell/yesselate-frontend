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

// Export des vues
export * from './views';

// Export des boutons de navigation
export * from './buttons';

