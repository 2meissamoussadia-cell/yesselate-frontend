// lib/server/finops/guard.ts
// Phase P16: FinOps — contrôle de quotas (Redis + Postgres)

import { getFinopsRedis } from './redis';
import { pgPool } from '@lib-root/server/db/pool';

export interface EnforceQuotaInput {
  tenantId: string;
  scope: string;
  isExport?: boolean;
  estimatedRows?: number;
  estimatedBytes?: number;
}

export type EnforceQuotaResult =
  | { allowed: true }
  | { allowed: false; reason: 'quota_exceeded' | 'backpressure' | 'budget_slo' };

type PolicyRow = {
  period: 'daily' | 'monthly';
  quota_calls: number | null;
  quota_rows: number | null;
  quota_bytes: number | null;
  quota_exports: number | null;
  max_rows_per_call: number | null;
  max_bytes_per_call: number | null;
};

async function getPolicies(tenantId: string, scope: string): Promise<PolicyRow[]> {
  try {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query<PolicyRow>(
        `select period, quota_calls, quota_rows, quota_bytes, quota_exports, max_rows_per_call, max_bytes_per_call
         from finops_policies
         where tenant_id = $1 and scope = $2 and enabled`,
        [tenantId, scope]
      );
      return rows ?? [];
    } finally {
      client.release();
    }
  } catch {
    return [];
  }
}

async function getUsage(
  tenantId: string,
  scope: string,
  period: 'daily' | 'monthly'
): Promise<{ calls: number; rows: number; bytes: number; exports: number }> {
  const r = getFinopsRedis();
  if (!r) return { calls: 0, rows: 0, bytes: 0, exports: 0 };

  const now = new Date();
  const window =
    period === 'daily'
      ? now.toISOString().slice(0, 10)
      : now.toISOString().slice(0, 7);
  const key = `finops:${tenantId}:${scope}:${period}:${window}`;
  const h = await r.hgetall(key);
  return {
    calls: Number(h?.calls ?? 0),
    rows: Number(h?.rows ?? 0),
    bytes: Number(h?.bytes ?? 0),
    exports: Number(h?.exports ?? 0),
  };
}

/**
 * Vérifie les quotas avant d’exécuter le handler.
 * Lit les politiques en Postgres, l’usage en Redis (daily + monthly).
 */
export async function enforceQuota(input: EnforceQuotaInput): Promise<EnforceQuotaResult> {
  const { tenantId, scope, isExport, estimatedRows = 0, estimatedBytes = 0 } = input;

  const policies = await getPolicies(tenantId, scope);
  if (!policies.length) return { allowed: true };

  const daily = await getUsage(tenantId, scope, 'daily');
  const monthly = await getUsage(tenantId, scope, 'monthly');

  for (const pol of policies) {
    const u = pol.period === 'daily' ? daily : monthly;
    if (pol.quota_calls != null && u.calls >= pol.quota_calls) return { allowed: false, reason: 'quota_exceeded' };
    if (pol.quota_rows != null && u.rows + estimatedRows > pol.quota_rows) return { allowed: false, reason: 'quota_exceeded' };
    if (pol.quota_bytes != null && u.bytes + estimatedBytes > pol.quota_bytes) return { allowed: false, reason: 'quota_exceeded' };
    if (isExport && pol.quota_exports != null && u.exports >= pol.quota_exports) return { allowed: false, reason: 'quota_exceeded' };
  }
  if (policies.some((p) => p.max_rows_per_call != null && estimatedRows > p.max_rows_per_call))
    return { allowed: false, reason: 'quota_exceeded' };
  if (policies.some((p) => p.max_bytes_per_call != null && estimatedBytes > p.max_bytes_per_call))
    return { allowed: false, reason: 'quota_exceeded' };

  return { allowed: true };
}

/**
 * Enregistre un refus / dégradation dans finops_denials (audit).
 */
export async function recordDenial(
  tenantId: string,
  scope: string,
  reason: 'quota_exceeded' | 'backpressure' | 'budget_slo',
  details?: Record<string, unknown>
): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query(
      `insert into finops_denials (tenant_id, scope, reason, details)
       values ($1, $2, $3, $4)`,
      [tenantId, scope, reason, details ? JSON.stringify(details) : null]
    );
  } catch (e) {
    console.warn('[FinOps] recordDenial failed:', e);
  } finally {
    client.release();
  }
}
