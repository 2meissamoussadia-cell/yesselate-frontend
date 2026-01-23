/**
 * Service principal pour les demandes
 * Orchestre les autres services et règles métier
 */

import type { Demande, ValidationResult } from '../types/demande.types';
import { BudgetService } from './budget.service';
import { RiskService } from './risk.service';
import { PriorityService } from './priority.service';
import { ValidationRules } from '../rules/validation.rules';
import { ApprovalRules } from '../rules/approval.rules';

export class DemandeService {
  /**
   * Valide une demande selon toutes les règles métier
   */
  static validate(demande: Demande): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation titre
    if (!ValidationRules.isTitleValid(demande.subject || demande.title)) {
      errors.push('Le titre est requis et doit faire au moins 10 caractères');
    }

    // Validation montant
    if (!ValidationRules.isAmountValid(demande.amount || demande.montant)) {
      errors.push('Le montant doit être positif et inférieur à 100M FCFA');
    }

    // Validation bureau
    if (!ValidationRules.isBureauValid(demande.bureau)) {
      errors.push('Le bureau est requis et doit être valide');
    }

    // Validation délai
    if (demande.deadline && !ValidationRules.isDeadlineValid(demande.deadline)) {
      errors.push('La date de délai n\'est pas valide');
    }

    // Warnings (non bloquants)
    if (demande.budget) {
      const budgetMetrics = BudgetService.calculateBudgetMetrics(demande, demande.budget);
      if (budgetMetrics.critical) {
        warnings.push('Budget critique : plus de 90% utilisé');
      } else if (budgetMetrics.warning) {
        warnings.push('Budget en alerte : plus de 80% utilisé');
      }
    }

    // Warnings risques
    const riskEvaluation = RiskService.evaluateRisksComplete(demande);
    if (riskEvaluation.risks.length > 0) {
      warnings.push(`${riskEvaluation.risks.length} risque(s) détecté(s)`);
    }

    // Validation documents requis
    if (!ValidationRules.requiresDocuments(demande)) {
      errors.push('Des documents sont requis pour les demandes ≥ 1M FCFA');
    }

    // Validation justification requise
    if (!ValidationRules.requiresJustification(demande)) {
      errors.push('Une justification est requise pour les demandes ≥ 500K FCFA');
    }

    // Validation raison d'urgence
    if (!ValidationRules.requiresUrgencyReason(demande)) {
      errors.push('Une raison d\'urgence est requise pour les demandes urgentes/critiques');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Prépare une demande pour l'action (calculs automatiques)
   */
  static prepareForAction(demande: Demande): Demande {
    // Évaluer les risques
    const risks = RiskService.evaluateRisks(demande);
    
    // Calculer la priorité auto si non définie ou normale
    const priority = (demande.priority && demande.priority !== 'normal')
      ? demande.priority
      : PriorityService.calculateAutoPriority(demande);

    // Calculer les métriques budgétaires si budget présent
    const budget = demande.budget;
    if (budget) {
      // Calculer les métriques pour validation (utilisé par validate())
      BudgetService.calculateBudgetMetrics(demande, budget);
      // On pourrait enrichir l'objet budget avec les métriques
      // mais pour l'instant on garde la structure originale
    }

    // Calculer délai si deadline présente
    let delayDays: number | undefined;
    let isOverdue = false;
    
    if (demande.deadline) {
      const deadline = new Date(demande.deadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      delayDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      isOverdue = delayDays < 0;
    }

    return {
      ...demande,
      risks,
      priority,
      budget,
      delayDays,
      isOverdue
    };
  }

  /**
   * Obtient le niveau d'approbation requis
   */
  static getApprover(demande: Demande) {
    return ApprovalRules.getApproverLevel(demande);
  }

  /**
   * Vérifie si une demande peut être auto-approuvée
   */
  static canAutoApprove(demande: Demande): boolean {
    return ApprovalRules.canAutoApprove(demande);
  }

  /**
   * Évalue si une demande doit être escaladée
   */
  static shouldEscalate(demande: Demande): boolean {
    return PriorityService.shouldEscalate(demande);
  }

  /**
   * Obtient un résumé complet d'une demande (pour affichage)
   */
  static getSummary(demande: Demande) {
    const prepared = this.prepareForAction(demande);
    const validation = this.validate(prepared);
    const approver = this.getApprover(prepared);
    const riskEvaluation = RiskService.evaluateRisksComplete(prepared);
    const budgetMetrics = demande.budget 
      ? BudgetService.calculateBudgetMetrics(prepared, demande.budget)
      : null;

    return {
      demande: prepared,
      validation,
      approver,
      riskEvaluation,
      budgetMetrics,
      canAutoApprove: this.canAutoApprove(prepared),
      shouldEscalate: this.shouldEscalate(prepared)
    };
  }
}

