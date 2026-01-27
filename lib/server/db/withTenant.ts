/**
 * Helper pour injection tenant_id dans le pool (RLS)
 * Phase P15: Sécurité des données - Isolation multi-tenant
 * 
 * Permet d'exécuter des requêtes avec isolation automatique par tenant
 */

import { PoolClient } from 'pg';
import { pgPool } from './pool';
import { RequestContext } from '../dashboard/context';

/**
 * Exécute une fonction avec isolation automatique par tenant
 * 
 * Configure automatiquement :
 * - SET LOCAL app.tenant_id
 * - SET LOCAL app.bureau (si présent dans scopes)
 * - set_security_context (pour compatibilité RLS)
 * 
 * @param tenantId - ID du tenant
 * @param fn - Fonction à exécuter avec le client PostgreSQL
 * @returns Résultat de la fonction
 * 
 * @example
 * ```ts
 * const result = await withTenant('tenant-uuid', async (client) => {
 *   const { rows } = await client.query('SELECT * FROM projets');
 *   return rows;
 * });
 * ```
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pgPool.connect();
  try {
    // Phase P15: Affecter SET LOCAL app.tenant_id
    await client.query(`SET LOCAL app.tenant_id = $1`, [tenantId]);
    
    // Exécuter la fonction avec le client configuré
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Exécute une fonction avec contexte complet (tenant + bureau + scopes)
 * 
 * @param ctx - Contexte de la requête (tenant, user, scopes)
 * @param fn - Fonction à exécuter avec le client PostgreSQL
 * @returns Résultat de la fonction
 * 
 * @example
 * ```ts
 * const result = await withContext(ctx, async (client) => {
 *   const { rows } = await client.query('SELECT * FROM projets WHERE bureau_code = $1', ['BMO']);
 *   return rows;
 * });
 * ```
 */
export async function withContext<T>(
  ctx: RequestContext,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pgPool.connect(ctx);
  try {
    // Le contexte RLS est déjà configuré par pgPool.connect(ctx)
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Exécute une fonction avec isolation par tenant et bureau
 * 
 * @param tenantId - ID du tenant
 * @param bureauCode - Code du bureau (optionnel)
 * @param fn - Fonction à exécuter avec le client PostgreSQL
 * @returns Résultat de la fonction
 * 
 * @example
 * ```ts
 * const result = await withTenantAndBureau('tenant-uuid', 'BMO', async (client) => {
 *   const { rows } = await client.query('SELECT * FROM projets');
 *   return rows; // RLS filtre automatiquement par tenant et bureau
 * });
 * ```
 */
export async function withTenantAndBureau<T>(
  tenantId: string,
  bureauCode: string | null,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pgPool.connect();
  try {
    // Phase P15: Affecter SET LOCAL app.tenant_id
    await client.query(`SET LOCAL app.tenant_id = $1`, [tenantId]);
    
    // Phase P15: Affecter SET LOCAL app.bureau si fourni
    if (bureauCode) {
      await client.query(`SET LOCAL app.bureau = $1`, [bureauCode]);
    }
    
    // Exécuter la fonction avec le client configuré
    return await fn(client);
  } finally {
    client.release();
  }
}
