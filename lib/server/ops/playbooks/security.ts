/**
 * Playbooks sécurité - Opérations critiques
 * Phase P15/P20: Freeze tenant, revoke sessions, rotate JWT (kid), purge tokens
 * Utilise audit + guards centralisés (P20).
 */

import { getSecret, setSecret } from '../../security/secretsManager';
import { getOpsRedis } from '../redis';
import { appendAudit } from '../audit';
import { ensureDryRun, ensureScope, blastRadiusLabel, type OpsScope } from '../guards';

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
  scope,
}: {
  tenantId: string;
  reason?: string;
  dryRun?: boolean;
  scope?: OpsScope;
}): Promise<{ ok: boolean; dryRun: boolean }> {
  ensureScope(scope ?? { tenantId }, true);
  ensureDryRun(dryRun ?? true);

  const redis = getOpsRedis();

  if (!dryRun && redis) {
    await redis.setex(`tenant:${tenantId}:frozen`, 3600, reason ?? 'ops');
  }

  await appendAudit({
    kind: 'ops:freeze-tenant',
    tenantId,
    playbook: 'security',
    params: { reason },
    details: { reason, dryRun, blastRadius: blastRadiusLabel(scope) },
    dryRun: dryRun ?? true,
    ok: true,
  });

  return { ok: true, dryRun: dryRun ?? true };
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
  scope,
}: {
  tenantId: string;
  userId?: string;
  dryRun?: boolean;
  scope?: OpsScope;
}): Promise<{ ok: boolean; revoked: number; dryRun: boolean }> {
  ensureScope(scope ?? { tenantId }, true);
  ensureDryRun(dryRun ?? true);

  const redis = getOpsRedis();
  let keys: string[] = [];

  if (redis) {
    const pattern = `sess:${tenantId}:${userId ?? '*'}:*`;
    keys = await redis.keys(pattern);
    if (!dryRun && keys.length > 0) {
      await redis.del(...keys);
    }
  }

  await appendAudit({
    kind: 'ops:revoke-sessions',
    tenantId,
    playbook: 'security',
    params: { userId },
    details: { userId, count: keys.length, dryRun, blastRadius: blastRadiusLabel(scope) },
    dryRun: dryRun ?? true,
    ok: true,
  });

  return { ok: true, revoked: keys.length, dryRun: dryRun ?? true };
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
  scope,
}: {
  tenantId?: string;
  dryRun?: boolean;
  scope?: OpsScope;
}): Promise<{ ok: boolean; oldKid?: string; newKid: string; dryRun: boolean }> {
  ensureScope(scope ?? (tenantId ? { tenantId } : undefined), false);
  ensureDryRun(dryRun ?? true);

  const newKid = `kid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const oldKidKey = tenantId ? `jwt-kid:${tenantId}` : 'jwt-kid:default';
  const oldKid = await getSecret(oldKidKey);

  if (!dryRun) {
    const newSecret = require('crypto').randomBytes(32).toString('base64');
    const newSecretKey = tenantId ? `jwt-secret:${tenantId}:${newKid}` : `jwt-secret:${newKid}`;
    await setSecret(newSecretKey, newSecret);
    await setSecret(oldKidKey, newKid);
    if (oldKid) {
      const oldSecretKey = tenantId ? `jwt-secret:${tenantId}:${oldKid}` : `jwt-secret:${oldKid}`;
      const oldSecret = await getSecret(oldSecretKey);
      if (oldSecret) {
        const deprecatedKey = `${oldSecretKey}:deprecated`;
        await setSecret(deprecatedKey, oldSecret);
      }
    }
  }

  await appendAudit({
    kind: 'ops:rotate-jwt',
    tenantId: tenantId ?? 'default',
    playbook: 'security',
    params: { tenantId },
    details: { oldKid, newKid, dryRun },
    dryRun: dryRun ?? true,
    ok: true,
  });

  return { ok: true, oldKid: oldKid ?? undefined, newKid, dryRun: dryRun ?? true };
}

/**
 * Vérifie si un tenant est gelé
 * 
 * @param tenantId - ID du tenant
 * @returns true si le tenant est gelé
 */
export async function isTenantFrozen(tenantId: string): Promise<boolean> {
  const redis = getOpsRedis();
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
  scope,
}: {
  tenantId: string;
  dryRun?: boolean;
  scope?: OpsScope;
}): Promise<{ ok: boolean; dryRun: boolean }> {
  ensureScope(scope ?? { tenantId }, true);
  ensureDryRun(dryRun ?? true);

  const redis = getOpsRedis();
  if (!dryRun && redis) {
    await redis.del(`tenant:${tenantId}:frozen`);
  }

  await appendAudit({
    kind: 'ops:unfreeze-tenant',
    tenantId,
    playbook: 'security',
    details: { dryRun, blastRadius: blastRadiusLabel(scope) },
    dryRun: dryRun ?? true,
    ok: true,
  });

  return { ok: true, dryRun: dryRun ?? true };
}
