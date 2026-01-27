/**
 * Calculateur de capacité (pods & DB IOPS)
 * P19 – Bench & Capacity Planning
 *
 * Règle pratique : à la cible, viser 70 % des capacités (30 % marge).
 * Ex. : dbIopsMax = 0.7 × IOPS max du cluster ; rpsPerPod issu de baseline.
 */

export type Inputs = {
  /** Cible RPS sur /api/dashboard (ex. 120) */
  targetRpsDashboard: number;
  /** P95 latence visée (ms, ex. 400) */
  p95msDashboard: number;
  /** RPS par pod à P95 ok (mesure baseline, ex. 35) */
  rpsPerPod: number;
  /** IO moyens par requête dashboard (ex. 4) */
  dbIopsPerReq: number;
  /** IOPS max budget (70 % du cluster) */
  dbIopsMax: number;
};

export type PlanResult = {
  podsNeeded: number;
  concurrency: number;
  dbIops: number;
  dbOk: boolean;
};

/**
 * Calcule pods nécessaires, concurrence (Little), DB IOPS et respect du budget.
 *
 * @example
 * plan({ targetRpsDashboard: 120, p95msDashboard: 400, rpsPerPod: 35, dbIopsPerReq: 4, dbIopsMax: 1000 })
 */
export function plan(i: Inputs): PlanResult {
  const podsNeeded = Math.ceil(i.targetRpsDashboard / i.rpsPerPod);
  const concurrency = (i.targetRpsDashboard * i.p95msDashboard) / 1000.0;
  const dbIops = i.targetRpsDashboard * i.dbIopsPerReq;
  const dbOk = dbIops <= i.dbIopsMax;
  return { podsNeeded, concurrency, dbIops, dbOk };
}
