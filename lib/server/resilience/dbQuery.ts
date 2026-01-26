// lib/server/resilience/dbQuery.ts
// Phase P13: Wrapper pour requêtes DB avec circuit breaker et retry

import { pgPool } from '@/lib/server/db/pool';
import { CircuitBreaker } from './circuit';
import { retry, isPostgresRetryable } from './retry';

// Phase P13: Circuit breaker pour DB (protège contre cascading failures)
const dbCircuitBreaker = new CircuitBreaker(5, 30_000, 'db'); // 5 erreurs, reset après 30s, service='db'

/**
 * Exécute une requête PostgreSQL avec circuit breaker et retry
 * Phase P13: Résilience & DR
 * 
 * @param query - Requête SQL
 * @param params - Paramètres de la requête
 * @returns Résultat de la requête
 */
export async function queryWithResilience<T = any>(
  query: string,
  params?: any[]
): Promise<{ rows: T[] }> {
  // Phase P13: Vérifier le circuit breaker
  if (!dbCircuitBreaker.canPass()) {
    throw new Error('Database circuit breaker is open');
  }

  try {
    // Phase P13: Retry avec backoff pour erreurs réseau/connexion
    const result = await retry(
      async () => {
        const client = await pgPool.connect();
        try {
          return await client.query<T>(query, params);
        } finally {
          client.release();
        }
      },
      {
        attempts: 3,
        baseDelay: 250,
        isRetryable: isPostgresRetryable,
        service: 'db',
      }
    );

    // Phase P13: Enregistrer le succès
    dbCircuitBreaker.success();

    return result;
  } catch (error) {
    // Phase P13: Enregistrer l'échec
    dbCircuitBreaker.failure();

    throw error;
  }
}

/**
 * Obtient une connexion du pool avec circuit breaker
 * Phase P13: Résilience & DR
 */
export async function connectWithResilience() {
  if (!dbCircuitBreaker.canPass()) {
    throw new Error('Database circuit breaker is open');
  }

  try {
    const client = await retry(
      async () => await pgPool.connect(),
      {
        attempts: 3,
        baseDelay: 250,
        isRetryable: isPostgresRetryable,
        service: 'db',
      }
    );

    dbCircuitBreaker.success();
    return client;
  } catch (error) {
    dbCircuitBreaker.failure();
    throw error;
  }
}
