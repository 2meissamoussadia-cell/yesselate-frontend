/**
 * Service pour les budgets de gouvernance
 */

import type { Budget, BudgetMetrics, BudgetAlert } from '../types/budget.types';
import {
  calculateBudgetStatut,
  calculateBudgetMetrics,
  getBudgetAlerts,
  isBudgetExceeded,
  isBudgetCritical,
  isBudgetWarning,
} from '../types/budget.types';

export class BudgetService {
  /**
   * Calcule les métriques d'un budget
   */
  static calculateMetrics(budget: Budget): BudgetMetrics {
    return calculateBudgetMetrics(budget);
  }

  /**
   * Récupère les alertes d'un budget
   */
  static getAlerts(budget: Budget): BudgetAlert[] {
    return getBudgetAlerts(budget);
  }

  /**
   * Calcule le statut d'un budget
   */
  static calculateStatut(budget: Budget): string {
    return calculateBudgetStatut(budget);
  }

  /**
   * Calcule la consommation totale des budgets
   */
  static calculateConsumption(budgets: Budget[]): number {
    if (budgets.length === 0) return 0;

    const totalInitial = budgets.reduce((sum, b) => sum + b.budget_initial, 0);
    const totalConsomme = budgets.reduce((sum, b) => sum + b.budget_consomme, 0);

    return totalInitial > 0 ? (totalConsomme / totalInitial) * 100 : 0;
  }

  /**
   * Identifie les budgets en dépassement
   */
  static getExceededBudgets(budgets: Budget[]): Budget[] {
    return budgets.filter(b => isBudgetExceeded(b));
  }

  /**
   * Identifie les budgets critiques
   */
  static getCriticalBudgets(budgets: Budget[]): Budget[] {
    return budgets.filter(b => isBudgetCritical(b));
  }

  /**
   * Identifie les budgets en alerte
   */
  static getWarningBudgets(budgets: Budget[]): Budget[] {
    return budgets.filter(b => isBudgetWarning(b));
  }

  /**
   * Calcule le total des budgets par bureau
   */
  static calculateByBureau(budgets: Budget[]): Record<string, {
    total: number;
    consomme: number;
    pourcent: number;
  }> {
    const byBureau: Record<string, {
      total: number;
      consomme: number;
      pourcent: number;
    }> = {};

    budgets.forEach(budget => {
      const bureau = budget.bureau || 'Autre';
      if (!byBureau[bureau]) {
        byBureau[bureau] = { total: 0, consomme: 0, pourcent: 0 };
      }
      byBureau[bureau].total += budget.budget_initial;
      byBureau[bureau].consomme += budget.budget_consomme;
    });

    // Calculer pourcentages
    Object.keys(byBureau).forEach(bureau => {
      const data = byBureau[bureau];
      data.pourcent = data.total > 0 ? (data.consomme / data.total) * 100 : 0;
    });

    return byBureau;
  }

  /**
   * Filtre les budgets selon les critères
   */
  static filterBudgets(
    budgets: Budget[],
    filters: {
      bureau?: string;
      projet_id?: number;
      statut?: string;
    }
  ): Budget[] {
    let filtered = [...budgets];

    if (filters.bureau) {
      filtered = filtered.filter(b => b.bureau === filters.bureau);
    }

    if (filters.projet_id) {
      filtered = filtered.filter(b => b.projet_id === filters.projet_id);
    }

    if (filters.statut) {
      filtered = filtered.filter(b => calculateBudgetStatut(b) === filters.statut);
    }

    return filtered;
  }
}
