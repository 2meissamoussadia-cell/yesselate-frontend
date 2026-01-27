// lib/server/dashboard/alerting/worker.ts
// Phase P15: Moteur d'alertes - Worker d'évaluation

import { pgPool } from '@lib-root/server/db/pool';
import { AlertRule } from './types';
import { processRule } from './processor';
import { evaluateRuleV2, type RuleV2 } from './evaluator_v2';
import { processEvaluationResults } from './processor_v2';
import { logger } from '@/lib/server/logging';

/**
 * Évalue toutes les règles d'alerte actives pour un tenant
 * Phase P15: Moteur d'alertes
 * Phase P17: Support règles v2 (expr_v2)
 */
export async function evaluateAllRules(tenantId: string): Promise<void> {
  const client = await pgPool.connect();
  try {
    // Règles v1 (expr)
    const rulesV1 = await client.query<AlertRule>(
      `SELECT * FROM alert_rules
       WHERE tenant_id = $1 AND enabled = true AND expr IS NOT NULL AND expr_v2 IS NULL`,
      [tenantId]
    );
    
    for (const rule of rulesV1.rows) {
      try {
        await processRule(mapRowToRule(rule));
      } catch (error) {
        logger.error({ err: error, ruleId: rule.id }, 'Error processing rule v1');
      }
    }

    // Règles v2 (expr_v2)
    const rulesV2 = await client.query<any>(
      `SELECT id, tenant_id, name, description, severity, enabled, route_key, labels,
              expr_v2, hysteresis, group_by, correlation,
              cooldown_sec, reopen_after_sec, schedule, default_channels
       FROM alert_rules
       WHERE tenant_id = $1 AND enabled = true AND expr_v2 IS NOT NULL`,
      [tenantId]
    );

    for (const row of rulesV2.rows) {
      try {
        const ruleV2: RuleV2 = {
          id: row.id,
          tenant_id: row.tenant_id,
          severity: row.severity,
          expr_v2: row.expr_v2,
          hysteresis: row.hysteresis,
          group_by: row.group_by,
          correlation: row.correlation,
          labels: row.labels,
          cooldown_sec: row.cooldown_sec,
          reopen_after_sec: row.reopen_after_sec,
        };

        const results = await evaluateRuleV2(ruleV2, {
          tenantId: row.tenant_id,
          ruleId: row.id,
        });

        await processEvaluationResults(ruleV2, results, row.tenant_id);
      } catch (error) {
        logger.error({ err: error, ruleId: row.id }, 'Error processing rule v2');
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Évalue les règles liées à une MView spécifique
 * Phase P15: Moteur d'alertes
 * Phase P17: Support règles v2 (expr_v2)
 * 
 * Appelé après le refresh d'une MView pour évaluer les règles qui en dépendent
 */
export async function evaluateRulesForMView(tenantId: string, mviewName: string): Promise<void> {
  const client = await pgPool.connect();
  try {
    // Règles v1 (expr)
    const rulesV1 = await client.query<AlertRule>(
      `SELECT * FROM alert_rules
       WHERE tenant_id = $1 
         AND enabled = true
         AND expr IS NOT NULL
         AND expr_v2 IS NULL
         AND (expr->'source'->>'view' = $2 OR expr->>'source' = $2)`,
      [tenantId, mviewName]
    );
    
    for (const rule of rulesV1.rows) {
      try {
        await processRule(mapRowToRule(rule));
      } catch (error) {
        logger.error({ err: error, ruleId: rule.id, mview: mviewName }, 'Error processing rule v1 for MView');
      }
    }

    // Règles v2 (expr_v2)
    const rulesV2 = await client.query<any>(
      `SELECT id, tenant_id, name, description, severity, enabled, route_key, labels,
              expr_v2, hysteresis, group_by, correlation,
              cooldown_sec, reopen_after_sec, schedule, default_channels
       FROM alert_rules
       WHERE tenant_id = $1 
         AND enabled = true
         AND expr_v2 IS NOT NULL
         AND expr_v2->'source'->>'view' = $2`,
      [tenantId, mviewName]
    );

    for (const row of rulesV2.rows) {
      try {
        const ruleV2: RuleV2 = {
          id: row.id,
          tenant_id: row.tenant_id,
          severity: row.severity,
          expr_v2: row.expr_v2,
          hysteresis: row.hysteresis,
          group_by: row.group_by,
          correlation: row.correlation,
          labels: row.labels,
          cooldown_sec: row.cooldown_sec,
          reopen_after_sec: row.reopen_after_sec,
        };

        const results = await evaluateRuleV2(ruleV2, {
          tenantId: row.tenant_id,
          ruleId: row.id,
        });

        await processEvaluationResults(ruleV2, results, row.tenant_id);
      } catch (error) {
        logger.error({ err: error, ruleId: row.id, mview: mviewName }, 'Error processing rule v2 for MView');
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Mappe une row DB vers un AlertRule
 * Phase P15: Moteur d'alertes
 */
function mapRowToRule(row: any): AlertRule {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    severity: row.severity,
    enabled: row.enabled,
    routeKey: row.route_key,
    labels: row.labels,
    expr: row.expr,
    cooldownSec: row.cooldown_sec,
    reopenAfterSec: row.reopen_after_sec,
    schedule: row.schedule,
    defaultChannels: row.default_channels,
  };
}
