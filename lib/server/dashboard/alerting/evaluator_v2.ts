// lib/server/dashboard/alerting/evaluator_v2.ts
// Phase P17: Évaluateur v2 — support DSL v2 enrichi

import { pgPool } from '@lib-root/server/db/pool';
import type { AlertDSLv2, Condition, CorrelationCondition, Hysteresis } from './dsl_v2';
import crypto from 'node:crypto';
import { logger } from '@/lib/server/logging';

const log = logger.child({ component: 'evaluator_v2' });

export interface RuleV2 {
  id: string;
  tenant_id: string;
  severity: 'info' | 'warning' | 'critical';
  expr_v2: AlertDSLv2;
  hysteresis?: Hysteresis;
  group_by?: { keys: string[]; topN?: number; orderBy?: 'desc' | 'asc' };
  correlation?: CorrelationCondition[];
  labels?: Record<string, string>;
  cooldown_sec?: number;
  reopen_after_sec?: number;
}

export interface EvaluationContext {
  tenantId: string;
  ruleId: string;
  previousStatus?: 'open' | 'closed'; // pour hystérésis
}

export interface EvaluationResult {
  triggered: boolean;
  fingerprint: string;
  payload: Record<string, any>;
  labels: Record<string, string>;
  evidence: Record<string, any>; // séries, valeurs sources
  groupKey?: string; // clé du group-by si applicable
}

/**
 * Parse une durée (ex: "30d", "1h", "15m") en secondes
 */
function parseDuration(s: string): number {
  const m = /^(\d+)(m|h|d)$/i.exec(s);
  if (!m) return 0;
  const v = Number(m[1]);
  const u = m[2].toLowerCase();
  return u === 'm' ? v * 60 : u === 'h' ? v * 3600 : v * 86400;
}

/**
 * Calcule un percentile d'un tableau trié
 */
function percentile(arr: number[], p: number): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((x, y) => x - y);
  const idx = Math.floor((sorted.length - 1) * p);
  return sorted[idx];
}

/**
 * Calcule une agrégation sur un tableau de valeurs
 */
function computeAggregate(
  values: number[],
  func: 'avg' | 'sum' | 'min' | 'max' | 'p50' | 'p90' | 'p95' | 'p99' | 'count' | 'stddev'
): number {
  if (!values.length) return 0;
  const finite = values.filter(v => Number.isFinite(v));
  if (!finite.length) return 0;

  switch (func) {
    case 'sum':
      return finite.reduce((a, b) => a + b, 0);
    case 'min':
      return Math.min(...finite);
    case 'max':
      return Math.max(...finite);
    case 'p50':
      return percentile(finite, 0.5);
    case 'p90':
      return percentile(finite, 0.9);
    case 'p95':
      return percentile(finite, 0.95);
    case 'p99':
      return percentile(finite, 0.99);
    case 'count':
      return finite.length;
    case 'stddev': {
      const avg = finite.reduce((a, b) => a + b, 0) / finite.length;
      const variance = finite.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / finite.length;
      return Math.sqrt(variance);
    }
    default:
      return finite.reduce((a, b) => a + b, 0) / finite.length;
  }
}

/**
 * Récupère les données depuis la source (view ou query)
 */
async function materializeSeries(
  dsl: AlertDSLv2,
  ctx: EvaluationContext
): Promise<Array<Record<string, any>>> {
  const client = await pgPool.connect();
  try {
    if (dsl.source.type === 'view') {
      const sql = `SELECT * FROM ${dsl.source.view} WHERE tenant_id = $1`;
      const { rows } = await client.query(sql, [ctx.tenantId]);
      return rows;
    } else if (dsl.source.type === 'query') {
      const params = (dsl.source.params ?? []).map(p => {
        if (typeof p === 'string' && p.includes('${tenantId}')) {
          return p.replace(/\$\{tenantId\}/g, ctx.tenantId);
        }
        return p;
      });
      const { rows } = await client.query(dsl.source.query, params);
      return rows;
    }
    return [];
  } finally {
    client.release();
  }
}

/**
 * Applique une fenêtre temporelle et granularité (simplifié : filtre côté JS)
 * TODO: optimiser avec SQL si window.granularity est défini
 */
function applyTimeWindow(
  rows: Array<Record<string, any>>,
  window?: AlertDSLv2['window']
): Array<Record<string, any>> {
  if (!window) return rows;
  const rangeSec = parseDuration(window.range);
  const cutoff = new Date(Date.now() - rangeSec * 1000);
  // Simplifié : on suppose qu'il y a une colonne timestamp/date
  // En production, adapter selon le schéma réel
  return rows.filter(r => {
    const ts = r.timestamp || r.date || r.created_at || r.updated_at;
    if (!ts) return true; // pas de filtre si pas de timestamp
    const rowDate = ts instanceof Date ? ts : new Date(ts);
    return rowDate >= cutoff;
  });
}

