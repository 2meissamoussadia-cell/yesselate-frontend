/**
 * Standard Alert Types
 * ===================
 * Core type definitions for the alerts system
 * 
 * These types are the canonical definitions used across the application.
 */

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertStatus = 'open' | 'in-progress' | 'blocked' | 'ack' | 'resolved';
export type AlertCategory =
  | 'overview'
  | 'critical'
  | 'warning'
  | 'sla'
  | 'blocked'
  | 'ack'
  | 'resolved'
  | 'history'
  | 'watchlist';

export interface AlertItem {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  ageDays?: number;
  agency?: string;
  site?: string;
  owner?: string;
  domain?: string;  // finance | project | procurement | ... (optionnel pour governance/UI)
  entity?: string | Record<string, unknown>;  // milestone | lot | po | vendor | ... ou objet { kind, id, projectId? }
  flow?: string;    // payment | recovery | ...
  flag?: string;    // missing-docs | overspend | ...
  severity: AlertSeverity;
  status: AlertStatus;
  sla?: 'ok' | 'at-risk' | 'breached';
  isWatched?: boolean;
  /** Governance/UI: type catégorie (blocked | payment | contract | system) */
  type?: string;
  /** Bureau concerné */
  bureau?: string;
  /** Impact: niveau string ou objet { money?, scheduleDays?, legal? } */
  impact?: string | Record<string, unknown>;
  /** Date limite SLA (ISO) */
  slaDueAt?: string;
  /** Date de création (ISO) */
  createdAt?: string;
}

/** Retourne la propriété money de impact si c'est un objet, sinon undefined */
export function getAlertImpactMoney(impact: AlertItem['impact']): number | undefined {
  if (typeof impact === 'object' && impact !== null && 'money' in impact) {
    return (impact as Record<string, unknown>).money as number;
  }
  return undefined;
}

