/**
 * P20 – Playbooks Workers
 * Nettoyage advisory locks (pg_advisory_unlock_all sur la session courante).
 */

import { appendAudit, ensureDryRun } from '../audit';
import { pgPool } from '../../db/pool';

export async function clearAdvisoryLocks({ dryRun = true }: { dryRun?: boolean }) {
  ensureDryRun(dryRun);
  if (!dryRun) {
    const c = await pgPool.connect();
    try {
      await c.query('SELECT pg_advisory_unlock_all();');
    } finally {
      c.release();
    }
  }
  await appendAudit({ kind: 'ops:clear-locks', details: { dryRun } });
  return { ok: true };
}
