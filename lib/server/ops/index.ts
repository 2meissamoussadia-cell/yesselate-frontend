/**
 * P20 – Ops & Remédiations
 * Catalogue playbooks, audit, guards, db, redis.
 */

export { appendAudit, type AuditEntry } from './audit';
export { ensureDryRun, ensureScope, blastRadiusLabel, requireApproval, type OpsScope, type GuardsInput } from './guards';
export { getOpsPool, withOpsClient, closeOpsPool } from './db';
export { getOpsRedis, purgeKeys, warmKeys, closeOpsRedis } from './redis';

export { refreshMViews, backfillReadModels } from './playbooks/mviews';
export { vacuumAnalyze, reindexConcurrently } from './playbooks/db_hygiene';
export { purgeCachePrefix, warmDashboardKeys } from './playbooks/cache';
export { workersClearAdvisoryLocks, workersRestartSignal } from './playbooks/workers';
export { exportsDlqRetry, exportsCsvOnly } from './playbooks/exports';
export { freezeTenant, unfreezeTenant, revokeSessions, rotateJWT, isTenantFrozen } from './playbooks/security';
export { failoverDb, failoverPgbouncerBootstrap } from './playbooks/failover';
export { executeRunbook, type PlaybookName, type RunbookRequest } from './runbook';
