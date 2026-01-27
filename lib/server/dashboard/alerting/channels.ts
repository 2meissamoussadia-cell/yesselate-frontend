// lib/server/dashboard/alerting/channels.ts
// Phase P15: Moteur d'alertes - Canaux de notification

import { pgPool } from '@lib-root/server/db/pool';
import { AlertRule, AlertEvent, AlertChannel } from './types';
import { logger } from '@/lib/server/logging';

/**
 * Envoie les notifications pour un événement d'alerte
 * Phase P15: Moteur d'alertes
 */
export async function sendNotifications(
  rule: AlertRule,
  event: AlertEvent,
  incident: { payload: Record<string, any>; labels: Record<string, any> }
): Promise<void> {
  const client = await pgPool.connect();
  try {
    // Récupérer les abonnements actifs pour cette règle
    const subscriptions = await client.query(
      `SELECT s.*, c.kind, c.config, c.name AS channel_name
       FROM alert_subscriptions s
       JOIN alert_channels c ON s.channel_id = c.id
       WHERE s.tenant_id = $1
         AND s.rule_id = $2
         AND s.enabled = true
         AND c.enabled = true`,
      [rule.tenantId, rule.id]
    );
    
    // Si pas d'abonnements, utiliser les canaux par défaut
    let channels: Array<{ kind: string; config: any; target?: string }> = [];
    
    if (subscriptions.rows.length > 0) {
      channels = subscriptions.rows.map((sub) => ({
        kind: sub.kind,
        config: sub.config,
        target: sub.target,
      }));
    } else if (rule.defaultChannels) {
      // Utiliser les canaux par défaut de la règle
      const defaultChannels = await client.query(
        `SELECT * FROM alert_channels
         WHERE tenant_id = $1
           AND kind = ANY($2::text[])
           AND enabled = true`,
        [rule.tenantId, Object.keys(rule.defaultChannels).filter(k => rule.defaultChannels![k])]
      );
      
      channels = defaultChannels.rows.map((ch) => ({
        kind: ch.kind,
        config: ch.config,
      }));
    }
    
    // Envoyer via chaque canal
    for (const channel of channels) {
      try {
        await sendViaChannel(channel, rule, event, incident);
        
        // Enregistrer la notification
        await client.query(
          `INSERT INTO alert_notifications
           (tenant_id, event_id, channel_id, target, status, sent_at)
           VALUES ($1, $2, $3, $4, 'sent', NOW())`,
          [rule.tenantId, event.id, channel.kind, channel.target || 'default']
        );
      } catch (error) {
        logger.error({ err: error, channel: channel.kind }, 'Failed to send notification');
        
        // Enregistrer l'échec
        await client.query(
          `INSERT INTO alert_notifications
           (tenant_id, event_id, channel_id, target, status, error)
           VALUES ($1, $2, $3, $4, 'failed', $5)`,
          [rule.tenantId, event.id, channel.kind, channel.target || 'default', String(error)]
        );
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Envoie une notification via un canal spécifique
 * Phase P15: Moteur d'alertes
 */
async function sendViaChannel(
  channel: { kind: string; config: any; target?: string },
  rule: AlertRule,
  event: AlertEvent,
  incident: { payload: Record<string, any>; labels: Record<string, any> }
): Promise<void> {
  const message = formatMessage(rule, event, incident);
  
  switch (channel.kind) {
    case 'email':
      await sendEmail(channel.config, channel.target || rule.tenantId, message);
      break;
    case 'teams':
      await sendTeams(channel.config, message);
      break;
    case 'sms':
      await sendSMS(channel.config, channel.target || '', message);
      break;
    case 'webhook':
      await sendWebhook(channel.config, message);
      break;
    default:
      throw new Error(`Unknown channel kind: ${channel.kind}`);
  }
}

/**
 * Formate le message d'alerte
 * Phase P15: Moteur d'alertes
 */
function formatMessage(
  rule: AlertRule,
  event: AlertEvent,
  incident: { payload: Record<string, any>; labels: Record<string, any> }
): string {
  const severityEmoji = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
  };
  
  return `${severityEmoji[rule.severity]} **${rule.name}**

${rule.description || ''}

**Valeur détectée** : ${incident.payload.value}
**Seuil** : ${incident.payload.threshold}
**Statut** : ${event.status}
**Compteur** : ${event.count}

${JSON.stringify(incident.labels, null, 2)}`;
}

/**
 * Envoie un email (stub - à implémenter avec SMTP)
 * Phase P15: Moteur d'alertes
 */
async function sendEmail(config: any, target: string, message: string): Promise<void> {
  // TODO: Implémenter avec nodemailer ou autre
  logger.info({ target, config }, '[Email] Sending alert email');
  // throw new Error('Email channel not implemented');
}

/**
 * Envoie une notification Teams (webhook)
 * Phase P15: Moteur d'alertes
 */
async function sendTeams(config: any, message: string): Promise<void> {
  const webhookUrl = config.webhook || config.teams?.webhook;
  if (!webhookUrl) {
    throw new Error('Teams webhook URL not configured');
  }
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: 'Alerte Dashboard',
      themeColor: '0078D4',
      text: message,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Teams webhook failed: ${response.statusText}`);
  }
}

/**
 * Envoie un SMS (stub - à implémenter avec provider)
 * Phase P15: Moteur d'alertes
 */
async function sendSMS(config: any, target: string, message: string): Promise<void> {
  // TODO: Implémenter avec Twilio ou autre
  logger.info({ target, config }, '[SMS] Sending alert SMS');
  // throw new Error('SMS channel not implemented');
}

/**
 * Envoie un webhook HTTP POST
 * Phase P15: Moteur d'alertes
 */
async function sendWebhook(config: any, message: string): Promise<void> {
  const url = config.url || config.webhook?.url;
  if (!url) {
    throw new Error('Webhook URL not configured');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
    body: JSON.stringify({
      message,
      timestamp: new Date().toISOString(),
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.statusText}`);
  }
}

/**
 * Envoie une alerte via un canal (pour escalades)
 * Phase P17: Escalades
 */
export async function sendAlert(params: {
  channelId: string;
  channelKind: 'email' | 'teams' | 'sms' | 'webhook';
  channelConfig: Record<string, any>;
  target: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, any>;
  labels?: Record<string, any>;
  tenantId: string;
}): Promise<void> {
  const { channelKind, channelConfig, target, ruleName, severity, payload, labels } = params;
  
  const severityEmoji = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
  };
  
  const message = `${severityEmoji[severity]} **${ruleName}** (Escalade)

**Valeur détectée** : ${payload.metric ?? payload.value ?? 'N/A'}
**Labels** : ${JSON.stringify(labels || {}, null, 2)}
**Payload** : ${JSON.stringify(payload, null, 2)}`;

  const channel = { kind: channelKind, config: channelConfig, target };
  const mockRule = { name: ruleName, severity, tenantId: params.tenantId } as AlertRule;
  const mockEvent = { id: '', status: 'open' as const, count: 1 } as AlertEvent;
  const incident = { payload, labels: labels || {} };

  await sendViaChannel(channel, mockRule, mockEvent, incident);
}
