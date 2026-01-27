/**
 * PostgreSQL Connection Pool
 * 
 * Phase P2-C/2: Pool de connexions PostgreSQL natif pour les read models
 * Phase P18: Configuration automatique du contexte RLS (tenant_id, bureau) sur chaque connexion
 * Utilise le package 'pg' pour les connexions directes
 */

import { Pool, PoolClient } from 'pg';
import { RequestContext } from '../dashboard/context';
import { getPostgresSSLConfig } from '../security/mtls';

// Pool PostgreSQL global (singleton)
let pgPoolInstance: Pool | null = null;

// Contexte de sécurité actuel (thread-local via AsyncLocalStorage ou global pour Node.js)
// Note: En production, utiliser AsyncLocalStorage pour isolation par requête
let currentSecurityContext: RequestContext | null = null;

/**
 * Définit le contexte de sécurité pour les prochaines connexions
 * Phase P18: RLS automatique
 */
export function setSecurityContextForPool(ctx: RequestContext | null): void {
  currentSecurityContext = ctx;
}

/**
 * Obtient ou crée le pool PostgreSQL
 * Phase P2-C/2: ABAC fort avec connexions directes
 * Phase P18: SSL/mTLS support
 */
function getPgPool(): Pool {
  if (!pgPoolInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required for PostgreSQL connection');
    }
    
    // Phase P18: Configuration SSL/mTLS
    const sslConfig = getPostgresSSLConfig();
    
    pgPoolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Configuration du pool
      max: 20, // Nombre maximum de clients dans le pool
      idleTimeoutMillis: 30000, // Fermer les clients inactifs après 30s
      connectionTimeoutMillis: 2000, // Timeout de connexion 2s
      // Phase P18: SSL/mTLS
      ssl: sslConfig.rejectUnauthorized ? sslConfig : undefined,
    });

    // Gestion des erreurs du pool
    pgPoolInstance.on('error', (err) => {
      console.error('[pgPool] Unexpected error on idle client', err);
    });
  }
  return pgPoolInstance;
}

/**
 * Configure le contexte RLS sur un client PostgreSQL
 * Phase P18: RLS automatique
 */
async function configureRLSContext(client: PoolClient, ctx: RequestContext | null): Promise<void> {
  if (!ctx) {
    return; // Pas de contexte = pas de RLS
  }

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
 * Pool PostgreSQL exporté avec configuration automatique RLS
 * Phase P2-C/2: Utilisé par SqlReadModelsRepo
 * Phase P18: Configuration automatique du contexte RLS
 */
export const pgPool = {
  /**
   * Obtient une connexion et configure automatiquement le contexte RLS
   * Phase P18: RLS automatique depuis le contexte actuel
   */
  async connect(ctx?: RequestContext): Promise<PoolClient> {
    const pool = getPgPool();
    const client = await pool.connect();
    
    // Phase P18: Configurer le contexte RLS automatiquement
    const securityCtx = ctx || currentSecurityContext;
    if (securityCtx) {
      await configureRLSContext(client, securityCtx);
    }
    
    return client;
  },
  
  /**
   * Exécute une requête avec contexte RLS automatique
   * Phase P18: Helper pour requêtes simples
   */
  async query<T = any>(text: string, params?: any[], ctx?: RequestContext): Promise<{ rows: T[] }> {
    const client = await this.connect(ctx);
    try {
      return await client.query<T>(text, params);
    } finally {
      client.release();
    }
  },
  
  // Exposer aussi le pool directement si besoin (sans RLS automatique)
  get pool() {
    return getPgPool();
  },
};