/**
 * Groupe les lignes par clés (group-by)
 */
function bucketize(rows: Array<Record<string, any>>, keys: string[]): Record<string, Array<Record<string, any>>> {
  const out: Record<string, Array<Record<string, any>>> = {};
  for (const r of rows) {
    const k = keys.map(key => String(r[key] ?? '')).join('|');
    if (!out[k]) out[k] = [];
    out[k].push(r);
  }
  return out;
}

/**
 * Évalue une condition booléenne (all/any/not + comparateurs)
 */
function evalCondition(cond: Condition, ctx: Record<string, number>): boolean {
  if (!cond) return false;

  // OR (any)
  if ('any' in cond && Array.isArray(cond.any)) {
    return cond.any.some(c => evalCondition(c, ctx));
  }

  // AND (all)
  if ('all' in cond && Array.isArray(cond.all)) {
    return cond.all.every(c => evalCondition(c, ctx));
  }

  // NOT
  if ('not' in cond && cond.not !== undefined) {
    return !evalCondition(cond.not, ctx);
  }

  // Comparateur simple (SimpleCondition)
  if (!('op' in cond && 'left' in cond && 'right' in cond)) {
    return false;
  }
  const left = cond.left === 'metric' ? ctx.metric : ctx[String(cond.left)] ?? Number(cond.left);
  const right = cond.right === 'metric'
    ? ctx.metric
    : Array.isArray(cond.right)
      ? 0
      : ctx[String(cond.right)] ?? Number(cond.right);

  switch (cond.op) {
    case '>':
      return Number(left) > Number(right);
    case '>=':
      return Number(left) >= Number(right);
    case '<':
      return Number(left) < Number(right);
    case '<=':
      return Number(left) <= Number(right);
    case '=':
      return String(left) === String(right);
    case '!=':
      return String(left) !== String(right);
    case 'in':
      return Array.isArray(cond.right) && cond.right.includes(Number(left));
    case 'not_in':
      return Array.isArray(cond.right) && !cond.right.includes(Number(left));
    default:
      return false;
  }
}

/**
 * Évalue les corrélations inter-KPIs
 */
async function evalCorrelations(
  correlations: CorrelationCondition[],
  rows: Array<Record<string, any>>,
  ctx: EvaluationContext
): Promise<boolean> {
  if (!correlations || correlations.length === 0) return true;

  // Pour chaque condition de corrélation, vérifier si elle est satisfaite
  for (const corr of correlations) {
    const values = rows.map(r => Number(r[corr.metric] ?? 0)).filter(v => Number.isFinite(v));
    if (!values.length) {
      // Si la métrique n'existe pas, on considère que la corrélation échoue (AND strict)
      return false;
    }

    let value: number;
    if (corr.compare === 'n-1') {
      // Comparaison avec période précédente (simplifié : on prend la moyenne actuelle)
      value = values.reduce((a, b) => a + b, 0) / values.length;
      // TODO: récupérer valeur N-1 depuis historique ou calculer delta
      if (corr.delta_pct !== undefined) {
        // Appliquer delta en pourcentage
        const delta = value * (1 + corr.delta_pct);
        value = delta;
      }
    } else if (corr.compare === 'baseline') {
      // Comparaison avec baseline (moyenne mobile, etc.)
      value = values.reduce((a, b) => a + b, 0) / values.length;
      // TODO: calculer baseline depuis historique (90d, etc.)
    } else {
      // Comparaison absolue : prendre la première valeur ou moyenne
      value = values.length > 0 ? values[0] : 0;
    }

    const threshold = Number(corr.value);
    let passed = false;

    switch (corr.op) {
      case '>':
        passed = value > threshold;
        break;
      case '>=':
        passed = value >= threshold;
        break;
      case '<':
        passed = value < threshold;
        break;
      case '<=':
        passed = value <= threshold;
        break;
      case '=':
        passed = value === threshold;
        break;
      case '!=':
        passed = value !== threshold;
        break;
    }

    if (!passed) return false; // AND entre corrélations
  }

  return true;
}

/**
 * Applique l'hystérésis (anti-flapping)
 */
function applyHysteresis(
  prevOpen: boolean,
  hysteresis: Hysteresis | undefined,
  metric: number
): boolean {
  if (!hysteresis) return true; // pas d'hystérésis = toujours déclencher si condition vraie

  if (prevOpen) {
    // Condition de sortie : on reste ouvert si on ne passe pas le seuil de sortie
    const exit = hysteresis.exit || {};
    if (exit['<='] !== undefined) return !(metric <= exit['<=']);
    if (exit['<'] !== undefined) return !(metric < exit['<']);
    if (exit['>='] !== undefined) return !(metric >= exit['>=']);
    if (exit['>'] !== undefined) return !(metric > exit['>']);
    return true; // reste ouvert par défaut
  } else {
    // Condition d'entrée
    const enter = hysteresis.enter || {};
    if (enter['>='] !== undefined) return metric >= enter['>='];
    if (enter['>'] !== undefined) return metric > enter['>'];
    if (enter['<='] !== undefined) return metric <= enter['<='];
    if (enter['<'] !== undefined) return metric < enter['<'];
    return false; // ne déclenche pas par défaut
  }
}

