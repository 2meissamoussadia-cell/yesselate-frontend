/**
 * Service pour les SLA du calendrier
 */

import type { Jalon, SLAMetrics, SLAAlert } from '../types/sla.types';
import {
  calculateSLAMetrics,
  getSLAAlerts,
  isSLAAtRisk,
  isSLAOverdue,
  calculateJoursRestantsSLA,
} from '../types/sla.types';

export class SLAService {
  /**
   * Calcule les métriques d'un jalon SLA
   */
  static calculateMetrics(jalon: Jalon): SLAMetrics {
    return calculateSLAMetrics(jalon);
  }

  /**
   * Récupère les alertes d'un jalon SLA
   */
  static getAlerts(jalon: Jalon): SLAAlert[] {
    return getSLAAlerts(jalon);
  }

  /**
   * Identifie les jalons SLA à risque
   */
  static getAtRiskJalons(jalons: Jalon[]): Jalon[] {
    return jalons.filter(j => isSLAAtRisk(j));
  }

  /**
   * Identifie les jalons SLA en retard
   */
  static getOverdueJalons(jalons: Jalon[]): Jalon[] {
    return jalons.filter(j => isSLAOverdue(j));
  }

  /**
   * Calcule le taux de conformité SLA
   */
  static calculateConformityRate(jalons: Jalon[]): number {
    const jalonsSLA = jalons.filter(j => j.type === 'SLA');
    if (jalonsSLA.length === 0) return 100;

    const jalonsTermines = jalonsSLA.filter(j => j.statut === 'Terminé');
    const jalonsEnRetard = jalonsSLA.filter(j => isSLAOverdue(j));
    
    // Conformité = (terminés - en retard) / total
    const conformes = jalonsTermines.length - jalonsEnRetard.length;
    return Math.max(0, (conformes / jalonsSLA.length) * 100);
  }

  /**
   * Calcule le nombre moyen de jours restants pour les SLA
   */
  static calculateAverageDaysRemaining(jalons: Jalon[]): number {
    const jalonsSLA = jalons.filter(j => j.type === 'SLA' && j.statut !== 'Terminé');
    if (jalonsSLA.length === 0) return 0;

    const totalJours = jalonsSLA.reduce((sum, j) => {
      return sum + Math.max(0, calculateJoursRestantsSLA(j));
    }, 0);

    return Math.round(totalJours / jalonsSLA.length);
  }

  /**
   * Filtre les jalons SLA selon les critères
   */
  static filterSLAJalons(
    jalons: Jalon[],
    filters: {
      est_retard?: boolean;
      est_sla_risque?: boolean;
      statut?: string;
    }
  ): Jalon[] {
    let filtered = jalons.filter(j => j.type === 'SLA');

    if (filters.est_retard !== undefined) {
      filtered = filtered.filter(j => isSLAOverdue(j) === filters.est_retard);
    }

    if (filters.est_sla_risque !== undefined) {
      filtered = filtered.filter(j => isSLAAtRisk(j) === filters.est_sla_risque);
    }

    if (filters.statut) {
      filtered = filtered.filter(j => j.statut === filters.statut);
    }

    return filtered;
  }

  /**
   * Trie les jalons SLA par priorité (retard > à risque > autres)
   */
  static sortByPriority(jalons: Jalon[]): Jalon[] {
    return [...jalons].filter(j => j.type === 'SLA').sort((a, b) => {
      const aOverdue = isSLAOverdue(a);
      const bOverdue = isSLAOverdue(b);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      const aAtRisk = isSLAAtRisk(a);
      const bAtRisk = isSLAAtRisk(b);
      
      if (aAtRisk && !bAtRisk) return -1;
      if (!aAtRisk && bAtRisk) return 1;
      
      // Ensuite par jours restants
      const aJours = calculateJoursRestantsSLA(a);
      const bJours = calculateJoursRestantsSLA(b);
      
      return aJours - bJours;
    });
  }
}
