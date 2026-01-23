/**
 * Service pour les projets de gouvernance
 */

import type { Projet, ProjetMetrics, ProjetSummary, ProjetComparison } from '../types/projet.types';
import { calculateProjetHealthScore, isProjetAtRisk, isProjetLate } from '../types/projet.types';

export class ProjetService {
  /**
   * Calcule les métriques d'un projet
   */
  static calculateMetrics(projet: Projet): ProjetMetrics {
    const healthScore = calculateProjetHealthScore(projet);
    
    return {
      budget_consomme_pourcent: projet.budget_pourcent,
      jalons_respectes_pourcent: projet.jalons_total > 0
        ? (projet.jalons_valides / projet.jalons_total) * 100
        : 100,
      risques_critiques_count: projet.risques_critiques_count,
      retard_jours: projet.retard_jours,
      is_at_risk: isProjetAtRisk(projet),
      is_late: isProjetLate(projet),
      health_score: healthScore,
    };
  }

  /**
   * Génère un résumé complet d'un projet
   */
  static generateSummary(projet: Projet): ProjetSummary {
    const metrics = this.calculateMetrics(projet);
    const alerts: string[] = [];
    const recommendations: string[] = [];

    // Générer alertes
    if (metrics.is_late) {
      alerts.push(`Projet en retard de ${metrics.retard_jours || 0} jour(s)`);
    }
    if (metrics.is_at_risk) {
      alerts.push('Projet à risque');
    }
    if (metrics.budget_consomme_pourcent > 90) {
      alerts.push(`Budget critique: ${metrics.budget_consomme_pourcent.toFixed(1)}% consommé`);
    }
    if (metrics.risques_critiques_count > 0) {
      alerts.push(`${metrics.risques_critiques_count} risque(s) critique(s)`);
    }

    // Générer recommandations
    if (metrics.budget_consomme_pourcent > 75) {
      recommendations.push('Réviser le budget et identifier des économies potentielles');
    }
    if (metrics.jalons_respectes_pourcent < 70) {
      recommendations.push('Accélérer la réalisation des jalons en retard');
    }
    if (metrics.risques_critiques_count > 0) {
      recommendations.push('Mettre en place un plan de mitigation pour les risques critiques');
    }
    if (metrics.is_late && metrics.retard_jours && metrics.retard_jours > 14) {
      recommendations.push('Escalader le projet et réviser le planning');
    }

    return {
      projet,
      metrics,
      alerts,
      recommendations,
    };
  }

  /**
   * Compare un projet avec la moyenne et la période précédente
   */
  static compareProjet(
    projet: Projet,
    projets: Projet[]
  ): ProjetComparison {
    // Calculer moyennes
    const avgBudgetPourcent = projets.length > 0
      ? projets.reduce((sum, p) => sum + p.budget_pourcent, 0) / projets.length
      : 0;

    const avgJalonsPourcent = projets.length > 0
      ? projets.reduce((sum, p) => {
          const pourcent = p.jalons_total > 0
            ? (p.jalons_valides / p.jalons_total) * 100
            : 100;
          return sum + pourcent;
        }, 0) / projets.length
      : 100;

    const avgRetardJours = projets.length > 0
      ? projets.reduce((sum, p) => sum + (p.retard_jours || 0), 0) / projets.length
      : 0;

    const projetJalonsPourcent = projet.jalons_total > 0
      ? (projet.jalons_valides / projet.jalons_total) * 100
      : 100;

    return {
      projet,
      vs_average: {
        budget_consomme_pourcent: projet.budget_pourcent - avgBudgetPourcent,
        jalons_respectes_pourcent: projetJalonsPourcent - avgJalonsPourcent,
        retard_jours: (projet.retard_jours || 0) - avgRetardJours,
      },
      vs_previous_period: {
        // À implémenter avec données historiques
        budget_consomme_pourcent: 0,
        jalons_respectes_pourcent: 0,
      },
    };
  }

  /**
   * Filtre les projets selon les critères
   */
  static filterProjets(
    projets: Projet[],
    filters: {
      bureau?: string;
      statut?: string;
      search?: string;
    }
  ): Projet[] {
    let filtered = [...projets];

    if (filters.bureau) {
      filtered = filtered.filter(p => p.bureau === filters.bureau);
    }

    if (filters.statut) {
      filtered = filtered.filter(p => p.statut === filters.statut);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(searchLower) ||
        p.code?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  /**
   * Trie les projets par priorité
   */
  static sortByPriority(projets: Projet[]): Projet[] {
    return [...projets].sort((a, b) => {
      // Priorité: late > at-risk > on-track
      const priorityOrder: Record<string, number> = {
        'late': 3,
        'at-risk': 2,
        'on-track': 1,
        'blocked': 4,
        'completed': 0,
      };

      const priorityDiff = (priorityOrder[b.statut] || 0) - (priorityOrder[a.statut] || 0);
      if (priorityDiff !== 0) return priorityDiff;

      // Ensuite par retard
      const retardDiff = (b.retard_jours || 0) - (a.retard_jours || 0);
      if (retardDiff !== 0) return retardDiff;

      // Ensuite par risques critiques
      return (b.risques_critiques_count || 0) - (a.risques_critiques_count || 0);
    });
  }
}
