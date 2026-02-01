/**
 * Service de calcul des métriques budgétaires pour les demandes
 */

import type { Demande, BudgetInfo } from '../types/demande.types';

export interface BudgetMetrics {
  usage: number;
  remaining: number;
  exceeded: boolean;
  warning: boolean;
  critical: boolean;
}

export const BudgetService = {
  calculateBudgetUsage(demande: Demande, budget: BudgetInfo): number {
    const amount = demande.amount ?? demande.montant ?? 0;
    if (budget.available <= 0) return 0;
    return Math.round(((budget.consumed + budget.allocated + amount) / budget.available) * 100);
  },

  isBudgetExceeded(demande: Demande, budget: BudgetInfo): boolean {
    return this.calculateBudgetUsage(demande, budget) > 100;
  },

  calculateRemainingBudget(budget: BudgetInfo, amount: number): number {
    const remaining = budget.available - budget.consumed - budget.allocated - amount;
    return Math.max(0, remaining);
  },

  calculateBudgetMetrics(demande: Demande, budget: BudgetInfo): BudgetMetrics {
    const amount = demande.amount ?? demande.montant ?? 0;
    const usage = budget.available > 0
      ? Math.round(((budget.consumed + budget.allocated + amount) / budget.available) * 100)
      : 0;
    const remaining = this.calculateRemainingBudget(budget, amount);

    return {
      usage,
      remaining,
      exceeded: usage > 100,
      warning: usage > 80 && usage <= 90,
      critical: usage > 90,
    };
  },

  shouldTriggerBudgetAlert(
    demande: Demande,
    budget: BudgetInfo
  ): { shouldAlert: boolean; level?: 'warning' | 'critical' } | null {
    const metrics = this.calculateBudgetMetrics(demande, budget);
    if (metrics.critical) return { shouldAlert: true, level: 'critical' };
    if (metrics.warning) return { shouldAlert: true, level: 'warning' };
    return null;
  },
};
