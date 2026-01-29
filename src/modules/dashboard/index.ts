/**
 * Module Dashboard
 * Export principal du module
 */

// Components
export * from './components';

// Dashboard Shell complet (Sidebar + KPI + ViewRouter)
export { DashboardShell } from './DashboardShell';
// Dashboard Shell layout seul (header + subnav + contenu) — pour pages qui fournissent déjà la sidebar
export { DashboardShell as DashboardShellShared } from './components/shared/DashboardShell';

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
export * from './types/dashboardDataTypes';

// Registry hooks (nouveau)
export * from './hooks/useDashboardRegistry';

// Config
export * from './config/dashboardNavigationConfig';
export * from './config/navigationMap';

// Utils
export * from './utils/loadComponent';
export * from './utils/routeValidation';
export * from './utils/navigationLabels';
export * from './utils/routeAliases';
export * from './utils/colorMapping';
export * from './utils/kpiHelpers';
export * from './utils/navAdapter';
export * from './utils/kpi';

// Types
export * from './types/dashboard';
export * from './types/dashboardRegistryTypes';

// Hooks
export * from './hooks/useDashboardData';

// Phase 5 — Cockpit API + Live
export * from './hooks/useCockpitChantiers';
export * from './hooks/useCockpitLive';
export * from './hooks/useLiveChantiers';

// V5 Ultimate — Performance
export * from './hooks/useCockpitFps';

// V5 Ultimate — Briefing DG (GPT-4)
export * from './hooks/useCockpitBriefing';

// V5 Ultimate — Prédictions ML (retard, budget, qualité)
export * from './hooks/useCockpitPredictions';

// V5 — WebSocket urgences (son + notification)
export * from './hooks/useCockpitUrgentNotification';

