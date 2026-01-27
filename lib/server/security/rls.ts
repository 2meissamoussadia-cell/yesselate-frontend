// lib/server/security/rls.ts
// Phase P18: Helpers pour configurer le contexte RLS Postgres

import { PoolClient } from 'pg';
import { RequestContext } from '../dashboard/context';

/**
 * Configure le contexte de sécurité Postgres pour RLS/ABAC
 * 
 * Cette fonction doit être appelée avant chaque requête SQL pour que les politiques RLS
 * fonctionnent correctement.
 * 
 * @param client - Client PostgreSQL
 * @param ctx - Contexte de la requête (tenant, user, scopes)
 */
export async function setSecurityContext(
  client: PoolClient,
  ctx: RequestContext
): Promise<void> {
  const scopesArray = ctx.scopes || [];
  
  await client.query(
    `SELECT set_security_context($1, $2, $3, $4)`,
    [
      ctx.tenantId,
      ctx.userId || 'system',
      ctx.role || 'user',
      scopesArray,
    ]
  );
}

/**
 * Wrapper pour exécuter une requête avec contexte RLS
 * 
 * Usage:
 * ```ts
 * const result = await withRLSContext(client, ctx, async () => {
 *   return await client.query('SELECT * FROM projets');
 * });
 * ```
 */
export async function withRLSContext<T>(
  client: PoolClient,
  ctx: RequestContext,
  fn: () => Promise<T>
): Promise<T> {
  await setSecurityContext(client, ctx);
  return await fn();
}
