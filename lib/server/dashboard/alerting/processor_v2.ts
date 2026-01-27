// lib/server/dashboard/alerting/processor_v2.ts
// Phase P17: Processeur v2 — upsert incidents avec evidence

import { pgPool } from '@lib-root/server/db/pool';
import { evaluateRuleV2, type RuleV2, type EvaluationResult } from './evaluator_v2';
import { sendNotifications } from './channels';
import { logger } from '@/lib/server/logging';
import type { AlertRule } from './types';
import crypto from 'node:crypto';

const log = logger.child({ component: 'processor_v2' });

/**
 * Calcule le fingerprint pour dé-duplication
 */
function computeFingerprint(ruleId: string, groupKey: string, labels?: Record<string, string>): string {
  const data = { rule: ruleId, group: groupKey, labels: labels || {} };
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Vérifie si un incident est dans un silence actif
 */
async function isSilenced(
  tenantId: string,
  ruleId: string,
  labels: Record<string, string>
): Promise<boolean> {
  const client = await pgPool.connect();
  try {
    const { rows } = await client.query<{ id: string }>(
      `SELECT id FROM alert_silences
       WHERE tenant_id = $1
         AND (rule_id = $2 OR rule_id IS NULL)
         AND starts_at <= NOW()
         AND ends_at >= NOW()
         AND (matcher IS NULL OR matcher @> $3::jsonb)`,
      [tenantId, ruleId, JSON.stringify({ labels })]
    );
    return rows.length > 0;
  } finally {
    client.release();
  }
}

/**
 * Upsert un incident dans alert_events avec evidence
 */
async function upsertIncident(
  tenantId: string,
  ruleId: string,
  fingerprint: string,
  result: EvaluationResult,
  rule: RuleV2
): Promise<string> {
  const client = await pgPool.connect();
  try {
    // Vérifier si l'incident existe déjà
    const { rows: existing } = await client.query<{ id: string; status: string; count: number }>(
      `SELECT id, status, count FROM alert_events
       WHERE tenant_id = $1 AND rule_id = $2 AND fingerprint = $3
       ORDER BY last_seen DESC LIMIT 1`,
      [tenantId, ruleId, fingerprint]
    );

    if (existing.length > 0 && existing[0].status === 'open') {
      // Mettre à jour l'incident existant
      await client.query(
        `UPDATE alert_events
         SET last_seen = NOW(),
             count = count + 1,
             payload = $1,
             evidence = $2,
             labels = $3
         WHERE id = $4`,
        [
          JSON.stringify(result.payload),
          JSON.stringify(result.evidence),
          JSON.stringify(result.labels),
          existing[0].id,
        ]
      );
      return existing[0].id;
    } else {
      // Créer un nouvel incident
      const { rows: inserted } = await client.query<{ id: string }>(
        `INSERT INTO alert_events
         (tenant_id, rule_id, fingerprint, status, payload, evidence, labels, first_seen, last_seen, count)
         VALUES ($1, $2, $3, 'open', $4, $5, $6, NOW(), NOW(), 1)
         RETURNING id`,
        [
          tenantId,
          ruleId,
          fingerprint,
          JSON.stringify(result.payload),
          JSON.stringify(result.evidence),
          JSON.stringify(result.labels),
        ]
      );
      return inserted[0].id;
    }
  } finally {
    client.release();
  }
}

/**
 * Traite les résultats d'évaluation et crée/met à jour les incidents
 */
export async function processEvaluationResults(
  rule: RuleV2,
  results: EvaluationResult[],
  tenantId: string
): Promise<void> {
  for (const result of results) {
    if (!result.triggered) continue;

    try {
      // Vérifier si l'alerte est silencée
      const silenced = await isSilenced(tenantId, rule.id, result.labels);
      if (silenced) {
        log.debug({ ruleId: rule.id, fingerprint: result.fingerprint }, 'Alert silenced');
        continue;
      }

      // Vérifier cooldown (simplifié : on vérifie last_seen)
      const client = await pgPool.connect();
      try {
        const { rows: recent } = await client.query<{ last_seen: Date }>(
          `SELECT last_seen FROM alert_events
           WHERE tenant_id = $1 AND rule_id = $2 AND fingerprint = $3
           ORDER BY last_seen DESC LIMIT 1`,
          [tenantId, rule.id, result.fingerprint]
        );

        if (recent.length > 0) {
          const cooldownSec = rule.cooldown_sec || 600; // 10 min par défaut
          const ageSec = (Date.now() - new Date(recent[0].last_seen).getTime()) / 1000;
          if (ageSec < cooldownSec) {
            log.debug(
              { ruleId: rule.id, ageSec, cooldownSec },
              'Alert in cooldown'
            );
            continue;
          }
        }
      } finally {
        client.release();
      }

      // Upsert l'incident
      const eventId = await upsertIncident(tenantId, rule.id, result.fingerprint, result, rule);

      // Envoyer notifications (si nouvel incident)
      const client2 = await pgPool.connect();
      try {
        const { rows: eventRows } = await client2.query<{ count: number }>(
          `SELECT count FROM alert_events WHERE id = $1`,
          [eventId]
        );
        if (eventRows[0]?.count === 1) {
          // Nouvel incident : envoyer notifications
          const mockRule: AlertRule = {
            id: rule.id,
            tenantId: rule.tenant_id,
            name: `Rule ${rule.id}`,
            severity: rule.severity,
            enabled: true,
            expr: {} as any,
            cooldownSec: rule.cooldown_sec || 600,
            reopenAfterSec: rule.reopen_after_sec || 3600,
            labels: rule.labels,
          };
          const mockEvent = {
            id: eventId,
            tenantId: rule.tenant_id,
            ruleId: rule.id,
            fingerprint: result.fingerprint,
            status: 'open' as const,
            firstSeen: new Date(),
            lastSeen: new Date(),
            count: 1,
            payload: result.payload,
            labels: result.labels,
          };

          await sendNotifications(mockRule, mockEvent, {
            payload: result.payload,
            labels: result.labels,
          }).catch(err => {
            log.warn({ err, eventId }, 'Failed to send notifications');
          });
        }
      } finally {
        client2.release();
      }

      log.info(
        {
          ruleId: rule.id,
          eventId,
          fingerprint: result.fingerprint,
          groupKey: result.groupKey,
        },
        'Incident created/updated'
      );
    } catch (error) {
      log.error(
        { err: error, ruleId: rule.id, fingerprint: result.fingerprint },
        'Error processing evaluation result'
      );
    }
  }
}
