// lib/server/finops/meter.ts
// Phase P16: FinOps — mesure (compteurs Redis)

import { getFinopsRedis } from './redis';

function win(period: 'daily' | 'monthly'): string {
  const d = new Date();
  if (period === 'daily') return d.toISOString().slice(0, 10); // YYYY-MM-DD
  return d.toISOString().slice(0, 7); // YYYY-MM
}

export interface RecordUsageInput {
  tenantId: string;
  scope: string;
  rows?: number;
  bytes?: number;
  exports?: number;
}

/**
 * Enregistre un usage FinOps dans Redis (compteurs daily + monthly).
 * No-op si Redis indisponible.
 */
export async function recordUsage(input: RecordUsageInput): Promise<void> {
  const r = getFinopsRedis();
  if (!r) return;

  const { tenantId, scope, rows = 0, bytes = 0, exports = 0 } = input;
  const dailyKey = `finops:${tenantId}:${scope}:daily:${win('daily')}`;
  const monthlyKey = `finops:${tenantId}:${scope}:monthly:${win('monthly')}`;

  try {
    await Promise.all([
      r.hincrby(dailyKey, 'calls', 1),
      r.hincrby(dailyKey, 'rows', rows),
      r.hincrby(dailyKey, 'bytes', bytes),
      r.hincrby(dailyKey, 'exports', exports),
      r.expire(dailyKey, 3 * 24 * 3600),

      r.hincrby(monthlyKey, 'calls', 1),
      r.hincrby(monthlyKey, 'rows', rows),
      r.hincrby(monthlyKey, 'bytes', bytes),
      r.hincrby(monthlyKey, 'exports', exports),
      r.expire(monthlyKey, 60 * 24 * 3600),
    ]);
  } catch (e) {
    console.warn('[FinOps] recordUsage failed:', e);
  }
}
