/**
 * Hook React pour utiliser les services du domaine Demandes
 * Fournit une interface réactive pour les calculs et validations
 */

'use client';

import { useMemo } from 'react';
import { DemandeService } from '@/domain/demandes/services/demande.service';
import { BudgetService } from '@/domain/demandes/services/budget.service';
import { RiskService } from '@/domain/demandes/services/risk.service';
import { PriorityService } from '@/domain/demandes/services/priority.service';
import type { Demande } from '@/domain/demandes/types/demande.types';

export function useDemandeService(demande: Demande | null) {
  // Préparer la demande (calculs automatiques)
  const preparedDemande = useMemo(() => {
    if (!demande) return null;
    return DemandeService.prepareForAction(demande);
  }, [demande]);

  // Validation
  const validation = useMemo(() => {
    if (!preparedDemande) return null;
    return DemandeService.validate(preparedDemande);
  }, [preparedDemande]);

  // Approbateur
  const approver = useMemo(() => {
    if (!preparedDemande) return null;
    return DemandeService.getApprover(preparedDemande);
  }, [preparedDemande]);

  // Évaluation des risques
  const riskEvaluation = useMemo(() => {
    if (!preparedDemande) return null;
    return RiskService.evaluateRisksComplete(preparedDemande);
  }, [preparedDemande]);

  // Métriques budgétaires
  const budgetMetrics = useMemo(() => {
    if (!preparedDemande || !preparedDemande.budget) return null;
    return BudgetService.calculateBudgetMetrics(preparedDemande, preparedDemande.budget);
  }, [preparedDemande]);

  // Calcul de priorité avec raison
  const priorityCalculation = useMemo(() => {
    if (!preparedDemande) return null;
    return PriorityService.calculatePriorityWithReason(preparedDemande);
  }, [preparedDemande]);

  // Résumé complet
  const summary = useMemo(() => {
    if (!preparedDemande) return null;
    return DemandeService.getSummary(preparedDemande);
  }, [preparedDemande]);

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
    canAutoApprove: preparedDemande ? DemandeService.canAutoApprove(preparedDemande) : false,
    
    // Risques
    riskEvaluation,
    risks: riskEvaluation?.risks ?? [],
    globalRiskScore: riskEvaluation?.globalScore ?? 0,
    riskLevel: riskEvaluation?.riskLevel ?? 'low',
    
    // Budget
    budgetMetrics,
    budgetUsage: budgetMetrics?.usage ?? null,
    budgetRemaining: budgetMetrics?.remaining ?? null,
    budgetExceeded: budgetMetrics?.exceeded ?? false,
    budgetWarning: budgetMetrics?.warning ?? false,
    budgetCritical: budgetMetrics?.critical ?? false,
    
    // Priorité
    priorityCalculation,
    calculatedPriority: priorityCalculation?.priority,
    priorityReason: priorityCalculation?.reason,
    shouldEscalate: priorityCalculation?.shouldEscalate ?? false,
    
    // Résumé complet
    summary,
    
    // Actions (pour utilisation dans handlers)
    validate: (d: Demande) => DemandeService.validate(d),
    prepareForAction: (d: Demande) => DemandeService.prepareForAction(d),
    getApprover: (d: Demande) => DemandeService.getApprover(d),
    evaluateRisks: (d: Demande) => RiskService.evaluateRisksComplete(d),
    calculateBudgetMetrics: (d: Demande) => {
      if (!d.budget) return null;
      return BudgetService.calculateBudgetMetrics(d, d.budget);
    }
  };
}

