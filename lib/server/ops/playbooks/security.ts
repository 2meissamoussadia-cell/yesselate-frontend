/**
 * Playbooks sécurité - Opérations critiques
 * Phase P15: Sécurité - Freeze tenant, revoke sessions, rotate JWT (kid)
 * 
 * Fonctions pour opérations de sécurité avec audit et dry-run
 */

import { withTenant } from '../../db/withTenant';
import { getSecret, setSecret } from '../../security/secretsManager';
import Redis from 'ioredis';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Client Redis pour sessions (singleton)
 */
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: true,
    });
    redisClient.on('error', (err) => {
      console.error('[Ops Redis] Connection error:', err);
    });
  }
  return redisClient;
}

/**
 * Vérifie le scope (tenant)
 */
function ensureScope({ tenantId }: { tenantId: string }): void {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('Invalid tenantId');
  }
}

/**
 * Vérifie le mode dry-run
 */
function ensureDryRun(dryRun: boolean): void {
  if (typeof dryRun !== 'boolean') {
    throw new Error('dryRun must be a boolean');
  }
}

/**
 * Ajoute une entrée d'audit
 */
async function appendAudit(params: {
  kind: string;
  tenantId: string;
  details: Record<string, any>;
}): Promise<void> {
  try {
    // TODO: Intégrer avec système d'audit existant
    // Pour l'instant, log dans console + DB si disponible
    console.log('[Audit]', {
      ...params,
      timestamp: new Date().toISOString(),
    });
    
    // Optionnel : stocker dans DB
    // await withTenant(params.tenantId, async (client) => {
    //   await client.query(
    //     `INSERT INTO security_audit_log (tenant_id, kind, details, created_at)
    //      VALUES ($1, $2, $3, NOW())`,
    //     [params.tenantId, params.kind, JSON.stringify(params.details)]
    //   );
    // });
  } catch (error) {
    // Non-bloquant : si l'audit échoue, on continue
    console.warn('[Audit] Failed to append audit:', error);
  }
}

// ============================================================================
// Playbooks
// ============================================================================

/**
 * Gèle un tenant (bloque toutes les requêtes)
 * 
 * @param tenantId - ID du tenant à geler
 * @param reason - Raison du gel (optionnel)
 * @param dryRun - Mode dry-run (par défaut true)
 * @returns Résultat de l'opération
 */
export async function freezeTenant({
  tenantId,
  reason,
  dryRun = true,
}: {
  tenantId: string;
  reason?: string;
  dryRun?: boolean;
}): Promise<{ ok: boolean; dryRun: boolean }> {
  ensureScope({ tenantId });
  ensureDryRun(dryRun);
  
  const redis = getRedis();
  
  if (!dryRun && redis) {
    // Stocker le flag de gel dans Redis (TTL 1h, renouvelable)
    await redis.setex(`tenant:${tenantId}:frozen`, 3600, reason ?? 'ops');
  }
  
  await appendAudit({
    kind: 'ops:freeze-tenant',
    tenantId,
    details: { reason, dryRun },
  });
  
  return { ok: true, dryRun };
}

/**
 * Révoque les sessions d'un tenant (ou d'un utilisateur spécifique)
 * 
 * @param tenantId - ID du tenant
 * @param userId - ID de l'utilisateur (optionnel, si non fourni révoque toutes les sessions du tenant)
 * @param dryRun - Mode dry-run (par défaut true)
 * @returns Résultat avec nombre de sessions révoquées
 */
