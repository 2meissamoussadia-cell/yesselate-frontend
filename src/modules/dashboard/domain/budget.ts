/**
 * Intégration logique métier Budget (domaine gouvernance) → Dashboard
 *
 * Utilise les types et fonctions du domaine gouvernance (budget)
 * pour statut, alertes et métriques affichés dans les vues dashboard.
 */

import type { Budget } from '@/domain/gouvernance/types/gouvernance.types';
import {
  calculateBudgetStatut,
  calculateBudgetMetrics,
  getBudgetAlerts,
  isBudgetExceeded,
  isBudgetCritical,
  isBudgetWarning,
} from '@/domain/gouvernance/types/budget.types';
import type { BudgetStatut } from '@/domain/gouvernance/types/gouvernance.types';

/** Données API type budget (readmodel) */
export interface BudgetDataLike {
  budget_initial?: number;
  budget_consomme?: number;
  budget_restant?: number;
  pourcent_consomme?: number;
  total?: number;
  consomme?: number;
  reste?: number;
  pourcentage?: number;
}

/**
 * Construit un Budget domaine à partir des données API dashboard.
 * Le statut est calculé selon les règles domaine (calculateBudgetStatut).
 */
export function toDomainBudget(data: BudgetDataLike): Budget {
  const initial = data.budget_initial ?? data.total ?? 0;
  const consomme = data.budget_consomme ?? data.consomme ?? 0;
  const restant = data.budget_restant ?? data.reste ?? initial - consomme;
  const pourcent = data.pourcent_consomme ?? data.pourcentage ?? (initial > 0 ? (consomme / initial) * 100 : 0);

  const budget: Budget = {
    id: 0,
    code: '',
    libelle: 'Budget',
    budget_initial: initial,
    budget_consomme: consomme,
    budget_restant: restant,
    pourcent_consomme: pourcent,
    statut: 'on-track',
  };
  budget.statut = calculateBudgetStatut(budget);
  return budget;
}

/**
 * Retourne le statut métier du budget (règles domaine).
 */
export function getBudgetStatut(data: BudgetDataLike): BudgetStatut {
  const budget = toDomainBudget(data);
  return calculateBudgetStatut(budget);
}

/**
 * Retourne les alertes métier (dépassement, critique, warning).
 */
export function getBudgetAlertsFromData(data: BudgetDataLike) {
  const budget = toDomainBudget(data);
  return getBudgetAlerts(budget);
}

export {
  calculateBudgetStatut,
  calculateBudgetMetrics,
  getBudgetAlerts,
  isBudgetExceeded,
  isBudgetCritical,
  isBudgetWarning,
};
