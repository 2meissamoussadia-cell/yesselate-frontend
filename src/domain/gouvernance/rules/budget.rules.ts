/**
 * Règles métier pour les budgets de gouvernance
 */

import type { Budget } from '../types/budget.types';
import { isBudgetExceeded, isBudgetCritical, isBudgetWarning } from '../types/budget.types';

export class BudgetRules {
  /**
   * Vérifie si un budget nécessite une escalade
   */
  static requiresEscalation(budget: Budget): boolean {
    return isBudgetExceeded(budget) || isBudgetCritical(budget);
  }

  /**
   * Vérifie si un budget nécessite une révision
   */
  static requiresReview(budget: Budget): boolean {
    return isBudgetWarning(budget) || isBudgetCritical(budget) || isBudgetExceeded(budget);
  }

  /**
   * Détermine le niveau d'escalade requis
   */
  static getEscalationLevel(budget: Budget): 1 | 2 | 3 {
    if (isBudgetExceeded(budget)) return 3; // Niveau maximum
    if (isBudgetCritical(budget)) return 2; // Niveau moyen
    if (isBudgetWarning(budget)) return 1; // Niveau bas
    return 1;
  }

  /**
   * Vérifie si un budget peut être utilisé
   */
  static canUseBudget(budget: Budget, amount: number): boolean {
    return budget.budget_restant >= amount;
  }

  /**
   * Calcule le montant maximum utilisable
   */
  static getMaxUsableAmount(budget: Budget): number {
    return Math.max(0, budget.budget_restant);
  }
}
