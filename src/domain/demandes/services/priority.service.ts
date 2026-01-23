/**
 * Service de calcul des priorités pour les demandes
 * Extrait de la logique métier des composants
 */

import type { Demande, DemandePriority, PriorityCalculationResult } from '../types/demande.types';
import { RiskService } from './risk.service';
import { BudgetService } from './budget.service';

export class PriorityService {
  // Seuils de montant pour déterminer la priorité
  private static readonly SEUIL_HIGH = 1000000; // 1M FCFA
  private static readonly SEUIL_URGENT = 5000000; // 5M FCFA
  private static readonly SEUIL_CRITICAL = 10000000; // 10M FCFA

  /**
   * Calcule la priorité automatique d'une demande basée sur les règles métier
   */
  static calculateAutoPriority(demande: Demande): DemandePriority {
    // Si priorité déjà définie manuellement, la respecter
    if (demande.priority && demande.priority !== 'normal') {
      return demande.priority;
    }

    // Évaluer les risques
    const riskEvaluation = RiskService.evaluateRisksComplete(demande);
    const globalRisk = riskEvaluation.globalScore;
    
    // Règles de priorité basées sur les risques
    if (globalRisk >= 80) {
      return 'critical';
    }
    
    if (globalRisk >= 60) {
      return 'urgent';
    }

    // Règles basées sur le montant
    const amount = demande.amount || demande.montant || 0;
    
    if (amount >= this.SEUIL_CRITICAL) {
      return 'critical';
    }
    
    if (amount >= this.SEUIL_URGENT) {
      return 'urgent';
    }
    
    if (amount >= this.SEUIL_HIGH) {
      return 'high';
    }

    // Règles basées sur le délai
    if (demande.deadline) {
      const deadline = new Date(demande.deadline);
      const now = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        return 'critical'; // Délai dépassé
      }
      
      if (daysUntil < 3) {
        return 'urgent';
      }
      
      if (daysUntil < 7) {
        return 'high';
      }
    }

    // Règles basées sur le statut
    if (demande.isOverdue) {
      return 'urgent';
    }

    // Par défaut
    return 'normal';
  }

  /**
   * Calcule la priorité avec raison détaillée
   */
  static calculatePriorityWithReason(demande: Demande): PriorityCalculationResult {
    const priority = this.calculateAutoPriority(demande);
    const reasons: string[] = [];
    let shouldEscalate = false;
    let escalationReason: string | undefined;

    // Raisons basées sur les risques
    const riskEvaluation = RiskService.evaluateRisksComplete(demande);
    if (riskEvaluation.globalScore >= 80) {
      reasons.push(`Risque critique (score: ${riskEvaluation.globalScore})`);
      shouldEscalate = true;
      escalationReason = 'Risque critique détecté';
    } else if (riskEvaluation.globalScore >= 60) {
      reasons.push(`Risque élevé (score: ${riskEvaluation.globalScore})`);
    }

    // Raisons basées sur le montant
    const amount = demande.amount || demande.montant || 0;
    if (amount >= this.SEUIL_CRITICAL) {
      reasons.push(`Montant très élevé (≥ ${this.SEUIL_CRITICAL.toLocaleString()} FCFA)`);
      shouldEscalate = true;
      escalationReason = `Montant ≥ ${this.SEUIL_CRITICAL.toLocaleString()} FCFA`;
    } else if (amount >= this.SEUIL_URGENT) {
      reasons.push(`Montant élevé (≥ ${this.SEUIL_URGENT.toLocaleString()} FCFA)`);
    }

    // Raisons basées sur le délai
    if (demande.deadline) {
      const deadline = new Date(demande.deadline);
      const now = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        reasons.push(`Délai dépassé de ${Math.abs(daysUntil)} jour(s)`);
        shouldEscalate = true;
        escalationReason = 'Délai dépassé';
      } else if (daysUntil < 3) {
        reasons.push(`Délai très court (${daysUntil} jour(s))`);
      }
    }

    // Raisons basées sur le budget
    if (demande.budget) {
      const budgetMetrics = BudgetService.calculateBudgetMetrics(demande, demande.budget);
      if (budgetMetrics.critical) {
        reasons.push('Budget critique (>90% utilisé)');
        shouldEscalate = true;
        escalationReason = 'Budget critique';
      } else if (budgetMetrics.warning) {
        reasons.push('Budget en alerte (>80% utilisé)');
      }
    }

    const reason = reasons.length > 0 
      ? reasons.join(' ; ')
      : 'Priorité normale selon les règles métier';

    return {
      priority,
      reason,
      shouldEscalate,
      escalationReason
    };
  }

  /**
   * Vérifie si la priorité doit être escaladée
   */
  static shouldEscalate(demande: Demande): boolean {
    const result = this.calculatePriorityWithReason(demande);
    // Escalade si priorité urgente ou critique, ou si montant très élevé
    const priority = result.priority;
    const amount = demande.amount || demande.montant || 0;
    
    return result.shouldEscalate || 
           priority === 'urgent' || 
           priority === 'critical' ||
           amount >= this.SEUIL_URGENT; // >= 5M
  }

  /**
   * Compare deux priorités (pour tri)
   * Retourne: -1 si a < b, 0 si a === b, 1 si a > b
   */
  static comparePriorities(a: DemandePriority, b: DemandePriority): number {
    const order: Record<DemandePriority, number> = {
      'low': 1,
      'normal': 2,
      'high': 3,
      'urgent': 4,
      'critical': 5
    };
    
    return order[a] - order[b];
  }
}

