// lib/server/finops/backpressure.ts
// Phase P16: Back-pressure & dégradation contrôlée (signal /api/internal/health)

import { pgPool } from '@lib-root/server/db/pool';

export type BackpressureMode = 'normal' | 'conservative' | 'severe';

export interface BackpressureInput {
  replayLagSec?: number;
  cpuLoad?: number;
}

/**
 * Règles simples : >300s → "sévère" ; >60s → "conservateur" ; sinon "normal".
 * S'appuie sur db.role + replay lag exposés par /api/internal/health (P13).
 */
export function decideBackpressure(input: BackpressureInput): BackpressureMode {
  const { replayLagSec = 0, cpuLoad } = input;
  if (replayLagSec > 300) return 'severe';
  if (replayLagSec > 60) return 'conservative';
  // Optionnel : seuil CPU si exposé plus tard
  if (typeof cpuLoad === 'number' && cpuLoad > 0.9) return 'conservative';
  return 'normal';
}

export interface BackpressureSignal {
  replayLagSec: number;
  dbRole: 'primary' | 'standby';
}

/**
 * Récupère le signal DB (replay lag, rôle) pour décider du back-pressure.
 * Fail-open : en cas d'erreur, retourne { replayLagSec: 0, dbRole: 'primary' } → normal.
 */
export async function getBackpressureSignal(): Promise<BackpressureSignal> {
  try {
    const client = await pgPool.connect();
    try {
      const roleRes = await client.query<{ standby: boolean }>(
        `select pg_is_in_recovery() as standby`
      );
      const isStandby = !!roleRes.rows[0]?.standby;
      const dbRole = isStandby ? 'standby' : 'primary';

      let replayLagSec = 0;
      if (isStandby) {
        const lagRes = await client.query<{ lag_sec: number | null }>(`
          select extract(epoch from now() - pg_last_xact_replay_timestamp())::int as lag_sec
        `);
        replayLagSec = Math.max(0, Number(lagRes.rows[0]?.lag_sec ?? 0));
      }

      return { replayLagSec, dbRole };
    } finally {
      client.release();
    }
  } catch {
    return { replayLagSec: 0, dbRole: 'primary' };
  }
}
