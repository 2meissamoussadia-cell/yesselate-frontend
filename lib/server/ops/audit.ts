/**
 * P20 – Ops & Remédiations : audit des actions playbooks
 * Garde-fous communs à tous les playbooks.
 * Persiste dans finops_denials (scope=kind, reason=ops_action).
 */

export { ensureDryRun, ensureScope } from './guards';

import { pgPool } from '../db/pool';

export interface AuditEntry {
  kind: string;
  tenantId?: string;
  details?: Record<string, unknown>;
}

const log = typeof console !== 'undefined' ? console : { warn: () => {} };

/**
 * Enregistre une entrée d’audit dans finops_denials.
 * Non bloquant : en cas d’erreur (ex. tenant_id NULL, table absente), log et continue.
 */
export async function appendAudit(entry: AuditEntry): Promise<void> {
  const c = await pgPool.connect();
  try {
    await c.query(
      `insert into finops_denials(tenant_id, scope, reason, details) values($1,$2,$3,$4)`,
      [
        entry.tenantId ?? null,
        entry.kind,
        'ops_action',
        JSON.stringify(entry.details ?? {}),
      ]
    );
  } catch (e) {
    log.warn?.('[Audit Ops] appendAudit failed:', e);
  } finally {
    c.release();
  }
}
