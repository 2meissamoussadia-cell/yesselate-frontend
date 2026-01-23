/**
 * Règles métier pour les validations de gouvernance
 */

import type { Validation } from '../types/validation.types';
import { isValidationOverdue, calculateValidationPriorite } from '../types/validation.types';

export class ValidationRules {
  /**
   * Vérifie si une validation nécessite une action urgente
   */
  static requiresUrgentAction(validation: Validation): boolean {
    return isValidationOverdue(validation) || calculateValidationPriorite(validation) === 'urgent';
  }

  /**
   * Vérifie si une validation peut être auto-validée
   */
  static canAutoValidate(validation: Validation): boolean {
    // Logique métier: auto-validation uniquement pour certains types et montants
    if (validation.type === 'AUTRE') return false;
    if (validation.statut !== 'pending') return false;
    
    // À adapter selon règles métier réelles
    return false;
  }

  /**
   * Détermine le délai maximum acceptable pour une validation
   */
  static getMaxWaitDays(validation: Validation): number {
    // Logique métier: délai selon type
    switch (validation.type) {
      case 'BC':
        return 7; // 7 jours pour BC
      case 'AVENANT':
        return 14; // 14 jours pour avenant
      case 'AUTORISATION':
        return 5; // 5 jours pour autorisation
      default:
        return 7; // Par défaut 7 jours
    }
  }

  /**
   * Vérifie si une validation est en retard
   */
  static isOverdue(validation: Validation): boolean {
    return isValidationOverdue(validation);
  }
}
