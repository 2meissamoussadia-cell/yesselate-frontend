/**
 * PostgreSQL Connection Pool
 * 
 * Phase P2-C/2: Pool de connexions PostgreSQL natif pour les read models
 * Utilise le package 'pg' pour les connexions directes
 */

import { Pool } from 'pg';

// Pool PostgreSQL global (singleton)
let pgPoolInstance: Pool | null = null;

/**
 * Obtient ou crée le pool PostgreSQL
 * Phase P2-C/2: ABAC fort avec connexions directes
 */
function getPgPool(): Pool {
  if (!pgPoolInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required for PostgreSQL connection');
    }
    pgPoolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Configuration du pool
      max: 20, // Nombre maximum de clients dans le pool
      idleTimeoutMillis: 30000, // Fermer les clients inactifs après 30s
      connectionTimeoutMillis: 2000, // Timeout de connexion 2s
    });

    // Gestion des erreurs du pool
    pgPoolInstance.on('error', (err) => {
      console.error('[pgPool] Unexpected error on idle client', err);
    });
  }
  return pgPoolInstance;
}

/**
 * Pool PostgreSQL exporté
 * Phase P2-C/2: Utilisé par SqlReadModelsRepo
 */
export const pgPool = {
  async connect() {
    const pool = getPgPool();
    return await pool.connect();
  },
  // Exposer aussi le pool directement si besoin
  get pool() {
    return getPgPool();
  },
};
