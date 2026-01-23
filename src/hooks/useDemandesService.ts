/**
 * Hook React pour utiliser le service du domaine Demandes
 * Fournit une interface réactive pour les calculs et validations
 */

'use client';

import { useMemo } from 'react';
import { DemandesService } from '@/domain/demandes/service';
import type { Demande } from '@/domain/demandes/types';

export function useDemandesService(demande: Demande | null) {
  // Préparer la demande (calculs automatiques)
  const preparedDemande = useMemo(() => {
    if (!demande) return null;
    return DemandesService.prepareForAction(demande);
  }, [demande]);

  // Validation
  const validation = useMemo(() => {
    if (!preparedDemande) return null;
    return DemandesService.validate(preparedDemande);
  }, [preparedDemande]);

  // Approbateur
  const approver = useMemo(() => {
    if (!preparedDemande) return null;
    return DemandesService.getApproverLevel(preparedDemande);
  }, [preparedDemande]);

  // Métriques budgétaires
  const budgetMetrics = useMemo(() => {
    if (!preparedDemande || !preparedDemande.budget) return null;
    return DemandesService.calculateBudgetMetrics(preparedDemande, preparedDemande.budget);
  }, [preparedDemande]);

  // Risques
  const risks = useMemo(() => {
    if (!preparedDemande) return [];
    return DemandesService.evaluateRisks(preparedDemande);
  }, [preparedDemande]);

  // Score de risque global
  const globalRiskScore = useMemo(() => {
    if (risks.length === 0) return 0;
    return Math.max(...risks.map(r => r.score));
  }, [risks]);

  return {
    // Données préparées
    preparedDemande,
    
    // Validations
    validation,
    isValid: validation?.valid ?? false,
    errors: validation?.errors ?? [],
    warnings: validation?.warnings ?? [],
    
    // Approbation
    approver,
    canAutoApprove: preparedDemande ? DemandesService.canAutoApprove(preparedDemande) : false,
    
    // Risques
    risks,
    globalRiskScore,
    riskLevel: globalRiskScore >= 80 ? 'critical' : globalRiskScore >= 60 ? 'high' : 'low',
    
    // Budget
    budgetMetrics,
    budgetUsage: budgetMetrics?.usage ?? null,
    budgetRemaining: budgetMetrics?.remaining ?? null,
    budgetExceeded: budgetMetrics?.exceeded ?? false,
    budgetWarning: budgetMetrics?.warning ?? false,
    budgetCritical: budgetMetrics?.critical ?? false,
    
    // Actions (pour utilisation dans handlers)
    validate: (d: Demande) => DemandesService.validate(d),
    prepareForAction: (d: Demande) => DemandesService.prepareForAction(d),
    getApproverLevel: (d: Demande) => DemandesService.getApproverLevel(d),
    evaluateRisks: (d: Demande) => DemandesService.evaluateRisks(d),
    calculateBudgetMetrics: (d: Demande) => {
      if (!d.budget) return null;
      return DemandesService.calculateBudgetMetrics(d, d.budget);
    }
  };
}

