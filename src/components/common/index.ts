/**
 * Common Components Index
 * =======================
 * 
 * Export centralisé de tous les composants communs
 */

// Error Boundary
export { ErrorBoundary, useErrorHandler } from './ErrorBoundary';

// Toast System
export { ToastProvider, useToast } from './Toast';
export type { Toast, ToastType } from './Toast';

// Loading States
export {
  LoadingSpinner,
  PageLoader,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  ButtonLoading,
  InlineLoader,
  FullScreenLoader,
} from './LoadingStates';

// Aliases for backward compatibility
export { LoadingSpinner as Spinner } from './LoadingStates';
export { FullScreenLoader as LoadingOverlay } from './LoadingStates';
export { ButtonLoading as LoadingButton } from './LoadingStates';
export { PageLoader as LoadingPage } from './LoadingStates';

// Empty States
export {
  EmptyState,
  EmptyList,
  EmptySearch,
  EmptyFilter,
  EmptyData,
  ErrorState,
  NotFound,
  EmptyFolder,
  EmptyCard,
} from './EmptyStates';

