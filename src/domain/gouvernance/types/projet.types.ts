/**
 * Types spécifiques pour les projets de gouvernance
 */

import type { Projet, ProjetStatut } from './gouvernance.types';

export interface ProjetMetrics {
  budget_consomme_pourcent: number;
  jalons_respectes_pourcent: number;
  risques_critiques_count: number;
  retard_jours?: number;
  is_at_risk: boolean;
  is_late: boolean;
  health_score: number; // 0-100
}

export interface ProjetSummary {
  projet: Projet;
  metrics: ProjetMetrics;
  alerts: string[];
  recommendations: string[];
}

export interface ProjetComparison {
  projet: Projet;
  vs_average: {
    budget_consomme_pourcent: number; // Différence avec moyenne
    jalons_respectes_pourcent: number;
    retard_jours: number;
  };
  vs_previous_period: {
    budget_consomme_pourcent: number;
    jalons_respectes_pourcent: number;
  };
}

export function isProjetAtRisk(projet: Projet): boolean {
  return (
    projet.statut === 'at-risk' ||
    projet.budget_pourcent > 90 ||
    (projet.retard_jours && projet.retard_jours > 7) ||
    projet.risques_critiques_count > 0
  );
}

export function isProjetLate(projet: Projet): boolean {
  return projet.statut === 'late' || (projet.retard_jours && projet.retard_jours > 0);
}

export function calculateProjetHealthScore(projet: Projet): number {
  let score = 100;
  
  // Pénalité budget
  if (projet.budget_pourcent > 100) score -= 30;
  else if (projet.budget_pourcent > 90) score -= 20;
  else if (projet.budget_pourcent > 75) score -= 10;
  
  // Pénalité jalons
  const jalons_respectes_pourcent = projet.jalons_total > 0
    ? (projet.jalons_valides / projet.jalons_total) * 100
    : 100;
  if (jalons_respectes_pourcent < 50) score -= 30;
  else if (jalons_respectes_pourcent < 70) score -= 20;
  else if (jalons_respectes_pourcent < 85) score -= 10;
  
  // Pénalité retard
  if (projet.retard_jours) {
    if (projet.retard_jours > 30) score -= 30;
    else if (projet.retard_jours > 14) score -= 20;
    else if (projet.retard_jours > 7) score -= 10;
  }
  
  // Pénalité risques
  if (projet.risques_critiques_count > 3) score -= 20;
  else if (projet.risques_critiques_count > 1) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}
