/**
 * P20 – Playbooks DB hygiene
 * VACUUM/ANALYZE, REINDEX CONCURRENTLY.
 */

import { withTenant } from '../db';
import { appendAudit, ensureDryRun } from '../audit';

/** Tenant sentinelle pour ops globales (VACUUM/REINDEX non scopés tenant). */
const OPS_GLOBAL_TENANT = '00000000-0000-0000-0000-000000000000';

export async function vacuumAnalyze({
  tables,
  dryRun = true,
}: {
  tables: string[];
  dryRun?: boolean;
}) {
  ensureDryRun(dryRun);
  await withTenant(OPS_GLOBAL_TENANT, async (client) => {
    for (const t of tables) {
      if (!dryRun) await client.query(`VACUUM (ANALYZE) ${t}`);
    }
  });
  await appendAudit({ kind: 'ops:vacuum', details: { tables, dryRun } });
  return { ok: true };
}

export async function reindexConcurrently({
  indexes,
  dryRun = true,
}: {
  indexes: string[];
  dryRun?: boolean;
}) {
  ensureDryRun(dryRun);
  await withTenant(OPS_GLOBAL_TENANT, async (client) => {
    for (const i of indexes) {
      if (!dryRun) await client.query(`REINDEX INDEX CONCURRENTLY ${i}`);
    }
  });
  await appendAudit({ kind: 'ops:reindex', details: { indexes, dryRun } });
  return { ok: true };
}
