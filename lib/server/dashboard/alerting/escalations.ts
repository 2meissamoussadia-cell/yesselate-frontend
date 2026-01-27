// lib/server/dashboard/alerting/escalations.ts
// Phase P17: Escalades (ladder de canaux)

export interface AlertEscalation {
  id: string;
  tenantId: string;
  ruleId: string;
  step: number; // ordre (1, 2, 3...)
  delaySec: number; // délai après OPEN si non ACK (ex: 1800 = 30 min)
  channelId: string;
  target: string; // email/teams/sms/webhook (override ou cible spécifique)
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
