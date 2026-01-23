/**
 * Service pour la récurrence des événements
 */

import type { Recurrence, RecurrencePattern } from '../types/recurrence.types';
import {
  generateRecurrenceDates,
  calculateNextOccurrence,
  isRecurrenceInfinite,
} from '../types/recurrence.types';

export class RecurrenceService {
  /**
   * Génère les dates de récurrence
   */
  static generateDates(
    startDate: Date,
    recurrence: Recurrence,
    endDate?: Date,
    maxOccurrences: number = 100
  ): Date[] {
    return generateRecurrenceDates(startDate, recurrence, endDate, maxOccurrences);
  }

  /**
   * Calcule la prochaine occurrence
   */
  static calculateNext(startDate: Date, recurrence: Recurrence): Date | undefined {
    return calculateNextOccurrence(startDate, recurrence);
  }

  /**
   * Vérifie si la récurrence est infinie
   */
  static isInfinite(recurrence: Recurrence): boolean {
    return isRecurrenceInfinite(recurrence);
  }

  /**
   * Valide une configuration de récurrence
   */
  static validate(recurrence: Recurrence): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!recurrence.type || recurrence.type === 'none') {
      return { valid: true, errors: [] };
    }

    // Validation selon type
    switch (recurrence.type) {
      case 'weekly':
        if (recurrence.daysOfWeek && recurrence.daysOfWeek.length === 0) {
          errors.push('daysOfWeek doit contenir au moins un jour pour weekly');
        }
        break;

      case 'monthly':
        if (recurrence.dayOfMonth && (recurrence.dayOfMonth < 1 || recurrence.dayOfMonth > 31)) {
          errors.push('dayOfMonth doit être entre 1 et 31');
        }
        break;

      case 'yearly':
        if (recurrence.monthOfYear && (recurrence.monthOfYear < 1 || recurrence.monthOfYear > 12)) {
          errors.push('monthOfYear doit être entre 1 et 12');
        }
        break;
    }

    // Validation interval
    if (recurrence.interval && recurrence.interval < 1) {
      errors.push('interval doit être >= 1');
    }

    // Validation count
    if (recurrence.count && recurrence.count < 1) {
      errors.push('count doit être >= 1');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Crée un pattern de récurrence
   */
  static createPattern(
    startDate: Date,
    recurrence: Recurrence,
    endDate?: Date
  ): RecurrencePattern {
    const occurrences = this.generateDates(startDate, recurrence, endDate);
    const nextOccurrence = this.calculateNext(startDate, recurrence);
    const isInfinite = this.isInfinite(recurrence);

    return {
      recurrence,
      occurrences,
      nextOccurrence,
      isInfinite,
    };
  }
}
