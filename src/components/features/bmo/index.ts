/**
 * BMO Features Components Index
 * ==============================
 * 
 * Point d'entrée centralisé pour tous les composants BMO
 */

// Composants UI Critiques (NOUVEAU)
export { ErrorBoundary, useErrorHandler, withErrorBoundary } from './ErrorBoundary';
export { ToastProvider, useToast } from './ToastProvider';
export type { Toast, ToastType } from './ToastProvider';
export {
  Spinner,
  Skeleton,
  SkeletonTable,
  SkeletonCard,
  SkeletonList,
  LoadingOverlay,
  LoadingButton,
  PulseDots,
} from './LoadingStates';
export {
  EmptyState,
  EmptySearch,
  EmptyList,
  EmptyError,
  EmptyFilters,
} from './EmptyStates';
export type { EmptyStateType, EmptyStateProps } from './EmptyStates';

// Composants principaux
export { NotificationCenter } from './NotificationCenter';
export { CommentSection } from './CommentSection';
export { AlertsPanel } from './AlertsPanel';
export { WorkflowViewer } from './WorkflowViewer';
export { AnalyticsDashboard } from './AnalyticsDashboard';

// Composants workspace - Finances
export { 
  FinancesWorkspaceTabs,
  FinancesWorkspaceContent,
  FinancesLiveCounters,
  FinancesCommandPalette,
  FinancesStatsModal,
  FinancesDashboardView,
  FinancesTresorerieView
} from './workspace/finances';

// Composants workspace - Recouvrements
export {
  RecouvrementsWorkspaceTabs,
  RecouvrementsWorkspaceContent,
  RecouvrementsLiveCounters,
  RecouvrementsCommandPalette,
  RecouvrementsStatsModal,
  RecouvrementsInboxView,
  RecouvrementsDetailView
} from './workspace/recouvrements';

// Composants workspace - Litiges
export {
  LitigesWorkspaceTabs,
  LitigesWorkspaceContent,
  LitigesLiveCounters,
  LitigesCommandPalette,
  LitigesStatsModal,
  LitigesInboxView,
  LitigesDetailView
} from './workspace/litiges';

// Composants workspace - Missions
export {
  MissionsWorkspaceTabs,
  MissionsWorkspaceContent,
  MissionsLiveCounters,
  MissionsCommandPalette,
  MissionsStatsModal
} from './workspace/missions';
