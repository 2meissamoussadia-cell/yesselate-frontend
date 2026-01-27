// lib/server/security/mtls.ts
// Phase P18: Configuration mTLS pour communication inter-services

/**
 * Configuration mTLS pour communication inter-services
 * 
 * Note: L'implémentation complète dépend de votre infrastructure (Kubernetes, Docker, etc.)
 * Ce fichier fournit les helpers et la documentation.
 */

/**
 * Options pour connexion PostgreSQL avec mTLS
 * 
 * Usage:
 * ```ts
 * const pool = new Pool({
 *   connectionString: process.env.DATABASE_URL,
 *   ssl: getPostgresSSLConfig(),
 * });
 * ```
 */
export function getPostgresSSLConfig(): {
  rejectUnauthorized: boolean;
  cert?: string;
  key?: string;
  ca?: string;
} {
  // En production, charger les certificats depuis un secret manager
  const sslMode = process.env.POSTGRES_SSL_MODE || 'require';
  
  if (sslMode === 'disable') {
    return { rejectUnauthorized: false };
  }
  
  // mTLS: client cert + key + CA
  return {
    rejectUnauthorized: true,
    cert: process.env.POSTGRES_CLIENT_CERT, // Certificat client
    key: process.env.POSTGRES_CLIENT_KEY, // Clé privée client
    ca: process.env.POSTGRES_CA_CERT, // Certificat CA (pour vérifier le serveur)
  };
}

/**
 * Configuration pour workers (communication avec API)
 * 
 * Les workers doivent s'authentifier avec mTLS lors des appels API.
 */
export function getWorkerMTLSConfig(): {
  cert: string;
  key: string;
  ca: string;
} {
  return {
    cert: process.env.WORKER_CLIENT_CERT || '',
    key: process.env.WORKER_CLIENT_KEY || '',
    ca: process.env.API_CA_CERT || '',
  };
}

/**
 * Network policies (Kubernetes) - Documentation
 * 
 * Exemple de NetworkPolicy pour isoler les services:
 * 
 * ```yaml
 * apiVersion: networking.k8s.io/v1
 * kind: NetworkPolicy
 * metadata:
 *   name: api-policy
 * spec:
 *   podSelector:
 *     matchLabels:
 *       app: yesselate-api
 *   policyTypes:
 *   - Ingress
 *   - Egress
 *   ingress:
 *   - from:
 *     - podSelector:
 *         matchLabels:
 *           app: yesselate-worker
 *     ports:
 *     - protocol: TCP
 *       port: 3000
 *   egress:
 *   - to:
 *     - podSelector:
 *         matchLabels:
 *           app: postgres
 *     ports:
 *     - protocol: TCP
 *       port: 5432
 * ```
 */
