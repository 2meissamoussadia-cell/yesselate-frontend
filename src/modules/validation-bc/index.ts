/**
 * Exports principaux du module Validation-BC
 */

// Navigation
export * from './navigation';

// Pages
export * from './pages/overview';
export * from './pages/types';
export * from './pages/statut';
export * from './pages/historique';
export * from './pages/analyse';

// Components
export * from './components';

// Hooks
export * from './hooks';

// Types (ValidationNavItem vient de ./navigation pour éviter doublon)
export type {
  TypeDocument,
  StatutDocument,
  PrioriteDocument,
  Service,
  DocumentValidation,
  ValidationStats,
  ValidationFiltres,
  Validateur,
  RegleMetier,
} from './types/validationTypes';

// API
export * from './api/validationApi';

