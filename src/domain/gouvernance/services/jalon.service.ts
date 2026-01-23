/**
 * Service pour les jalons de gouvernance
 */

import type { Jalon, JalonMetrics, JalonAlert } from '../types/jalon.types';
import {
  calculateRetardJours,
  isJalonOverdue,
  isJalonSLARisque,
  calculateJalonMetrics,
  getJalonAlerts,
} from '../types/jalon.types';

export class JalonService {
  /**
   * Calcule les métriques d'un jalon
   */
  static calculateMetrics(jalon: Jalon): JalonMetrics {
    return calculateJalonMetrics(jalon);
  }

  /**
   * Récupère les alertes d'un jalon
   */
  static getAlerts(jalon: Jalon): JalonAlert[] {
    return getJalonAlerts(jalon);
  }

  /**
   * Identifie les jalons en retard
   */
  static getOverdueJalons(jalons: Jalon[]): Jalon[] {
    return jalons.filter(j => isJalonOverdue(j));
  }

  /**
   * Identifie les jalons SLA à risque
   */
  static getSLARisqueJalons(jalons: Jalon[]): Jalon[] {
    return jalons.filter(j => isJalonSLARisque(j));
  }

  /**
   * Calcule le pourcentage de jalons respectés
   */
  static calculateRespectRate(jalons: Jalon[]): number {
    if (jalons.length === 0) return 100;

    const completed = jalons.filter(j => j.statut === 'completed').length;
    return (completed / jalons.length) * 100;
  }

  /**
   * Calcule le nombre de jours de retard moyen
   */
  static calculateAverageDelay(jalons: Jalon[]): number {
    const overdueJalons = this.getOverdueJalons(jalons);
    if (overdueJalons.length === 0) return 0;

    const totalDelay = overdueJalons.reduce((sum, j) => {
      return sum + calculateRetardJours(j);
    }, 0);

    return Math.round(totalDelay / overdueJalons.length);
  }

  /**
   * Filtre les jalons selon les critères
   */
  static filterJalons(
    jalons: Jalon[],
    filters: {
      bureau?: string;
      projet_id?: number;
      type?: string;
      statut?: string;
      est_retard?: boolean;
      est_sla_risque?: boolean;
    }
  ): Jalon[] {
    let filtered = [...jalons];

    if (filters.bureau) {
      filtered = filtered.filter(j => j.bureau === filters.bureau);
    }

    if (filters.projet_id) {
      filtered = filtered.filter(j => j.projet_id === filters.projet_id);
    }

    if (filters.type) {
      filtered = filtered.filter(j => j.type === filters.type);
    }

    if (filters.statut) {
      filtered = filtered.filter(j => j.statut === filters.statut);
    }

    if (filters.est_retard !== undefined) {
      filtered = filtered.filter(j => isJalonOverdue(j) === filters.est_retard);
    }

    if (filters.est_sla_risque !== undefined) {
      filtered = filtered.filter(j => isJalonSLARisque(j) === filters.est_sla_risque);
    }

    return filtered;
  }

  /**
   * Trie les jalons par priorité (retard > SLA risque > autres)
   */
  static sortByPriority(jalons: Jalon[]): Jalon[] {
    return [...jalons].sort((a, b) => {
      const aOverdue = isJalonOverdue(a);
      const bOverdue = isJalonOverdue(b);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      const aSLARisque = isJalonSLARisque(a);
      const bSLARisque = isJalonSLARisque(b);
      
      if (aSLARisque && !bSLARisque) return -1;
      if (!aSLARisque && bSLARisque) return 1;
      
      // Ensuite par date prévue
      if (a.date_prevue && b.date_prevue) {
        return new Date(a.date_prevue).getTime() - new Date(b.date_prevue).getTime();
      }
      
      return 0;
    });
  }
}
