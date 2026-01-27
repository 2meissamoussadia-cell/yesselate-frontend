/**
 * P20 – Playbooks Cache & workers
 * Purge / warm ciblés Redis.
 */

import { getOpsRedis } from '../redis';
import { appendAudit, ensureDryRun } from '../audit';

export async function purgeCachePrefix({
  prefix,
  dryRun = true,
}: {
  prefix: string;
  dryRun?: boolean;
}) {
  ensureDryRun(dryRun);
  const redis = getOpsRedis();
  const keys = redis ? await redis.keys(`${prefix}*`) : [];
  if (!dryRun && keys.length && redis) await redis.del(...keys);
  await appendAudit({ kind: 'ops:purge-cache', details: { prefix, count: keys.length, dryRun } });
  return { ok: true, removed: keys.length };
}

export async function warmDashboardKeys({
  tenantId,
  keys,
  dryRun = true,
}: {
  tenantId: string;
  keys: string[];
  dryRun?: boolean;
}) {
  ensureDryRun(dryRun);
  // Appeler /api/dashboard sur les clés (main/sub/leaf) pour priming (TTL registry)
  // Ici stub : enregistrer l'intention
  await appendAudit({ kind: 'ops:warm-dashboard', tenantId, details: { keys, dryRun } });
  return { ok: true };
}
