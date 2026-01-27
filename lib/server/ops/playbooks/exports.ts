/**
 * P20 – Playbooks Exports & files
 * DLQ → retry, mode dégradé (csv-only / deny-large).
 */

import { getOpsRedis } from '../redis';
import { appendAudit, ensureDryRun } from '../audit';

export async function retryDeadLetter({ dryRun = true }: { dryRun?: boolean }) {
  ensureDryRun(dryRun);
  const redis = getOpsRedis();
  const dlq = redis ? await redis.lrange('exports:dlq', 0, -1) : [];
  if (!dryRun && redis && dlq.length) {
    for (const job of dlq) {
      await redis.lpush('exports:queue', job);
    }
    await redis.del('exports:dlq');
  }
  await appendAudit({ kind: 'ops:exports-retry', details: { count: dlq.length, dryRun } });
  return { ok: true, retried: dlq.length };
}

export async function degradeExports({
  mode = 'csv-only',
  ttlMin = 30,
  dryRun = true,
}: {
  mode?: 'csv-only' | 'deny-large';
  ttlMin?: number;
  dryRun?: boolean;
}) {
  ensureDryRun(dryRun);
  if (!dryRun) {
    const redis = getOpsRedis();
    if (redis) await redis.setex('exports:degrade', ttlMin * 60, mode);
  }
  await appendAudit({ kind: 'ops:exports-degrade', details: { mode, ttlMin, dryRun } });
  return { ok: true };
}
