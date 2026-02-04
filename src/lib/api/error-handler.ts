/**
 * Gestion d'erreurs standardisée pour les routes API
 */

import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp?: string;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Codes d'erreur standardisés
 */
export const ErrorCodes = {
  // Erreurs client (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  
  // Erreurs serveur (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Erreurs métier
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

/**
 * Codes HTTP standardisés
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Créer une réponse d'erreur standardisée
 */
export function createErrorResponse(
  error: string,
  code: string,
  statusCode: number,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error,
    code,
    timestamp: new Date().toISOString(),
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  // Logger l'erreur
  if (statusCode >= 500) {
    console.error(`[API Error ${statusCode}] ${code}: ${error}`, details);
  } else if (process.env.NODE_ENV === 'development') {
    console.warn(`[API Warning ${statusCode}] ${code}: ${error}`, details);
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Créer une réponse d'erreur depuis une ApiError
 */
export function handleApiError(error: ApiError): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    error.message,
    error.code,
    error.statusCode,
    error.details
  );
}

/**
 * Créer une réponse d'erreur depuis une erreur générique
 */
export function handleGenericError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return handleApiError(error);
  }

  if (error instanceof Error) {
    return createErrorResponse(
      error.message || 'Erreur serveur',
      ErrorCodes.INTERNAL_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    );
  }

  return createErrorResponse(
    'Erreur inconnue',
    ErrorCodes.INTERNAL_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}

/**
 * Wrapper pour les routes API avec gestion d'erreurs automatique
 */
export function withErrorHandler<T = any>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch(handleGenericError);
}

/**
 * Créer une réponse de succès standardisée
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = HttpStatus.OK
): NextResponse<{ success: true; data: T }> {
  return NextResponse.json({ success: true, data }, { status: statusCode });
}

/**
 * Valider les paramètres requis
 */
export function validateRequired(params: Record<string, any>, requiredFields: string[]): void {
  const missing = requiredFields.filter(field => !params[field]);
  
  if (missing.length > 0) {
    throw new ApiError(
      ErrorCodes.MISSING_PARAMETER,
      `Paramètres requis manquants: ${missing.join(', ')}`,
      HttpStatus.BAD_REQUEST,
      { missing }
    );
  }
}

/**
 * Valider un ID
 */
export function validateId(id: string | undefined | null, resourceName: string = 'ressource'): string {
  if (!id || id.trim() === '') {
    throw new ApiError(
      ErrorCodes.MISSING_PARAMETER,
      `ID de ${resourceName} requis`,
      HttpStatus.BAD_REQUEST
    );
  }
  return id;
}

/**
 * Créer une erreur "Not Found"
 */
export function notFound(resourceName: string = 'ressource', id?: string): ApiError {
  return new ApiError(
    ErrorCodes.NOT_FOUND,
    id ? `${resourceName} non trouvée : ${id}` : `${resourceName} non trouvée`,
    HttpStatus.NOT_FOUND
  );
}

/**
 * Créer une erreur "Bad Request"
 */
export function badRequest(message: string, details?: any): ApiError {
  return new ApiError(
    ErrorCodes.BAD_REQUEST,
    message,
    HttpStatus.BAD_REQUEST,
    details
  );
}

/**
 * Créer une erreur "Forbidden"
 */
export function forbidden(message: string = 'Accès interdit'): ApiError {
  return new ApiError(
    ErrorCodes.FORBIDDEN,
    message,
    HttpStatus.FORBIDDEN
  );
}

/**
 * Créer une erreur "Unauthorized"
 */
export function unauthorized(message: string = 'Non autorisé'): ApiError {
  return new ApiError(
    ErrorCodes.UNAUTHORIZED,
    message,
    HttpStatus.UNAUTHORIZED
  );
}

/**
 * Créer une erreur "Conflict"
 */
export function conflict(message: string, details?: any): ApiError {
  return new ApiError(
    ErrorCodes.CONFLICT,
    message,
    HttpStatus.CONFLICT,
    details
  );
}

/**
 * Créer une erreur "Rate Limit Exceeded"
 */
export function rateLimitExceeded(retryAfter?: number): ApiError {
  const error = new ApiError(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    'Trop de requêtes',
    HttpStatus.TOO_MANY_REQUESTS,
    retryAfter ? { retryAfter } : undefined
  );
  return error;
}
