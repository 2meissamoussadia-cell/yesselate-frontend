/**
 * P20 – Playbooks MViews / Read-models
 * Refresh ciblé, backfill incrémental.
 */

import { withTenant } from '../db';
import { appendAudit, ensureDryRun, ensureScope } from '../audit';

export async function refreshMViews({
  tenantId,
  domains,
  concurrently = true,
  dryRun = true,
}: {
  tenantId: string;
  domains: Array<'finance' | 'achats' | 'stocks' | 'materiel' | 'reporting' | 'compliance'>;
  concurrently?: boolean;
  dryRun?: boolean;
}) {
  ensureScope({ tenantId });
  ensureDryRun(dryRun);

  const domainToViews: Record<string, string[]> = {
    finance: ['rm_finance_overview', 'rm_finance_trends'],
    achats: ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_fournisseurs', 'rm_achats_open_orders'],
    stocks: ['rm_stocks_overview', 'rm_stocks_trends'],
    materiel: ['rm_materiel_overview'],
    reporting: ['rm_reporting_overview', 'rm_reporting_dso', 'rm_reporting_bureau', 'rm_reporting_chantier'],
    compliance: ['rm_compliance_overview', 'rm_compliance_visas_backlog', 'rm_compliance_missing_docs'],
  };

  const views = domains.flatMap((d) => domainToViews[d] ?? []);
  await withTenant(tenantId, async (client) => {
    for (const v of views) {
      const sql = `REFRESH MATERIALIZED VIEW ${concurrently ? 'CONCURRENTLY' : ''} ${v}`;
      if (!dryRun) await client.query(sql);
    }
  });

  await appendAudit({
    kind: 'ops:refresh-mviews',
    tenantId,
    details: { domains, views, concurrently, dryRun },
  });
  return { ok: true, views };
}

export async function backfillReadModels({
  tenantId,
  from,
  to,
  dryRun = true,
}: {
  tenantId: string;
  from: string;
  to: string;
  dryRun?: boolean;
}) {
  ensureScope({ tenantId });
  ensureDryRun(dryRun);
  const queries = [
    'REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_overview',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_dso',
  ];
  await withTenant(tenantId, async (client) => {
    if (!dryRun) {
      for (const q of queries) await client.query(q);
    }
  });
  await appendAudit({ kind: 'ops:backfill', tenantId, details: { from, to, dryRun } });
  return { ok: true };
}
