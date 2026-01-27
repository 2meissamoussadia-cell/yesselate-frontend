/**
 * P20 – Dispatcher runbook
 * Route POST /api/ops/runbook → exécute un playbook (dry-run ou real).
 */

import type { WorkersParams } from './playbooks/workers';
import type { ExportsParams } from './playbooks/exports';
import type { FailoverParams } from './playbooks/failover';
import type { OpsScope } from './guards';

import { refreshMViews, backfillReadModels } from './playbooks/mviews';
import { vacuumAnalyze, reindexConcurrently } from './playbooks/db_hygiene';
import { purgeCachePrefix, warmDashboardKeys } from './playbooks/cache';
import { workersClearAdvisoryLocks, workersRestartSignal } from './playbooks/workers';
import { exportsDlqRetry, exportsCsvOnly } from './playbooks/exports';
import { failoverDb, failoverPgbouncerBootstrap } from './playbooks/failover';
import { freezeTenant, unfreezeTenant, revokeSessions, rotateJWT } from './playbooks/security';

export type PlaybookName =
  | 'mviews_refresh'
  | 'mviews_backfill'
  | 'db_vacuum'
  | 'db_reindex'
  | 'cache_purge'
  | 'cache_warm'
  | 'workers_clear_locks'
  | 'workers_restart'
  | 'exports_dlq_retry'
  | 'exports_csv_only'
  | 'failover_db'
  | 'failover_pgbouncer'
  | 'security_freeze'
  | 'security_unfreeze'
  | 'security_revoke_sessions'
  | 'security_rotate_jwt';

export interface RunbookRequest {
  playbook: PlaybookName;
  params?: Record<string, unknown>;
  dryRun?: boolean;
  scope?: OpsScope;
}

export async function executeRunbook(req: RunbookRequest): Promise<{
  ok: boolean;
  playbook: PlaybookName;
  dryRun: boolean;
  result: unknown;
}> {
  const dryRun = req.dryRun ?? true;
  const scope = req.scope;
  const p = req.params ?? {};

  const run = async (fn: () => Promise<{ ok: boolean } & Record<string, unknown>>) => {
    const result = await fn();
    return { ok: result.ok, playbook: req.playbook, dryRun, result };
  };

  type MViewDomain = 'finance' | 'achats' | 'stocks' | 'materiel' | 'reporting' | 'compliance';

  switch (req.playbook) {
    case 'mviews_refresh': {
      const tenantId = (p.tenantId ?? scope?.tenantId) as string | undefined;
      if (!tenantId) throw new Error('mviews_refresh requires tenantId (params or scope)');
      const domains = (p.domains ?? (p.domain ? [p.domain] : [])) as MViewDomain[];
      return run(() =>
        refreshMViews({
          tenantId,
          domains,
          concurrently: (p.concurrently as boolean) ?? true,
          dryRun,
        })
      );
    }
    case 'mviews_backfill': {
      const tenantId = (p.tenantId ?? scope?.tenantId) as string | undefined;
      if (!tenantId) throw new Error('mviews_backfill requires tenantId (params or scope)');
      return run(() =>
        backfillReadModels({
          tenantId,
          from: (p.from as string) ?? new Date(0).toISOString(),
          to: (p.to as string) ?? new Date().toISOString(),
          dryRun,
        })
      );
    }
    case 'db_vacuum': {
      const tables = (p.tables ?? p.targets ?? ['factures', 'encaissements', 'projets', 'demandes']) as string[];
      return run(() => vacuumAnalyze({ tables, dryRun }));
    }
    case 'db_reindex': {
      const indexes = (p.indexes ?? p.targets ?? []) as string[];
      if (!indexes.length) throw new Error('db_reindex requires indexes (params.indexes or params.targets)');
      return run(() => reindexConcurrently({ indexes, dryRun }));
    }
    case 'cache_purge': {
      const prefix = (p.prefix ?? p.pattern ?? 'cache:') as string;
      return run(() => purgeCachePrefix({ prefix, dryRun }));
    }
    case 'cache_warm': {
      const tenantId = (p.tenantId ?? scope?.tenantId) as string | undefined;
      if (!tenantId) throw new Error('cache_warm requires tenantId (params or scope)');
      const keys = (p.keys ?? []) as string[];
      return run(() => warmDashboardKeys({ tenantId, keys, dryRun }));
    }
    case 'workers_clear_locks':
      return run(() =>
        workersClearAdvisoryLocks({ dryRun, scope, action: 'clear_locks' })
      );
    case 'workers_restart':
      return run(() =>
        workersRestartSignal({ dryRun, scope, action: 'restart_signal' })
      );
    case 'exports_dlq_retry':
      return run(() =>
        exportsDlqRetry({
          dryRun,
          scope,
          action: 'dlq_retry',
          jobIds: p.jobIds as string[] | undefined,
        })
      );
    case 'exports_csv_only':
      return run(() =>
        exportsCsvOnly({ dryRun, scope, action: 'csv_only' })
      );
    case 'failover_db':
      return run(() =>
        failoverDb({ dryRun, scope, action: 'db_failover' })
      );
    case 'failover_pgbouncer':
      return run(() =>
        failoverPgbouncerBootstrap({ dryRun, scope, action: 'pgbouncer_bootstrap' })
      );
    case 'security_freeze':
      return run(() =>
        freezeTenant({
          tenantId: p.tenantId as string,
          reason: p.reason as string | undefined,
          dryRun,
          scope,
        })
      );
    case 'security_unfreeze':
      return run(() =>
        unfreezeTenant({
          tenantId: p.tenantId as string,
          dryRun,
          scope,
        })
      );
    case 'security_revoke_sessions':
      return run(() =>
        revokeSessions({
          tenantId: p.tenantId as string,
          userId: p.userId as string | undefined,
          dryRun,
          scope,
        })
      );
    case 'security_rotate_jwt':
      return run(() =>
        rotateJWT({
          tenantId: p.tenantId as string | undefined,
          dryRun,
          scope,
        })
      );
    default:
      throw new Error(`Unknown playbook: ${req.playbook}`);
  }
}
