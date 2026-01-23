/**
 * Service pour les risques de gouvernance
 */

import type { Risque, RisqueMetrics, RisqueAlert } from '../types/risque.types';
import {
  calculateRisqueScore,
  calculateRisqueCriticite,
  isRisqueCritical,
  isRisqueHigh,
  calculateRisqueMetrics,
  getRisqueAlerts,
} from '../types/risque.types';

export class RisqueService {
  /**
   * Calcule les métriques d'un risque
   */
  static calculateMetrics(risque: Risque): RisqueMetrics {
    return calculateRisqueMetrics(risque);
  }

  /**
   * Récupère les alertes d'un risque
   */
  static getAlerts(risque: Risque): RisqueAlert[] {
    return getRisqueAlerts(risque);
  }

  /**
   * Identifie les risques critiques
   */
  static getCriticalRisques(risques: Risque[]): Risque[] {
    return risques.filter(r => isRisqueCritical(r));
  }

  /**
   * Identifie les risques élevés (critiques + high)
   */
  static getHighRisques(risques: Risque[]): Risque[] {
    return risques.filter(r => isRisqueHigh(r));
  }

  /**
   * Calcule l'exposition financière totale
   */
  static calculateExpositionFinanciere(risques: Risque[]): number {
    return risques.reduce((sum, r) => {
      const metrics = this.calculateMetrics(r);
      return sum + metrics.exposition;
    }, 0);
  }

  /**
   * Calcule le score de risque moyen
   */
  static calculateAverageScore(risques: Risque[]): number {
    if (risques.length === 0) return 0;

    const totalScore = risques.reduce((sum, r) => {
      return sum + calculateRisqueScore(r);
    }, 0);

    return Math.round(totalScore / risques.length);
  }

  /**
   * Filtre les risques selon les critères
   */
  static filterRisques(
    risques: Risque[],
    filters: {
      bureau?: string;
      projet_id?: number;
      severite?: string;
      statut?: string;
    }
  ): Risque[] {
    let filtered = [...risques];

    if (filters.bureau) {
      filtered = filtered.filter(r => r.bureau === filters.bureau);
    }

    if (filters.projet_id) {
      filtered = filtered.filter(r => r.projet_id === filters.projet_id);
    }

    if (filters.severite) {
      filtered = filtered.filter(r => r.severite === filters.severite);
    }

    if (filters.statut) {
      filtered = filtered.filter(r => r.statut === filters.statut);
    }

    return filtered;
  }

  /**
   * Trie les risques par criticité
   */
  static sortByCriticite(risques: Risque[]): Risque[] {
    const criticiteOrder: Record<string, number> = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1,
    };

    return [...risques].sort((a, b) => {
      const aCriticite = calculateRisqueCriticite(a);
      const bCriticite = calculateRisqueCriticite(b);
      
      const criticiteDiff = (criticiteOrder[bCriticite] || 0) - (criticiteOrder[aCriticite] || 0);
      if (criticiteDiff !== 0) return criticiteDiff;
      
      // Ensuite par score
      const scoreDiff = calculateRisqueScore(b) - calculateRisqueScore(a);
      return scoreDiff;
    });
  }
}
