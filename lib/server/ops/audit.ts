/**
 * P20 – Ops & Remédiations : audit des actions playbooks
 * Centralise appendAudit(entry) pour tous les playbooks.
 */

export { ensureDryRun, ensureScope } from './guards';

export interface AuditEntry {
  kind: string;
  tenantId?: string;
  userId?: string;
  playbook?: string;
  params?: Record<string, unknown>;
  details?: Record<string, unknown>;
  dryRun?: boolean;
  ok?: boolean;
  error?: string;
}

const log = typeof console !== 'undefined' ? console : { info: () => {}, warn: () => {} };

/**
 * Enregistre une entrée d’audit (non bloquant).
 * À brancher sur table audit_ops ou équivalent si disponible.
 */
export async function appendAudit(entry: AuditEntry): Promise<void> {
  const payload = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  try {
    log.info?.('[Audit Ops]', payload);

    // Optionnel : INSERT dans audit_ops si la table existe
    // const { getOpsDb } = await import('./db');
    // const client = await getOpsDb().connect();
    // await client.query(
    //   `INSERT INTO audit_ops (kind, tenant_id, user_id, playbook, params, details, dry_run, ok, error, created_at)
    //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
    //   [entry.kind, entry.tenantId ?? null, entry.userId ?? null, entry.playbook ?? null,
    //    JSON.stringify(entry.params ?? {}), JSON.stringify(entry.details ?? {}),
    //    entry.dryRun ?? false, entry.ok ?? true, entry.error ?? null]
    // );
    // client.release();
  } catch (e) {
    log.warn?.('[Audit Ops] Failed to append audit:', e);
  }
}
