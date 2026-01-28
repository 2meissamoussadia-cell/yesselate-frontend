/**
 * P20 – Playbooks Failover / DR
 * Health-gated failover hooks (déclenchement via supervision).
 */

import { appendAudit } from '../audit';
import { ensureDryRun, type OpsScope } from '../guards';

export interface FailoverParams {
  dryRun?: boolean;
  scope?: OpsScope;
  /** db_failover | pgbouncer_bootstrap */
  action: 'db_failover' | 'pgbouncer_bootstrap';
}

/**
 * db_failover : instruction pour la supervision (Patroni, etc.).
 * L’app ne lance pas le basculement elle-même.
 */
export async function failoverDb(params: FailoverParams): Promise<{
  ok: boolean;
  dryRun: boolean;
  message: string;
}> {
  const dryRun = params.dryRun ?? true;
  ensureDryRun(dryRun);

  const message = dryRun
    ? 'Dry-run: would trigger DB failover via supervisor (Patroni, etc.).'
    : 'Trigger DB failover via supervisor. Run manual switchover/failover.';

  await appendAudit({
    kind: 'ops:failover-db',
    details: { playbook: 'failover', params: { action: 'db_failover' }, dryRun, message, ok: true },
  });

  return { ok: true, dryRun, message };
}

/**
 * pgbouncer_bootstrap : mise à jour config / reload PgBouncer.
 */
export async function failoverPgbouncerBootstrap(params: FailoverParams): Promise<{
  ok: boolean;
  dryRun: boolean;
  message: string;
}> {
  const dryRun = params.dryRun ?? true;
  ensureDryRun(dryRun);

  const message = dryRun
    ? 'Dry-run: would reload PgBouncer config (update primary host).'
    : 'Reload PgBouncer config via external tooling.';

  await appendAudit({
    kind: 'ops:failover-pgbouncer',
    details: { playbook: 'failover', params: { action: 'pgbouncer_bootstrap' }, dryRun, message, ok: true },
  });

  return { ok: true, dryRun, message };
}