/**
 * Calcule le fingerprint pour dé-duplication
 */
function computeFingerprint(ruleId: string, groupKey: string, labels?: Record<string, string>): string {
  const data = { rule: ruleId, group: groupKey, labels: labels || {} };
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Récupère le statut précédent d'un incident (pour hystérésis)
 */
async function getPreviousStatus(
  tenantId: string,
  ruleId: string,
  fingerprint: string
): Promise<'open' | 'closed' | null> {
  const client = await pgPool.connect();
  try {
    const { rows } = await client.query<{ status: 'open' | 'ack' | 'closed' }>(
      `SELECT status FROM alert_events
       WHERE tenant_id = $1 AND rule_id = $2 AND fingerprint = $3
       ORDER BY last_seen DESC LIMIT 1`,
      [tenantId, ruleId, fingerprint]
    );
    if (rows[0]) {
      return rows[0].status === 'open' ? 'open' : 'closed';
    }
    return null;
  } finally {
    client.release();
  }
}

/**
 * Évalue une règle v2 et retourne les incidents détectés
 */
export async function evaluateRuleV2(
  rule: RuleV2,
  ctx: EvaluationContext
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];

  try {
    // 1. Récupérer les données depuis la source
    let rows = await materializeSeries(rule.expr_v2, ctx);

    // 2. Appliquer fenêtre temporelle si définie
    rows = applyTimeWindow(rows, rule.expr_v2.window);

    // 3. Group-by si défini
    const groups = rule.group_by?.keys?.length
      ? bucketize(rows, rule.group_by.keys)
      : { __global__: rows };

    // 4. Limiter aux topN si défini
    let groupEntries = Object.entries(groups);
    if (rule.group_by?.topN) {
      // Trier par valeur décroissante (simplifié : on prend les N premiers groupes)
      groupEntries = groupEntries.slice(0, rule.group_by.topN);
    }

    // 5. Évaluer chaque groupe
    for (const [groupKey, groupRows] of groupEntries) {
      if (!groupRows.length) continue;

      // 6. Calculer agrégation
      const metricName = rule.expr_v2.aggregate?.metric || 'value';
      const values = groupRows.map(r => Number(r[metricName] ?? 0)).filter(v => Number.isFinite(v));
      if (!values.length) continue;

      const aggFunc = rule.expr_v2.aggregate?.func || 'avg';
      const metricValue = computeAggregate(values, aggFunc);

      // 7. Construire contexte pour évaluation
      const evalCtx: Record<string, number> = { metric: metricValue };
      const sample = groupRows[0] || {};
      Object.keys(sample).forEach(k => {
        if (typeof sample[k] === 'number') evalCtx[k] = sample[k];
      });

      // 8. Évaluer condition principale
      const conditionPassed = evalCondition(rule.expr_v2.condition, evalCtx);

      // 9. Évaluer corrélations si définies
      const correlationsPassed = rule.correlation && rule.correlation.length > 0
        ? await evalCorrelations(rule.correlation, groupRows, ctx)
        : true;

      // 10. Appliquer hystérésis
      const fingerprint = computeFingerprint(rule.id, groupKey, rule.labels);
      const prevStatus = await getPreviousStatus(ctx.tenantId, rule.id, fingerprint);
      const hysteresisPassed = applyHysteresis(
        prevStatus === 'open',
        rule.hysteresis,
        metricValue
      );

      // 11. Déclencher si toutes les conditions sont remplies
      if (conditionPassed && correlationsPassed && hysteresisPassed) {
        const labels = { ...rule.labels };
        if (groupKey !== '__global__' && rule.group_by?.keys) {
          const groupParts = groupKey.split('|');
          rule.group_by.keys.forEach((key, idx) => {
            labels[key] = groupParts[idx] || '';
          });
        }

        results.push({
          triggered: true,
          fingerprint,
          payload: {
            metric: metricValue,
            metricName,
            group: groupKey,
            values: evalCtx,
            condition: rule.expr_v2.condition,
            correlation: rule.correlation,
          },
          labels,
          evidence: {
            rows: groupRows.slice(0, 100), // limiter pour éviter payload trop gros
            aggregate: { func: aggFunc, value: metricValue },
            window: rule.expr_v2.window,
            timestamp: new Date().toISOString(),
          },
          groupKey,
        });
      }
    }
  } catch (error) {
    log.error({ err: error, ruleId: rule.id, tenantId: ctx.tenantId }, 'Error evaluating rule v2');
  }

  return results;
}
