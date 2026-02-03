/**
 * Module métier pour la gestion des délégations
 * Centralise tous les systèmes intelligents
 */

import { businessAlertEngine } from './alert-engine';
import { approvalWorkflowEngine } from './approval-workflow';
import { replacementManager } from './replacement-manager';
import { delegationAnalytics } from './analytics';
import { conflictDetector } from './conflict-detector';
import { timelineManager } from './timeline-manager';

export type { BusinessAlert, AlertAction, AlertRule } from './alert-engine';
export { BusinessAlertEngine, businessAlertEngine } from './alert-engine';
export type {
  ApprovalWorkflow,
  ApprovalRequest,
  Approval,
  ApprovalStatus,
  ApprovalLevel,
} from './approval-workflow';
export { ApprovalWorkflowEngine, approvalWorkflowEngine } from './approval-workflow';
export type { Replacement, Successor, AbsenceNotification } from './replacement-manager';
export { ReplacementManager, replacementManager } from './replacement-manager';
export type {
  DelegationMetrics,
  AgentPerformance,
  BusinessReport,
  ReportInsight,
} from './analytics';
export { DelegationAnalytics, delegationAnalytics } from './analytics';
export type { Conflict, ConflictResolution, ConflictType } from './conflict-detector';
export { ConflictDetector, conflictDetector } from './conflict-detector';
export type { TimelineEvent, AuditTrail, ChangeSnapshot, EventType } from './timeline-manager';
export { TimelineManager, timelineManager } from './timeline-manager';

/**
 * Classe principale orchestrant tous les systèmes métier
 */
export class DelegationBusinessEngine {
  constructor(
    public alerts = businessAlertEngine,
    public workflows = approvalWorkflowEngine,
    public replacements = replacementManager,
    public analytics = delegationAnalytics,
    public conflicts = conflictDetector,
    public timeline = timelineManager
  ) {}

  /**
   * Analyser une délégation de manière exhaustive
   */
  public async analyzeComprehensive(delegation: any, allDelegations: any[]) {
    const context = {
      activeDelegations: allDelegations.filter(d => d.status === 'active'),
      averageMaxAmount: this.analytics.calculateMetrics(allDelegations, new Date(0), new Date())
        .distribution.byAmount,
    };

    // Détection d'alertes
    const alerts = this.alerts.analyzeDelegation(delegation, context);

    // Détection de conflits
    const conflicts = this.conflicts.detectConflicts([delegation, ...allDelegations]);

    // Sélection du workflow approprié
    const workflow = this.workflows.selectWorkflow(delegation);

    // Vérification des remplaçants
    const hasBackup = this.replacements.getSuccessors(delegation.id).length > 0;

    // Timeline récente
    const recentActivity = this.timeline.getActivityStats(delegation.id, 'month');

    return {
      delegation,
      health: {
        alerts: alerts.length,
        conflicts: conflicts.filter(c => c.affectedDelegations.includes(delegation.id)).length,
        hasBackup,
        score: this.calculateHealthScore(alerts, conflicts, hasBackup),
      },
      alerts,
      conflicts: conflicts.filter(c => c.affectedDelegations.includes(delegation.id)),
      workflow,
      recentActivity,
      recommendations: this.generateRecommendations(alerts, conflicts, hasBackup),
    };
  }

  /**
   * Calculer le score de santé global
   */
  private calculateHealthScore(alerts: any[], conflicts: any[], hasBackup: boolean): number {
    let score = 100;

    // Pénalités pour alertes
    score -= alerts.filter((a: { severity?: string }) => a.severity === 'critical').length * 20;
    score -= alerts.filter((a: { severity?: string }) => a.severity === 'high').length * 10;
    score -= alerts.filter((a: { severity?: string }) => a.severity === 'medium').length * 5;

    // Pénalités pour conflits
    score -= conflicts.filter((c: { severity?: string }) => c.severity === 'critical').length * 15;
    score -= conflicts.filter((c: { severity?: string }) => c.severity === 'high').length * 10;

    // Pénalité pour absence de backup
    if (!hasBackup) score -= 15;

    return Math.max(0, score);
  }

  /**
   * Générer des recommandations intelligentes
   */
  private generateRecommendations(
    alerts: any[],
    conflicts: any[],
    hasBackup: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (alerts.length > 0) {
      recommendations.push(`Traiter ${alerts.length} alerte(s) métier détectée(s)`);
    }

    if (conflicts.length > 0) {
      recommendations.push(`Résoudre ${conflicts.length} conflit(s) identifié(s)`);
    }

    if (!hasBackup) {
      recommendations.push('Désigner un remplaçant pour assurer la continuité');
    }

    return recommendations;
  }

  /**
   * Générer un rapport de santé global du système
   */
  public async generateSystemHealthReport(delegations: any[]) {
    const metrics = this.analytics.calculateMetrics(delegations, new Date(0), new Date());
    const allAlerts = this.alerts.analyzeAll(delegations);
    const allConflicts = this.conflicts.detectConflicts(delegations);
    const delegationsWithoutBackup = this.replacements.getDelegationsWithoutBackup(delegations);

    return {
      overview: {
        total: delegations.length,
        active: metrics.overview.active,
        health: {
          healthy: delegations.filter(d => this.calculateHealthScore([], [], true) >= 80).length,
          warning: delegations.filter(
            d =>
              this.calculateHealthScore([], [], true) >= 50 &&
              this.calculateHealthScore([], [], true) < 80
          ).length,
          critical: delegations.filter(d => this.calculateHealthScore([], [], true) < 50).length,
        },
      },
      metrics,
      alerts: {
        total: allAlerts.length,
        bySeverity: {
          critical: allAlerts.filter((a: { severity?: string }) => a.severity === 'critical').length,
          high: allAlerts.filter((a: { severity?: string }) => a.severity === 'high').length,
          medium: allAlerts.filter((a: { severity?: string }) => a.severity === 'medium').length,
          low: allAlerts.filter((a: { severity?: string }) => a.severity === 'low').length,
        },
      },
      conflicts: {
        total: allConflicts.length,
        bySeverity: {
          critical: allConflicts.filter((c: { severity?: string }) => c.severity === 'critical').length,
          high: allConflicts.filter((c: { severity?: string }) => c.severity === 'high').length,
          medium: allConflicts.filter((c: { severity?: string }) => c.severity === 'medium').length,
          low: allConflicts.filter((c: { severity?: string }) => c.severity === 'low').length,
        },
      },
      compliance: {
        score: metrics.compliance.complianceScore,
        withoutBackup: delegationsWithoutBackup.length,
        expiringSoon: metrics.compliance.expiringSoon,
      },
      timestamp: new Date(),
    };
  }
}

/**
 * Instance singleton du moteur métier
 */
export const delegationBusinessEngine = new DelegationBusinessEngine();

