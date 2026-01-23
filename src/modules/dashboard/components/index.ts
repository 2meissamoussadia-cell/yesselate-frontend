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
// ⚠️ DashboardUrlSync et StoreBridge sont dépréciés - utiliser useDashboardNavigationSync dans layout.tsx
// export { DashboardUrlSync } from './DashboardUrlSync';
// export { StoreBridge } from './StoreBridge';
// ⚠️ DynamicSidebar et DynamicSubnav sont supprimés (doublons non utilisés)
// export { DynamicSidebar } from './DynamicSidebar';
// export { DynamicSubnav } from './DynamicSubnav';
// ⚠️ DashboardCommandCenterPage utilise l'ancien système - non utilisé dans page.tsx
export { default as DashboardCommandCenterPage } from './DashboardCommandCenterPage';

// Export des vues
export * from './views';

// Export des boutons de navigation
export * from './buttons';

