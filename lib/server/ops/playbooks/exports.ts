/**
 * P20 – Playbooks Exports & files
 * DLQ → retry, bascule "CSV-only" temporaire.
 */

import { appendAudit } from '../audit';
import { ensureDryRun, blastRadiusLabel, type OpsScope } from '../guards';

export interface ExportsParams {
  dryRun?: boolean;
  scope?: OpsScope;
  /** dlq_retry | csv_only */
  action: 'dlq_retry' | 'csv_only';
  /** pour dlq_retry: job ids ou "all" */
  jobIds?: string[];
}

/**
 * DLQ → retry : ré-enqueue des jobs d’export en erreur.
 * À connecter à la vraie queue (Bull, SQS, etc.) selon l’infra.
 */
export async function exportsDlqRetry(params: ExportsParams): Promise<{
  ok: boolean;
  dryRun: boolean;
  retried: number;
  errors: Array<{ jobId: string; error: string }>;
}> {
  const dryRun = params.dryRun ?? true;
  ensureDryRun(dryRun);

  const jobIds = params.jobIds ?? [];
  const retried = 0;
  const errors: Array<{ jobId: string; error: string }> = [];

  // TODO: intégrer queue réelle (Bull, etc.)
  if (jobIds.length && jobIds[0] !== 'all') {
    // Stub: on pourrait appeler un service export queue
  }

  await appendAudit({
    kind: 'ops:exports-dlq-retry',
    tenantId: params.scope?.tenantId,
    playbook: 'exports',
    params: { action: 'dlq_retry', jobIds },
    details: { dryRun, retried, errors, blastRadius: blastRadiusLabel(params.scope) },
    dryRun,
    ok: errors.length === 0,
  });

  return { ok: errors.length === 0, dryRun, retried, errors };
}

/**
 * Bascule "CSV-only" temporaire : désactiver XLSX/PDF pour réduire charge.
 * Stocke un flag Redis ou feature-flag (ex. finops:export-formats = csv).
 */
export async function exportsCsvOnly(params: ExportsParams): Promise<{
  ok: boolean;
  dryRun: boolean;
  enabled: boolean;
}> {
  const dryRun = params.dryRun ?? true;
  ensureDryRun(dryRun);

  let enabled = false;
  if (!dryRun) {
    const { getOpsRedis } = await import('../redis');
    const redis = getOpsRedis();
    if (redis) {
      await redis.setex('ops:export-csv-only', 3600, '1');
      enabled = true;
    }
  }

  await appendAudit({
    kind: 'ops:exports-csv-only',
    tenantId: params.scope?.tenantId,
    playbook: 'exports',
    params: { action: 'csv_only' },
    details: { dryRun, enabled, blastRadius: blastRadiusLabel(params.scope) },
    dryRun,
    ok: true,
  });

  return { ok: true, dryRun, enabled };
}
