/**
 * Service de calculs budgétaires pour les demandes
 * Extrait de la logique métier des composants
 */

import type { Demande, BudgetInfo, BudgetCalculationResult } from '../types/demande.types';

export class BudgetService {
  /**
   * Calcule le pourcentage d'utilisation du budget
   * @param demande - La demande avec montant
   * @param budget - Les informations de budget
   * @returns Pourcentage d'utilisation (0-100+)
   */
  static calculateBudgetUsage(
    demande: Demande,
    budget: BudgetInfo
  ): number {
    if (!budget.available || budget.available === 0) {
      return 0;
    }
    
    const amount = demande.amount || demande.montant || 0;
    if (amount === 0) {
      return 0;
    }
    
    const totalUsed = budget.consumed + budget.allocated + amount;
    const usage = (totalUsed / budget.available) * 100;
    
    return Math.round(usage * 100) / 100; // 2 décimales
  }

  /**
   * Vérifie si le budget est dépassé
   */
  static isBudgetExceeded(
    demande: Demande,
    budget: BudgetInfo
  ): boolean {
    return this.calculateBudgetUsage(demande, budget) > 100;
  }

  /**
   * Calcule le budget restant après allocation de la demande
   */
  static calculateRemainingBudget(
    budget: BudgetInfo,
    amount: number
  ): number {
    const totalUsed = budget.consumed + budget.allocated + amount;
    return Math.max(0, budget.available - totalUsed);
  }

  /**
   * Calcule toutes les métriques budgétaires
   */
  static calculateBudgetMetrics(
    demande: Demande,
    budget: BudgetInfo
  ): BudgetCalculationResult {
    const usage = this.calculateBudgetUsage(demande, budget);
    const remaining = this.calculateRemainingBudget(budget, demande.amount || demande.montant || 0);
    const exceeded = usage > 100;
    const warning = usage > 80 && usage <= 90;
    const critical = usage > 90;

    return {
      usage,
      remaining,
      exceeded,
      warning,
      critical
    };
  }

  /**
   * Vérifie si une alerte budget doit être déclenchée
   */
  static shouldTriggerBudgetAlert(
    demande: Demande,
    budget: BudgetInfo
  ): { alert: boolean; level: 'warning' | 'critical' | null } {
    const usage = this.calculateBudgetUsage(demande, budget);
    
    if (usage > 90) {
      return { alert: true, level: 'critical' };
    }
    
    if (usage > 80) {
      return { alert: true, level: 'warning' };
    }
    
    return { alert: false, level: null };
  }
}