export async function revokeSessions({
  tenantId,
  userId,
  dryRun = true,
}: {
  tenantId: string;
  userId?: string;
  dryRun?: boolean;
}): Promise<{ ok: boolean; revoked: number; dryRun: boolean }> {
  ensureScope({ tenantId });
  ensureDryRun(dryRun);
  
  const redis = getRedis();
  let keys: string[] = [];
  
  if (redis) {
    // Convention : les sessions sont stockées par clé redis "sess:{tenant}:{user}:*"
    const pattern = `sess:${tenantId}:${userId ?? '*'}:*`;
    keys = await redis.keys(pattern);
    
    if (!dryRun && keys.length > 0) {
      await redis.del(...keys);
    }
  }
  
  await appendAudit({
    kind: 'ops:revoke-sessions',
    tenantId,
    details: { userId, count: keys.length, dryRun },
  });
  
  return { ok: true, revoked: keys.length, dryRun };
}

/**
 * Rotation des clés JWT avec kid (Key ID)
 * 
 * @param tenantId - ID du tenant (optionnel, pour rotation tenant-specific)
 * @param dryRun - Mode dry-run (par défaut true)
 * @returns Résultat avec ancien et nouveau kid
 */
export async function rotateJWT({
  tenantId,
  dryRun = true,
}: {
  tenantId?: string;
  dryRun?: boolean;
}): Promise<{ ok: boolean; oldKid?: string; newKid: string; dryRun: boolean }> {
  if (tenantId) {
    ensureScope({ tenantId });
  }
  ensureDryRun(dryRun);
  
  // Générer nouveau kid (timestamp + random)
  const newKid = `kid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Récupérer ancien kid depuis Secrets Manager
  const oldKidKey = tenantId ? `jwt-kid:${tenantId}` : 'jwt-kid:default';
  const oldKid = await getSecret(oldKidKey);
  
  if (!dryRun) {
    // Générer nouvelle clé JWT (32 bytes)
    const newSecret = require('crypto').randomBytes(32).toString('base64');
    const newSecretKey = tenantId ? `jwt-secret:${tenantId}:${newKid}` : `jwt-secret:${newKid}`;
    
    // Stocker nouvelle clé dans Secrets Manager
    await setSecret(newSecretKey, newSecret);
    
    // Mettre à jour le kid actif
    await setSecret(oldKidKey, newKid);
    
    // Si ancien kid existe, le conserver pour période de transition (7 jours)
    if (oldKid) {
      const oldSecretKey = tenantId ? `jwt-secret:${tenantId}:${oldKid}` : `jwt-secret:${oldKid}`;
      const oldSecret = await getSecret(oldSecretKey);
      
      if (oldSecret) {
        // Marquer ancienne clé comme dépréciée (expiration dans 7 jours)
        const deprecatedKey = `${oldSecretKey}:deprecated`;
        await setSecret(deprecatedKey, oldSecret);
        
        // TODO: Job de nettoyage pour supprimer les clés dépréciées après 7 jours
      }
    }
  }
  
  await appendAudit({
    kind: 'ops:rotate-jwt',
    tenantId: tenantId ?? 'default',
    details: { oldKid, newKid, dryRun },
  });
  
  return { ok: true, oldKid: oldKid ?? undefined, newKid, dryRun };
}

/**
 * Vérifie si un tenant est gelé
 * 
 * @param tenantId - ID du tenant
 * @returns true si le tenant est gelé
 */
export async function isTenantFrozen(tenantId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  
  const frozen = await redis.get(`tenant:${tenantId}:frozen`);
  return frozen !== null;
}

/**
 * Dégèle un tenant
 * 
 * @param tenantId - ID du tenant à dégeler
 * @param dryRun - Mode dry-run (par défaut true)
 * @returns Résultat de l'opération
 */
export async function unfreezeTenant({
  tenantId,
  dryRun = true,
}: {
  tenantId: string;
  dryRun?: boolean;
}): Promise<{ ok: boolean; dryRun: boolean }> {
  ensureScope({ tenantId });
  ensureDryRun(dryRun);
  
  const redis = getRedis();
  
  if (!dryRun && redis) {
    await redis.del(`tenant:${tenantId}:frozen`);
  }
  
  await appendAudit({
    kind: 'ops:unfreeze-tenant',
    tenantId,
    details: { dryRun },
  });
  
  return { ok: true, dryRun };
}
