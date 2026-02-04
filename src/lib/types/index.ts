/**
 * Types Index - Point d'entrée centralisé
 * ========================================
 * 
 * Ce fichier exporte tous les types de l'application de manière organisée.
 * Il évite les doublons et les conflits entre différents fichiers de types.
 */

// ============================================
// TYPES COMMUNS (base, formulaires, UI...)
// ============================================
export * from './common.types';

// ============================================
// TYPES D'ERREUR API
// ============================================
export type {
  ApiErrorResponse,
  TypedAxiosError,
  ApiError as ApiErrorUnion,
  HttpError,
} from './api-error.types';

export {
  isHttpError,
  isNotFoundError,
  isAxiosError,
  isNetworkError,
  isTimeoutError,
  getErrorMessage,
  getErrorStatus,
} from './api-error.types';

// ============================================
// TYPES BMO (Bureau Maître d'Ouvrage)
// ============================================
// Note : Contient Bureau, Employee, Project, etc.
export * from './bmo.types';

// ============================================
// TYPES MÉTIER PAR MODULE
// ============================================
export * from './alerts.types';
export * from './demandes.types';
export * from './chantiers.types';
export * from './gouvernance.types';
export * from './validation-bc.types';
export * from './qualite.types';
export * from './foncier.types';
export * from './autorisations.types';
export * from './programmation.types';
export * from './pre-projet.types';
export * from './exploitation-maintenance.types';

// ============================================
// TYPES DE MODULE
// ============================================
export * from './module.types';

