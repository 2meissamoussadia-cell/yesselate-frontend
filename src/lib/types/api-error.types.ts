/**
 * Types pour la gestion des erreurs API
 * =====================================
 * 
 * Fournit des types TypeScript pour typer correctement les erreurs
 * au lieu d'utiliser `any` dans les blocs catch.
 */

import type { AxiosError } from 'axios';

/**
 * Structure d'une réponse d'erreur API standard
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

/**
 * Type pour les erreurs Axios avec typage de la réponse
 */
export type TypedAxiosError<T = ApiErrorResponse> = AxiosError<T>;

/**
 * Type union pour toutes les erreurs possibles dans un bloc catch
 */
export type ApiError = TypedAxiosError | Error | unknown;

/**
 * Interface pour les erreurs avec status HTTP
 */
export interface HttpError extends Error {
  response?: {
    status: number;
    statusText?: string;
    data?: ApiErrorResponse;
  };
  isNotFound?: boolean;
  status?: number;
}

/**
 * Type guard pour vérifier si une erreur est une erreur HTTP
 */
export function isHttpError(error: unknown): error is HttpError {
  return (
    error !== null &&
    typeof error === 'object' &&
    ('response' in error || 'status' in error || 'isNotFound' in error)
  );
}

/**
 * Type guard pour vérifier si une erreur est une erreur 404
 */
export function isNotFoundError(error: unknown): boolean {
  if (!isHttpError(error)) return false;
  return (
    error.isNotFound === true ||
    error.response?.status === 404 ||
    error.status === 404
  );
}

/**
 * Type guard pour vérifier si une erreur est une erreur Axios
 */
export function isAxiosError<T = ApiErrorResponse>(
  error: unknown
): error is TypedAxiosError<T> {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true
  );
}

/**
 * Extrait le message d'erreur d'une erreur quelconque
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Une erreur est survenue'
    );
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inconnue est survenue';
}

/**
 * Extrait le code de statut HTTP d'une erreur
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isHttpError(error)) {
    return error.response?.status || error.status;
  }
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

/**
 * Vérifie si une erreur est une erreur réseau (pas de réponse)
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response && error.code !== 'ECONNABORTED';
  }
  return false;
}

/**
 * Vérifie si une erreur est un timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  }
  return false;
}
