/**
 * Service pour les validations de gouvernance
 */

import type { Validation, ValidationMetrics, ValidationAlert } from '../types/validation.types';
import {
  calculateJoursAttente,
  isValidationOverdue,
  calculateValidationPriorite,
  calculateValidationMetrics,
  getValidationAlerts,
} from '../types/validation.types';

export class ValidationService {
  /**
   * Calcule les métriques d'une validation
   */
  static calculateMetrics(validation: Validation): ValidationMetrics {
    return calculateValidationMetrics(validation);
  }

  /**
   * Récupère les alertes d'une validation
   */
  static getAlerts(validation: Validation): ValidationAlert[] {
    return getValidationAlerts(validation);
  }

  /**
   * Identifie les validations en retard
   */
  static getOverdueValidations(validations: Validation[]): Validation[] {
    return validations.filter(v => isValidationOverdue(v));
  }

  /**
   * Identifie les validations urgentes
   */
  static getUrgentValidations(validations: Validation[]): Validation[] {
    return validations.filter(v => {
      const priorite = calculateValidationPriorite(v);
      return priorite === 'urgent' || priorite === 'high';
    });
  }

  /**
   * Calcule le nombre moyen de jours d'attente
   */
  static calculateAverageWaitTime(validations: Validation[]): number {
    const pendingValidations = validations.filter(v => v.statut === 'pending');
    if (pendingValidations.length === 0) return 0;

    const totalWaitTime = pendingValidations.reduce((sum, v) => {
      return sum + calculateJoursAttente(v);
    }, 0);

    return Math.round(totalWaitTime / pendingValidations.length);
  }

  /**
   * Filtre les validations selon les critères
   */
  static filterValidations(
    validations: Validation[],
    filters: {
      bureau?: string;
      projet_id?: number;
      statut?: string;
      type?: string;
    }
  ): Validation[] {
    let filtered = [...validations];

    if (filters.bureau) {
      filtered = filtered.filter(v => v.bureau === filters.bureau);
    }

    if (filters.projet_id) {
      filtered = filtered.filter(v => v.projet_id === filters.projet_id);
    }

    if (filters.statut) {
      filtered = filtered.filter(v => v.statut === filters.statut);
    }

    if (filters.type) {
      filtered = filtered.filter(v => v.type === filters.type);
    }

    return filtered;
  }

  /**
   * Trie les validations par priorité
   */
  static sortByPriority(validations: Validation[]): Validation[] {
    const prioriteOrder: Record<string, number> = {
      'urgent': 4,
      'high': 3,
      'medium': 2,
      'low': 1,
    };

    return [...validations].sort((a, b) => {
      const aPriorite = calculateValidationPriorite(a);
      const bPriorite = calculateValidationPriorite(b);
      
      const prioriteDiff = (prioriteOrder[bPriorite] || 0) - (prioriteOrder[aPriorite] || 0);
      if (prioriteDiff !== 0) return prioriteDiff;
      
      // Ensuite par jours d'attente
      const waitDiff = calculateJoursAttente(b) - calculateJoursAttente(a);
      return waitDiff;
    });
  }
}
