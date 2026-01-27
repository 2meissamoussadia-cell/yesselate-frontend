// lib/server/dashboard/alerting/evaluator.ts
// Phase P15: Moteur d'alertes - Évaluateur de règles

import { pgPool } from '@/lib/server/db/pool';
import { AlertRule, AlertExpression } from './types';
import crypto from 'node:crypto';
import { logger } from '@/lib/server/logging';

/**
 * Évalue une règle d'alerte et retourne les incidents détectés
 * Phase P15: Moteur d'alertes
 */
export async function evaluateRule(rule: AlertRule, tenantId: string): Promise<Array<{
  fingerprint: string;
  payload: Record<string, any>;
  labels: Record<string, any>;
}>> {
  const client = await pgPool.connect();
  try {
    const expr = rule.expr;
    
    // Construire la requête SQL depuis l'expression
    const query = buildQuery(expr, tenantId);
    
    // Exécuter la requête
    const result = await client.query(query.sql, query.params);
    
    // Vérifier la condition
    const incidents: Array<{
      fingerprint: string;
      payload: Record<string, any>;
      labels: Record<string, any>;
    }> = [];
    
    for (const row of result.rows) {
      // Récupérer la valeur de la métrique
      const metricName = expr.select.metric;
      const value = row[metricName];
      
      // Récupérer la valeur de droite de la condition
      const rightValue = expr.condition.right;
      
      // Déterminer la valeur de gauche (métrique ou colonne)
      let leftValue: any;
      if (expr.condition.left === 'metric') {
        leftValue = value;
      } else {
        leftValue = row[expr.condition.left];
      }
      
      let triggered = false;
      
      switch (expr.condition.op) {
        case '>':
          triggered = Number(leftValue) > Number(rightValue);
          break;
        case '>=':
          triggered = Number(leftValue) >= Number(rightValue);
          break;
        case '<':
          triggered = Number(leftValue) < Number(rightValue);
          break;
        case '<=':
          triggered = Number(leftValue) <= Number(rightValue);
          break;
        case '=':
          triggered = String(leftValue) === String(rightValue);
          break;
        case '!=':
          triggered = String(leftValue) !== String(rightValue);
          break;
      }
      
      if (triggered) {
        // Calculer fingerprint pour dé-duplication
        const labels = expr.groupBy
          ? Object.fromEntries(expr.groupBy.map(field => [field, row[field]]))
          : {};
        
        const fingerprint = computeFingerprint(rule.id, labels);
        
        incidents.push({
          fingerprint,
          payload: {
            value: leftValue,
            threshold: rightValue,
            condition: expr.condition,
            metric: metricName,
            ...row,
          },
          labels: {
            ...rule.labels,
            ...labels,
          },
        });
      }
    }
    
    return incidents;
  } finally {
    client.release();
  }
}

/**
 * Construit une requête SQL depuis une expression d'alerte
 * Phase P15: Moteur d'alertes
 * 
 * Supporte deux formats :
 * 1. source.view : Construit SELECT ... FROM view WHERE ...
 * 2. source.query : Utilise la requête SQL directe
 */
