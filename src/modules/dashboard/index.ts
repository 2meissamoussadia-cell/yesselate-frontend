/**
 * Module Dashboard
 * Export principal du module
 */

// Components
export * from './components';

// Navigation
export * from './navigation';

// Registry
export * from './registry';

// Context (legacy)
// NOTE: on n'exporte plus le context en wildcard pour éviter les conflits
// avec le hook unifié `useDashboardNavigation` (source de vérité: CommandCenter store).
export { DashboardNavigationProvider } from './context/DashboardNavigationContext';

// Hooks
export * from './hooks/useDashboardNavigation';
export * from './hooks/useDashboardNavigationSync';
export * from './hooks/useDashboardNavigationSafe';
export * from './hooks/useDashboardCommandCenterUrlSync';
export * from './hooks/useAutoRefresh';
export * from './hooks/useDashboardRefresh';
export * from './hooks/useKPIFilter';
export * from './hooks/useKPINotifications';
export * from './hooks/usePresentationMode';

// Types
export * from './types/dashboardNavigationTypes';

// Config
export * from './config/dashboardNavigationConfig';
export * from './config/navigationMap';

// Utils
export * from './utils/loadComponent';
export * from './utils/routeValidation';

