/**
 * Types spécifiques pour les budgets de gouvernance
 */

import type { Budget, BudgetStatut } from './gouvernance.types';

export interface BudgetMetrics {
  consommation_pourcent: number;
  reste_jours?: number; // Jours restants dans l'année
  projection_fin_annee: number; // Projection consommation fin d'année
  is_warning: boolean;
  is_critical: boolean;
  is_exceeded: boolean;
}

export interface BudgetAlert {
  type: 'warning' | 'critical' | 'exceeded';
  message: string;
  action_required: boolean;
}

export function calculateBudgetStatut(budget: Budget): BudgetStatut {
  if (budget.pourcent_consomme >= 100) return 'exceeded';
  if (budget.pourcent_consomme >= 90) return 'critical';
  if (budget.pourcent_consomme >= 75) return 'warning';
  return 'on-track';
}

export function isBudgetExceeded(budget: Budget): boolean {
  return budget.pourcent_consomme >= 100;
}

export function isBudgetCritical(budget: Budget): boolean {
  return budget.pourcent_consomme >= 90 && budget.pourcent_consomme < 100;
}

export function isBudgetWarning(budget: Budget): boolean {
  return budget.pourcent_consomme >= 75 && budget.pourcent_consomme < 90;
}

export function calculateBudgetMetrics(budget: Budget): BudgetMetrics {
  const aujourdhui = new Date();
  const finAnnee = new Date(aujourdhui.getFullYear(), 11, 31);
  const joursEcoules = Math.floor((aujourdhui.getTime() - new Date(aujourdhui.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  const joursTotal = Math.floor((finAnnee.getTime() - new Date(aujourdhui.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  const resteJours = joursTotal - joursEcoules;
  
  // Projection linéaire
  const projectionFinAnnee = resteJours > 0
    ? budget.budget_consomme + (budget.budget_consomme / joursEcoules) * resteJours
    : budget.budget_consomme;
  
  return {
    consommation_pourcent: budget.pourcent_consomme,
    reste_jours: resteJours,
    projection_fin_annee: projectionFinAnnee,
    is_warning: isBudgetWarning(budget),
    is_critical: isBudgetCritical(budget),
    is_exceeded: isBudgetExceeded(budget),
  };
}

export function getBudgetAlerts(budget: Budget): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];
  const metrics = calculateBudgetMetrics(budget);
  
  if (metrics.is_exceeded) {
    alerts.push({
      type: 'exceeded',
      message: `Budget dépassé de ${(budget.budget_consomme - budget.budget_initial).toLocaleString('fr-FR')} €`,
      action_required: true,
    });
  } else if (metrics.is_critical) {
    alerts.push({
      type: 'critical',
      message: `Budget critique: ${budget.pourcent_consomme.toFixed(1)}% consommé`,
      action_required: true,
    });
  } else if (metrics.is_warning) {
    alerts.push({
      type: 'warning',
      message: `Budget en alerte: ${budget.pourcent_consomme.toFixed(1)}% consommé`,
      action_required: false,
    });
  }
  
  if (metrics.projection_fin_annee > budget.budget_initial) {
    alerts.push({
      type: 'warning',
      message: `Projection: dépassement prévu de ${(metrics.projection_fin_annee - budget.budget_initial).toLocaleString('fr-FR')} €`,
      action_required: false,
    });
  }
  
  return alerts;
}
