/**
 * P20 – Ops & Remédiations : helpers PostgreSQL
 * Pool dédié ops (sans RLS) pour VACUUM, REINDEX, REFRESH MVIEW, etc.
 * SET app.tenant_id uniquement quand scope tenant est fourni.
 */

import { Pool, PoolClient } from 'pg';

let opsPool: Pool | null = null;

/**
 * Pool PostgreSQL dédié aux opérations ops (pas de RLS par défaut).
 */
export function getOpsPool(): Pool {
  if (!opsPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for ops DB');
    }
    opsPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    opsPool.on('error', (err) => {
      console.error('[Ops DB] Pool error:', err);
    });
  }
  return opsPool;
}

/**
 * Exécute une fonction avec un client ops.
 * Optionnellement fixe app.tenant_id si scope.tenantId fourni.
 */
export async function withOpsClient<T>(
  fn: (client: PoolClient) => Promise<T>,
  scope?: { tenantId?: string }
): Promise<T> {
  const pool = getOpsPool();
  const client = await pool.connect();
  try {
    if (scope?.tenantId) {
      await client.query('SET LOCAL app.tenant_id = $1', [scope.tenantId]);
    }
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Exécute une fonction avec un client ops et app.tenant_id fixé.
 * Alias tenant-scoped pour withOpsClient.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  return withOpsClient(fn, { tenantId });
}

/**
 * Ferme le pool (tests / shutdown).
 */
export async function closeOpsPool(): Promise<void> {
  if (opsPool) {
    await opsPool.end();
    opsPool = null;
  }
}
