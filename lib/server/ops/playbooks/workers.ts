/**
 * P20 – Playbooks Workers
 * Relance contrôlée, nettoyage advisory locks.
 */

import { withOpsClient } from '../db';
import { appendAudit } from '../audit';
import { ensureDryRun, blastRadiusLabel, type OpsScope } from '../guards';

export interface WorkersParams {
  dryRun?: boolean;
  scope?: OpsScope;
  /** clear_locks | restart_signal (restart = appel externe / process manager) */
  action: 'clear_locks' | 'restart_signal';
}

/**
 * Liste les advisory locks et, si exécuté depuis le backend worker lui-même,
 * pg_advisory_unlock_all() peut les libérer. Ici on ne fait que lister.
 * Pour libérer : relancer le worker (restart_signal) ou exécuter un job dédié dans le même process.
 */
export async function workersClearAdvisoryLocks(params: WorkersParams): Promise<{
  ok: boolean;
  dryRun: boolean;
  listed: number;
  pids?: number[];
}> {
  const dryRun = params.dryRun ?? true;
  ensureDryRun(dryRun);

  if (dryRun) {
    await appendAudit({
      kind: 'ops:workers-clear-locks',
      playbook: 'workers',
      params: { action: 'clear_locks' },
      details: { dryRun: true },
      dryRun: true,
      ok: true,
    });
    return { ok: true, dryRun: true, listed: 0 };
  }

  let listed = 0;
  const pids: number[] = [];
  await withOpsClient(async (client) => {
    const { rows } = await client.query<{ pid: number }>(`
      SELECT DISTINCT pid FROM pg_locks WHERE locktype = 'advisory'
    `);
    listed = rows.length;
    rows.forEach((r) => pids.push(r.pid));
  }, params.scope);

  await appendAudit({
    kind: 'ops:workers-clear-locks',
    tenantId: params.scope?.tenantId,
    playbook: 'workers',
    params: { action: 'clear_locks' },
    details: { listed, pids, blastRadius: blastRadiusLabel(params.scope) },
    dryRun: false,
    ok: true,
  });

  return { ok: true, dryRun: false, listed, pids };
}

/**
 * restart_signal : pas d’exécution côté app.
 * Le playbook renvoie une instruction pour l’orchestrateur (PM2, K8s, systemd).
 */
export async function workersRestartSignal(params: WorkersParams): Promise<{
  ok: boolean;
  dryRun: boolean;
  message: string;
}> {
  const dryRun = params.dryRun ?? true;
  ensureDryRun(dryRun);

  const message = dryRun
    ? 'Dry-run: would emit restart signal (PM2/K8s/systemd). Run via process manager.'
    : 'Emit restart via process manager (e.g. pm2 restart refresh-worker).';

  await appendAudit({
    kind: 'ops:workers-restart-signal',
    tenantId: params.scope?.tenantId,
    playbook: 'workers',
    params: { action: 'restart_signal' },
    details: { dryRun, message },
    dryRun,
    ok: true,
  });

  return { ok: true, dryRun, message };
}
