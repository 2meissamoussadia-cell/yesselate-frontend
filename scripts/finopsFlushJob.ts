#!/usr/bin/env node
/**
 * Job de flush FinOps : Redis → Postgres
 * Phase P16: FinOps & Cost Guardrails
 *
 * Usage:
 *   npx tsx scripts/finopsFlushJob.ts
 *   DATABASE_URL=... REDIS_URL=... npx tsx scripts/finopsFlushJob.ts
 *
 * CRON (horaire):
 *   0 * * * * cd /path/to/project && npx tsx scripts/finopsFlushJob.ts >> /var/log/finops_flush.log 2>&1
 */

import 'dotenv/config';
import Redis from 'ioredis';
import { Pool } from 'pg';

const REDIS_URL = process.env.REDIS_URL;
const DATABASE_URL = process.env.DATABASE_URL;
const prefix = 'finops';

function parseKey(key: string, period: 'daily' | 'monthly'): { tenantId: string; scope: string; window: string } | null {
  const parts = key.split(':');
  if (parts.length < 5) return null;
  // format: finops:tenantId:scope:period:window — scope may contain ':'
  const tenantId = parts[1];
  const window = parts[parts.length - 1];
  const scope = parts.slice(2, -2).join(':');
  return { tenantId, scope, window };
}

async function flush(redis: Redis, pool: Pool, period: 'daily' | 'monthly'): Promise<void> {
  const keys = await redis.keys(`${prefix}:*:*:${period}:*`);
  if (!keys.length) return;

  const client = await pool.connect();
  try {
    for (const k of keys) {
      const parsed = parseKey(k, period);
      if (!parsed) continue;
      const { tenantId, scope, window } = parsed;
      const h = await redis.hgetall(k);
      const calls = Number(h?.calls ?? 0);
      const rows = Number(h?.rows ?? 0);
      const bytes = Number(h?.bytes ?? 0);
      const exports = Number(h?.exports ?? 0);
      const windowStart = period === 'daily' ? window : `${window}-01`;

      await client.query(
        `insert into finops_usage (tenant_id, scope, period, window_start, calls, rows, bytes, exports)
         values ($1, $2, $3, $4::date, $5, $6, $7, $8)
         on conflict (tenant_id, scope, period, window_start)
         do update set
           calls   = finops_usage.calls   + excluded.calls,
           rows    = finops_usage.rows    + excluded.rows,
           bytes   = finops_usage.bytes   + excluded.bytes,
           exports = finops_usage.exports + excluded.exports`,
        [tenantId, scope, period, windowStart, calls, rows, bytes, exports]
      );
      await redis.del(k);
    }
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  if (!REDIS_URL || !DATABASE_URL) {
    console.error('[FinOps] REDIS_URL and DATABASE_URL required');
    process.exit(1);
  }

  const redis = new Redis(REDIS_URL);
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    await flush(redis, pool, 'daily');
    await flush(redis, pool, 'monthly');
    console.info('[FinOps] Flushed usage to Postgres');
    process.exit(0);
  } catch (e) {
    console.error('[FinOps] Flush failed:', e);
    process.exit(1);
  } finally {
    await redis.quit();
    await pool.end();
  }
}

main();
