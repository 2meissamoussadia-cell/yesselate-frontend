// lib/server/dashboard/alerting/escalationWorker.ts
// Phase P17: Worker d'escalades (ladder de canaux)

import { pgPool } from '@lib-root/server/db/pool';
import { logger } from '@/lib/server/logging';
import { sendAlert } from './channels';

const log = logger.child({ component: 'escalationWorker' });

/**
 * Vérifie et déclenche les escalades pour les alertes ouvertes non ACK
 * Phase P17: Escalades
 * 
 * À exécuter périodiquement (ex: toutes les 5 minutes)
 */
export async function processEscalations(): Promise<void> {
  const client = await pgPool.connect();
  try {
    // Récupérer les alertes avec escalades en attente (via vue SQL)
    const { rows } = await client.query<{
      event_id: string;
      tenant_id: string;
      rule_id: string;
      rule_name: string;
      severity: 'info' | 'warning' | 'critical';
      first_seen: Date;
      age_seconds: number;
      step: number;
      delay_sec: number;
      channel_id: string;
      target: string;
    }>(`
      SELECT
        e.id AS event_id,
        e.tenant_id,
        e.rule_id,
        r.name AS rule_name,
        r.severity,
        e.first_seen,
        (EXTRACT(EPOCH FROM (NOW() - e.first_seen))::INT) AS age_seconds,
        esc.step,
        esc.delay_sec,
        esc.channel_id,
        esc.target
      FROM alert_events e
      JOIN alert_rules r ON e.rule_id = r.id
      JOIN alert_escalations esc ON r.id = esc.rule_id
      WHERE e.status = 'open'
        AND r.enabled = true
        AND esc.enabled = true
        AND e.acked_at IS NULL
        AND (EXTRACT(EPOCH FROM (NOW() - e.first_seen))::INT) >= esc.delay_sec
        AND NOT EXISTS (
          SELECT 1 FROM alert_notifications n
          WHERE n.event_id = e.id
            AND n.channel_id = esc.channel_id
            AND n.status = 'sent'
            AND n.created_at >= e.first_seen
        )
      ORDER BY e.tenant_id, e.rule_id, esc.step
    `);

    log.info({ count: rows.length }, 'Processing escalations');

    for (const row of rows) {
      try {
        // Vérifier si cette escalade a déjà été envoyée (éviter doublons)
        const { rows: existing } = await client.query<{ id: string }>(
          `SELECT id FROM alert_notifications
           WHERE event_id = $1 AND channel_id = $2 AND status = 'sent'
           AND created_at >= (SELECT first_seen FROM alert_events WHERE id = $1)
           LIMIT 1`,
          [row.event_id, row.channel_id]
        );

        if (existing.length > 0) {
          continue; // Déjà envoyé
        }

        // Récupérer les détails de l'événement et du canal
        const { rows: eventRows } = await client.query<{
          payload: Record<string, any>;
          labels: Record<string, any>;
          rule_id: string;
        }>(
          `SELECT payload, labels, rule_id FROM alert_events WHERE id = $1`,
          [row.event_id]
        );
        if (!eventRows.length) continue;

        const { rows: channelRows } = await client.query<{
          kind: string;
          config: Record<string, any>;
        }>(
          `SELECT kind, config FROM alert_channels WHERE id = $1 AND enabled = true`,
          [row.channel_id]
        );
        if (!channelRows.length) continue;

        const event = eventRows[0];
        const channel = channelRows[0];

        // Envoyer l'escalade
        await sendAlert({
          channelId: row.channel_id,
          channelKind: channel.kind as 'email' | 'teams' | 'sms' | 'webhook',
          channelConfig: channel.config,
          target: row.target,
          ruleName: row.rule_name,
          severity: row.severity,
          payload: event.payload,
          labels: event.labels,
          tenantId: row.tenant_id,
        });

        // Enregistrer la livraison (utiliser alert_notifications si alert_deliveries n'existe pas)
        try {
          await client.query(
            `INSERT INTO alert_notifications (tenant_id, event_id, channel_id, status, target, sent_at)
             VALUES ($1, $2, $3, 'sent', $4, NOW())`,
            [row.tenant_id, row.event_id, row.channel_id, row.target]
          );
        } catch {
          // Fallback si alert_deliveries existe
          await client.query(
            `INSERT INTO alert_deliveries (tenant_id, event_id, channel_id, status, target, sent_at)
             VALUES ($1, $2, $3, 'sent', $4, NOW())
             ON CONFLICT DO NOTHING`,
            [row.tenant_id, row.event_id, row.channel_id, row.target]
          );
        }

        log.info(
          {
            eventId: row.event_id,
            step: row.step,
            channelId: row.channel_id,
            ageSeconds: row.age_seconds,
          },
          'Escalation sent'
        );
      } catch (error) {
        log.error(
          { err: error, eventId: row.event_id, step: row.step },
          'Error processing escalation'
        );
        // Enregistrer l'échec
        try {
          await client.query(
            `INSERT INTO alert_notifications (tenant_id, event_id, channel_id, status, target, error)
             VALUES ($1, $2, $3, 'failed', $4, $5)`,
            [
              row.tenant_id,
              row.event_id,
              row.channel_id,
              row.target,
              error instanceof Error ? error.message : String(error),
            ]
          );
        } catch {
          // Fallback si alert_deliveries existe
          await client.query(
            `INSERT INTO alert_deliveries (tenant_id, event_id, channel_id, status, target, error)
             VALUES ($1, $2, $3, 'failed', $4, $5)
             ON CONFLICT DO NOTHING`,
            [
              row.tenant_id,
              row.event_id,
              row.channel_id,
              row.target,
              error instanceof Error ? error.message : String(error),
            ]
          );
        }
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Point d'entrée principal du worker d'escalades (standalone)
 * À exécuter via CRON : toutes les 5 minutes
 */
export async function runEscalationWorker(): Promise<void> {
  log.info('Starting escalation worker');
  try {
    await processEscalations();
    log.info('Escalation worker completed');
  } catch (error) {
    log.error({ err: error }, 'Fatal error in escalation worker');
    throw error;
  }
}
