// lib/server/resilience/retry.ts
// Phase P13: Retry avec backoff exponentiel et jitter

/**
 * Retry avec backoff exponentiel et jitter
 * Phase P13: Résilience & DR
 * 
 * Évite le thundering herd problem avec jitter aléatoire
 * et limite le nombre de tentatives.
 */

export interface RetryOptions {
  /** Nombre de tentatives (défaut: 3) */
  attempts?: number;
  /** Délai de base en ms (défaut: 250) */
  baseDelay?: number;
  /** Délai maximum en ms (défaut: 2000) */
  maxDelay?: number;
  /** Multiplicateur exponentiel (défaut: 1.6) */
  multiplier?: number;
  /** Jitter maximum en ms (défaut: 100) */
  jitterMax?: number;
  /** Fonction pour déterminer si une erreur est retryable (défaut: toutes) */
  isRetryable?: (error: any) => boolean;
}

/**
 * Retry une fonction avec backoff exponentiel et jitter
 * 
 * @param fn - Fonction à exécuter
 * @param options - Options de retry
 * @returns Résultat de la fonction
 * @throws Dernière erreur si toutes les tentatives échouent
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    attempts = 3,
    baseDelay = 250,
    maxDelay = 2000,
    multiplier = 1.6,
    jitterMax = 100,
    isRetryable = () => true,
  } = options;

  let lastErr: any;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;

      // Vérifier si l'erreur est retryable
      if (!isRetryable(e)) {
        throw e;
      }

      // Ne pas attendre après la dernière tentative
      if (i === attempts - 1) {
        break;
      }

      // Calculer le délai avec backoff exponentiel
      const exponentialDelay = baseDelay * Math.pow(multiplier, i);
      
      // Ajouter jitter aléatoire
      const jitter = Math.random() * jitterMax;
      
      // Limiter au délai maximum
      const delay = Math.min(maxDelay, Math.round(exponentialDelay + jitter));

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastErr;
}

/**
 * Helper pour déterminer si une erreur PostgreSQL est retryable
 */
export function isPostgresRetryable(error: any): boolean {
  if (!error) return false;
  
  const message = error.message || String(error);
  const code = error.code;
  
  // Codes d'erreur PostgreSQL retryables
  const retryableCodes = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '57P01', // admin_shutdown
    '57P02', // crash_shutdown
    '57P03', // cannot_connect_now
    '53300', // too_many_connections
  ];
  
  if (code && retryableCodes.includes(code)) {
    return true;
  }
  
  // Messages d'erreur retryables
  const retryableMessages = [
    'connection',
    'timeout',
    'network',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ];
  
  return retryableMessages.some((msg) => message.toLowerCase().includes(msg));
}

/**
 * Helper pour déterminer si une erreur Redis est retryable
 */
export function isRedisRetryable(error: any): boolean {
  if (!error) return false;
  
  const message = error.message || String(error);
  
  const retryableMessages = [
    'connection',
    'timeout',
    'network',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'READONLY',
  ];
  
  return retryableMessages.some((msg) => message.toLowerCase().includes(msg));
}
