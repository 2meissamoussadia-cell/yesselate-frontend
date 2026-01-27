/**
 * Alertes sécurité
 * Phase P15: Observabilité & réponse - Alertes sécurité
 * 
 * Déclenche des alertes pour :
 * - Taux 401/403 élevé
 * - Échecs mTLS
 * - Augmentation erreurs CSP
 * - Refus quotas FinOps
 * - Erreurs auth
 */

import { RequestContext } from '../dashboard/context';

// ============================================================================
// Types d'alertes sécurité
// ============================================================================

export type SecurityAlertType =
  | 'auth_failure_rate'
  | 'mtls_failure'
  | 'csp_violation_spike'
  | 'quota_denial_spike'
  | 'unauthorized_access_attempt'
  | 'rate_limit_abuse'
  | 'export_abuse'
  | 'suspicious_activity';

export interface SecurityAlert {
  type: SecurityAlertType;
  severity: 'info' | 'warning' | 'critical';
  tenantId: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: Date;
  requestId?: string;
}

// ============================================================================
// Métriques de sécurité (à intégrer avec Prometheus P4)
// ============================================================================

// Compteurs pour métriques sécurité
const securityMetrics = {
  authFailures: new Map<string, number>(), // tenantId -> count
  mtlsFailures: new Map<string, number>(),
  cspViolations: new Map<string, number>(),
  quotaDenials: new Map<string, number>(),
};

/**
 * Enregistre un échec d'authentification
 */
export function recordAuthFailure(ctx: RequestContext, reason: string): void {
  const key = ctx.tenantId;
  const count = (securityMetrics.authFailures.get(key) || 0) + 1;
  securityMetrics.authFailures.set(key, count);
  
  // Déclencher alerte si seuil dépassé (ex: > 10 échecs en 1 min)
  if (count > 10) {
    triggerSecurityAlert({
      type: 'auth_failure_rate',
      severity: 'warning',
      tenantId: ctx.tenantId,
      message: `High authentication failure rate: ${count} failures`,
      metadata: { count, reason },
      timestamp: new Date(),
    });
  }
}

/**
 * Enregistre un échec mTLS
 */
export function recordMtlsFailure(ctx: RequestContext, reason: string): void {
  const key = ctx.tenantId;
  const count = (securityMetrics.mtlsFailures.get(key) || 0) + 1;
  securityMetrics.mtlsFailures.set(key, count);
  
  // Déclencher alerte si échec mTLS (critique)
  triggerSecurityAlert({
    type: 'mtls_failure',
    severity: 'critical',
    tenantId: ctx.tenantId,
    message: `mTLS failure: ${reason}`,
    metadata: { reason, count },
    timestamp: new Date(),
  });
}

/**
 * Enregistre une violation CSP
 */
export function recordCspViolation(ctx: RequestContext, violation: any): void {
  const key = ctx.tenantId;
  const count = (securityMetrics.cspViolations.get(key) || 0) + 1;
  securityMetrics.cspViolations.set(key, count);
  
  // Déclencher alerte si pic de violations (ex: > 50 en 5 min)
  if (count > 50) {
    triggerSecurityAlert({
      type: 'csp_violation_spike',
      severity: 'warning',
      tenantId: ctx.tenantId,
      message: `CSP violation spike: ${count} violations`,
      metadata: { count, violation },
      timestamp: new Date(),
    });
  }
}

/**
 * Enregistre un refus de quota FinOps
 */
export function recordQuotaDenial(ctx: RequestContext, scope: string, reason: string): void {
  const key = `${ctx.tenantId}:${scope}`;
  const count = (securityMetrics.quotaDenials.get(key) || 0) + 1;
  securityMetrics.quotaDenials.set(key, count);
  
  // Déclencher alerte si refus répétés (ex: > 20 en 10 min)
  if (count > 20) {
    triggerSecurityAlert({
      type: 'quota_denial_spike',
      severity: 'warning',
      tenantId: ctx.tenantId,
      message: `Quota denial spike: ${count} denials for ${scope}`,
      metadata: { count, scope, reason },
      timestamp: new Date(),
    });
  }
}

/**
 * Enregistre une tentative d'accès non autorisé
 */
export function recordUnauthorizedAttempt(ctx: RequestContext, resource: string, action: string): void {
  triggerSecurityAlert({
    type: 'unauthorized_access_attempt',
    severity: 'warning',
    tenantId: ctx.tenantId,
    message: `Unauthorized access attempt: ${action} on ${resource}`,
    metadata: { resource, action, userId: ctx.userId },
    timestamp: new Date(),
  });
}

// ============================================================================
// Déclenchement d'alertes
// ============================================================================

/**
 * Déclenche une alerte sécurité
 * 
 * TODO: Intégrer avec système d'alertes P15 (alert_rules, alert_channels)
 */
async function triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
  // Log l'alerte
  console.warn('[Security Alert]', alert);
  
  // TODO: Intégrer avec système d'alertes P15
  // await createAlertEvent({
  //   ruleId: getSecurityRuleId(alert.type),
  //   tenantId: alert.tenantId,
  //   fingerprint: generateFingerprint(alert),
  //   payload: alert.metadata,
  // });
  
  // TODO: Envoyer via canaux configurés (Teams, SMS, Email)
  // await sendSecurityAlert(alert);
}

/**
 * Obtient le taux d'échec d'authentification pour un tenant
 */
export function getAuthFailureRate(tenantId: string): number {
  return securityMetrics.authFailures.get(tenantId) || 0;
}

/**
 * Réinitialise les métriques (appelé périodiquement)
 */
export function resetSecurityMetrics(): void {
  securityMetrics.authFailures.clear();
  securityMetrics.mtlsFailures.clear();
  securityMetrics.cspViolations.clear();
  securityMetrics.quotaDenials.clear();
}
