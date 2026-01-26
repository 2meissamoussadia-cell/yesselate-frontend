/**
 * Gestion d'erreurs unifiée pour le Dashboard v20
 * 
 * Features:
 * - Retry automatique avec backoff exponentiel
 * - Fallback intelligent (mock si API échoue)
 * - Messages d'erreur utilisateur-friendly
 * - Tracking des erreurs pour monitoring
 */

'use client';

import { createLogger } from './logger';

const logger = createLogger('ErrorHandler');

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export interface ErrorContext {
  action: string;
  key?: string;
  [key: string]: unknown;
}

/**
 * Retry avec backoff exponentiel
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        logger.error(`Retry exhausted after ${maxRetries} attempts`, { 
          action: 'retry',
          attempts: attempt + 1,
          error: lastError.message 
        });
        throw lastError;
      }

      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
        action: 'retry',
        attempt: attempt + 1,
        delay,
        error: lastError.message,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * Gère une erreur et retourne un message utilisateur-friendly
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    // Messages d'erreur réseau
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }
    
    // Erreurs 404
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'Ressource non trouvée.';
    }
    
    // Erreurs 403/401
    if (error.message.includes('403') || error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Accès non autorisé.';
    }
    
    // Erreurs 500
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    
    // Erreur générique
    return error.message || 'Une erreur est survenue.';
  }
  
  return 'Une erreur inattendue est survenue.';
}

/**
 * Wrapper pour loader avec retry et fallback
 */
export async function loadWithRetryAndFallback<T>(
  apiLoader: () => Promise<T>,
  mockLoader: () => Promise<T>,
  context: ErrorContext
): Promise<T> {
  try {
    // Essayer l'API avec retry
    return await retryWithBackoff(apiLoader, {
      maxRetries: 2,
      initialDelay: 500,
    });
  } catch (error) {
    // Si l'API échoue, utiliser le fallback mock
    logger.warn('API load failed, using mock fallback', {
      ...context,
      error: error instanceof Error ? error.message : String(error),
    });
    
    try {
      return await mockLoader();
    } catch (mockError) {
      logger.error('Mock fallback also failed', {
        ...context,
        error: mockError instanceof Error ? mockError.message : String(mockError),
      });
      throw mockError;
    }
  }
}
