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

// Context
export * from './context/DashboardNavigationContext';

// Hooks
export * from './hooks/useDashboardNavigation';
export * from './hooks/useDashboardNavigationSync';
export * from './hooks/useAutoRefresh';
export * from './hooks/useDashboardRefresh';
export * from './hooks/useKPIFilter';
export * from './hooks/useKPINotifications';

// Types
export * from './types/dashboardNavigationTypes';

// Config
export * from './config/dashboardNavigationConfig';
export * from './config/navigationMap';

// Utils
export * from './utils/loadComponent';
export * from './utils/routeValidation';

