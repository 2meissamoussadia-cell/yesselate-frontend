/**
 * Règles de validation pour le calendrier
 */

import type { Evenement, Absence } from '../types/calendrier.types';

export class ValidationRules {
  /**
   * Valide un événement
   */
  static validateEvenement(evenement: Partial<Evenement>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!evenement.titre || evenement.titre.trim().length === 0) {
      errors.push('Le titre est requis');
    }

    if (!evenement.date_debut) {
      errors.push('La date de début est requise');
    }

    if (!evenement.date_fin) {
      errors.push('La date de fin est requise');
    }

    if (evenement.date_debut && evenement.date_fin) {
      const debut = new Date(evenement.date_debut);
      const fin = new Date(evenement.date_fin);
      
      if (fin <= debut) {
        errors.push('La date de fin doit être après la date de début');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valide une absence
   */
  static validateAbsence(absence: Partial<Absence>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!absence.user_id) {
      errors.push('L\'utilisateur est requis');
    }

    if (!absence.date_debut) {
      errors.push('La date de début est requise');
    }

    if (!absence.date_fin) {
      errors.push('La date de fin est requise');
    }

    if (absence.date_debut && absence.date_fin) {
      const debut = new Date(absence.date_debut);
      const fin = new Date(absence.date_fin);
      
      if (fin < debut) {
        errors.push('La date de fin doit être après ou égale à la date de début');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