function buildQuery(expr: AlertExpression, tenantId: string): { sql: string; params: any[] } {
  const params: any[] = [];
  
  // Format 2 : Requête SQL directe
  if (expr.source.query) {
    let query = expr.source.query.trim();
    const queryParams: any[] = [];
    
    // Remplacer les params ${tenantId} par $1, $2, etc.
    if (expr.source.params) {
      expr.source.params.forEach((param, idx) => {
        const paramIdx = idx + 1;
        if (param === '${tenantId}') {
          queryParams.push(tenantId);
          // Remplacer ${tenantId} par $1, $2, etc.
          query = query.replace(/\$\{tenantId\}/g, `$${paramIdx}`);
        } else {
          queryParams.push(param);
          // Remplacer le placeholder par $N
          const placeholder = param.startsWith('${') ? param : `$${paramIdx}`;
          query = query.replace(new RegExp(`\\$\\{${param.replace(/[${}]/g, '')}\\}`, 'g'), `$${paramIdx}`);
        }
      });
    } else {
      // Si pas de params explicites mais ${tenantId} dans la query, le remplacer
      query = query.replace(/\$\{tenantId\}/g, `'${tenantId}'`);
    }
    
    // Wrapper la query dans une sous-requête pour sélectionner la métrique
    const metricName = expr.select.metric;
    let wrappedQuery = `SELECT ${metricName} AS ${metricName}`;
    
    if (expr.groupBy && expr.groupBy.length > 0) {
      wrappedQuery += `, ${expr.groupBy.join(', ')}`;
    }
    
    wrappedQuery += ` FROM (${query}) AS subquery`;
    
    return { sql: wrappedQuery, params: queryParams };
  }
  
  // Format 1 : MView avec select/where/condition
  if (expr.source.view) {
    const metricName = expr.select.metric;
    let sql = `SELECT ${metricName}`;
    
    // GROUP BY fields
    if (expr.groupBy && expr.groupBy.length > 0) {
      sql += `, ${expr.groupBy.join(', ')}`;
    }
    
    // FROM clause
    sql += ` FROM ${expr.source.view}`;
    
    // WHERE clause
    const whereConditions: string[] = [];
    
    // Ajouter tenant_id par défaut
    params.push(tenantId);
    whereConditions.push(`tenant_id = $${params.length}`);
    
    // Ajouter les filtres WHERE
    if (expr.where) {
      expr.where.forEach((filter) => {
        const paramIdx = params.length + 1;
        
        // Remplacer ${tenantId} par la valeur réelle
        let filterValue = filter.val;
        if (typeof filterValue === 'string' && filterValue === '${tenantId}') {
          filterValue = tenantId;
        }
        
        params.push(filterValue);
        
        let condition = '';
        switch (filter.op) {
          case '=':
            condition = `${filter.col} = $${paramIdx}`;
            break;
          case '!=':
            condition = `${filter.col} != $${paramIdx}`;
            break;
          case '>':
            condition = `${filter.col} > $${paramIdx}`;
            break;
          case '>=':
            condition = `${filter.col} >= $${paramIdx}`;
            break;
          case '<':
            condition = `${filter.col} < $${paramIdx}`;
            break;
          case '<=':
            condition = `${filter.col} <= $${paramIdx}`;
            break;
          case 'IN':
            condition = `${filter.col} = ANY($${paramIdx})`;
            break;
          case 'LIKE':
            condition = `${filter.col} LIKE $${paramIdx}`;
            break;
          case 'ILIKE':
            condition = `${filter.col} ILIKE $${paramIdx}`;
            break;
        }
        
        whereConditions.push(condition);
      });
    }
    
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // GROUP BY clause
    if (expr.groupBy && expr.groupBy.length > 0) {
      sql += ` GROUP BY ${expr.groupBy.join(', ')}`;
    }
    
    return { sql, params };
  }
  
  throw new Error('Invalid expression: source must have either "view" or "query"');
}

/**
 * Calcule le fingerprint pour dé-duplication
 * Phase P15: Moteur d'alertes
 */
function computeFingerprint(ruleId: string, labels: Record<string, any>): string {
  const data = `${ruleId}::${JSON.stringify(labels)}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Vérifie si une alerte est en cooldown
 * Phase P15: Moteur d'alertes
 */
export async function isInCooldown(
  tenantId: string,
  ruleId: string,
  fingerprint: string,
  cooldownSec: number
): Promise<boolean> {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      `SELECT last_seen FROM alert_events
       WHERE tenant_id = $1 AND rule_id = $2 AND fingerprint = $3 AND status = 'open'
       ORDER BY last_seen DESC LIMIT 1`,
      [tenantId, ruleId, fingerprint]
    );
    
    if (result.rows.length === 0) return false;
    
    const lastSeen = new Date(result.rows[0].last_seen);
    const now = new Date();
    const diffSec = (now.getTime() - lastSeen.getTime()) / 1000;
    
    return diffSec < cooldownSec;
  } finally {
    client.release();
  }
}

/**
 * Vérifie si une alerte est silencée (schedule ou silence ad-hoc)
 * Phase P15: Moteur d'alertes
 */
export async function isSilenced(
  tenantId: string,
  ruleId: string,
  labels: Record<string, any>
): Promise<boolean> {
  const client = await pgPool.connect();
  try {
    // Vérifier silences ad-hoc
    const silenceResult = await client.query(
      `SELECT id FROM alert_silences
       WHERE tenant_id = $1
         AND (rule_id = $2 OR rule_id IS NULL)
         AND starts_at <= NOW()
         AND ends_at > NOW()
         AND (matcher IS NULL OR matcher @> $3::jsonb)`,
      [tenantId, ruleId, JSON.stringify(labels)]
    );
    
    if (silenceResult.rows.length > 0) {
      return true;
    }
    
    // Vérifier schedule (calendrier programmé)
    // TODO: Implémenter vérification du schedule si présent
    
    return false;
  } finally {
    client.release();
  }
}
