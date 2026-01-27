// lib/server/dashboard/alerting/processor.ts
// Phase P15: Moteur d'alertes - Processeur principal

import { pgPool } from '@/lib/server/db/pool';
import { AlertRule, AlertEvent } from './types';
import { evaluateRule, isInCooldown, isSilenced } from './evaluator';
import { sendNotifications } from './channels';
import { logger } from '@/lib/server/logging';

/**
 * Traite une règle d'alerte : évalue, crée/met à jour les incidents, envoie notifications
 * Phase P15: Moteur d'alertes
 */
export async function processRule(rule: AlertRule): Promise<void> {
  const log = logger.child({ ruleId: rule.id, tenantId: rule.tenantId });
  
  if (!rule.enabled) {
    log.debug('Rule disabled, skipping');
    return;
  }
  
  try {
    // Évaluer la règle
    const incidents = await evaluateRule(rule, rule.tenantId);
    
    if (incidents.length === 0) {
      log.debug('No incidents detected');
      
      // Vérifier si des alertes ouvertes doivent être fermées (reopen_after_sec)
      await checkAndCloseStaleAlerts(rule);
      return;
    }
  
    log.info({ count: incidents.length }, 'Incidents detected');
    
    // Traiter chaque incident
    for (const incident of incidents) {
      // Vérifier cooldown
      if (await isInCooldown(rule.tenantId, rule.id, incident.fingerprint, rule.cooldownSec)) {
        log.debug({ fingerprint: incident.fingerprint }, 'Incident in cooldown, skipping');
        continue;
      }
      
      // Vérifier silences
      if (await isSilenced(rule.tenantId, rule.id, incident.labels)) {
        log.debug({ fingerprint: incident.fingerprint }, 'Incident silenced, skipping');
        continue;
      }
      
      // Créer ou mettre à jour l'événement
      const event = await upsertAlertEvent(rule, incident);
      
      // Envoyer notifications si nouvel événement ou ré-ouverture
      if (event.count === 1 || (event.status === 'open' && event.count > 1)) {
        await sendNotifications(rule, event, incident);
      }
    }
  } catch (error) {
    log.error({ err: error }, 'Error processing rule');
    throw error;
  }
}

/**
 * Crée ou met à jour un événement d'alerte
 * Phase P15: Moteur d'alertes
 */
async function upsertAlertEvent(
  rule: AlertRule,
  incident: { fingerprint: string; payload: Record<string, any>; labels: Record<string, any> }
): Promise<AlertEvent> {
  const client = await pgPool.connect();
  try {
    // Vérifier si l'événement existe déjà
    const existing = await client.query(
      `SELECT * FROM alert_events
       WHERE tenant_id = $1 AND rule_id = $2 AND fingerprint = $3 AND status = 'open'
       ORDER BY last_seen DESC LIMIT 1`,
      [rule.tenantId, rule.id, incident.fingerprint]
    );
    
    if (existing.rows.length > 0) {
      // Mettre à jour l'événement existant
      const result = await client.query(
        `UPDATE alert_events
         SET last_seen = NOW(),
             count = count + 1,
             payload = $4
         WHERE id = $1
         RETURNING *`,
        [
          existing.rows[0].id,
          rule.tenantId,
          rule.id,
          JSON.stringify(incident.payload),
        ]
      );
      
      return mapRowToEvent(result.rows[0]);
    }
    
    // Créer un nouvel événement
    const result = await client.query(
      `INSERT INTO alert_events
       (tenant_id, rule_id, fingerprint, status, payload, labels)
       VALUES ($1, $2, $3, 'open', $4, $5)
       RETURNING *`,
      [
        rule.tenantId,
        rule.id,
        incident.fingerprint,
        JSON.stringify(incident.payload),
        JSON.stringify(incident.labels),
      ]
    );
    
    return mapRowToEvent(result.rows[0]);
  } finally {
    client.release();
  }
}

/**
 * Vérifie et ferme les alertes obsolètes (reopen_after_sec)
 * Phase P15: Moteur d'alertes
 */
async function checkAndCloseStaleAlerts(rule: AlertRule): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query(
      `UPDATE alert_events
       SET status = 'closed',
           closed_at = NOW(),
           closed_by = 'system'
       WHERE tenant_id = $1
         AND rule_id = $2
         AND status = 'open'
         AND last_seen < NOW() - INTERVAL '1 second' * $3`,
      [rule.tenantId, rule.id, rule.reopenAfterSec]
    );
  } finally {
    client.release();
  }
}

/**
 * Mappe une row DB vers un AlertEvent
 * Phase P15: Moteur d'alertes
 */
function mapRowToEvent(row: any): AlertEvent {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    ruleId: row.rule_id,
    fingerprint: row.fingerprint,
    status: row.status,
    firstSeen: new Date(row.first_seen),
    lastSeen: new Date(row.last_seen),
    acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
    acknowledgedBy: row.acknowledged_by,
    closedAt: row.closed_at ? new Date(row.closed_at) : undefined,
    closedBy: row.closed_by,
    count: row.count,
    payload: row.payload,
    labels: row.labels,
  };
}
