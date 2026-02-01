/**
 * Service pour la détection de conflits du calendrier
 */

import type {
  CalendrierData,
  Evenement,
  Absence,
  Affectation,
} from '../types/calendrier.types';
import type {
  Conflit,
  ConflitDetectionResult,
  ConflitType,
} from '../types/conflit.types';
import {
  calculateConflitSeverity,
  canAutoResolveConflit,
  getResolutionSuggestions,
} from '../types/conflit.types';

export class ConflitService {
  /**
   * Détecte tous les conflits dans les données du calendrier
   */
  static detectAllConflits(data: CalendrierData): ConflitDetectionResult {
    const conflits: Conflit[] = [];

    // Détecter conflits temporels (overlap)
    conflits.push(...this.detectOverlapConflits(data.evenements));

    // Détecter conflits avec absences
    conflits.push(...this.detectAbsenceConflits(data.evenements, data.absences));

    // Détecter sur-allocations
    conflits.push(...this.detectOverallocationConflits(data.affectations));

    // Compter par sévérité
    const critical = conflits.filter(c => c.severity === 'critical').length;
    const high = conflits.filter(c => c.severity === 'high').length;
    const medium = conflits.filter(c => c.severity === 'medium').length;
    const low = conflits.filter(c => c.severity === 'low').length;

    return {
      conflits,
      total: conflits.length,
      critical,
      high,
      medium,
      low,
    };
  }

  /**
   * Détecte les conflits de chevauchement temporel
   */
  static detectOverlapConflits(evenements: Evenement[]): Conflit[] {
    const conflits: Conflit[] = [];

    for (let i = 0; i < evenements.length; i++) {
      for (let j = i + 1; j < evenements.length; j++) {
        const e1 = evenements[i];
        const e2 = evenements[j];

        if (!e1.date_debut || !e1.date_fin || !e2.date_debut || !e2.date_fin) continue;

        const debut1 = new Date(e1.date_debut);
        const fin1 = new Date(e1.date_fin);
        const debut2 = new Date(e2.date_debut);
        const fin2 = new Date(e2.date_fin);

        // Vérifier chevauchement
        if ((debut1 < fin2 && fin1 > debut2)) {
          const conflit: Conflit = {
            id: `overlap-${e1.id}-${e2.id}`,
            type: 'overlap_time',
            severity: 'medium',
            message: `Chevauchement entre "${e1.titre}" et "${e2.titre}"`,
            evenement_id: e1.id,
            date_debut: e1.date_debut,
            date_fin: e1.date_fin,
            can_auto_resolve: canAutoResolveConflit({
              id: '',
              type: 'overlap_time',
              severity: 'medium',
              message: '',
              date_debut: '',
              date_fin: '',
              can_auto_resolve: false,
            }),
            resolution_suggestions: getResolutionSuggestions({
              id: '',
              type: 'overlap_time',
              severity: 'medium',
              message: '',
              date_debut: '',
              date_fin: '',
              can_auto_resolve: false,
            }),
          };
          conflit.severity = calculateConflitSeverity(conflit);
          conflits.push(conflit);
        }
      }
    }

    return conflits;
  }

  /**
   * Détecte les conflits avec les absences
   */
  static detectAbsenceConflits(
    evenements: Evenement[],
    absences: Absence[]
  ): Conflit[] {
    const conflits: Conflit[] = [];

    for (const evenement of evenements) {
      if (!evenement.date_debut || !evenement.date_fin) continue;

      const debutEvent = new Date(evenement.date_debut);
      const finEvent = new Date(evenement.date_fin);

      for (const absence of absences) {
        if (!absence.date_debut || !absence.date_fin) continue;
        if (absence.statut !== 'VALIDE') continue;

        const debutAbsence = new Date(absence.date_debut);
        const finAbsence = new Date(absence.date_fin);

        // Vérifier si l'événement chevauche avec l'absence
        if (debutEvent <= finAbsence && finEvent >= debutAbsence) {
          const conflit: Conflit = {
            id: `absence-${evenement.id}-${absence.id}`,
            type: 'absence_conflict',
            severity: 'high',
            message: `Événement "${evenement.titre}" pendant l'absence de ${absence.employe_nom || 'l\'employé'}`,
            evenement_id: evenement.id,
            absence_id: absence.id,
            date_debut: evenement.date_debut,
            date_fin: evenement.date_fin,
            can_auto_resolve: canAutoResolveConflit({
              id: '',
              type: 'absence_conflict',
              severity: 'high',
              message: '',
              date_debut: '',
              date_fin: '',
              can_auto_resolve: false,
            }),
            resolution_suggestions: getResolutionSuggestions({
              id: '',
              type: 'absence_conflict',
              severity: 'high',
              message: '',
              date_debut: '',
              date_fin: '',
              can_auto_resolve: false,
            }),
          };
          conflit.severity = calculateConflitSeverity(conflit);
          conflits.push(conflit);
        }
      }
    }

    return conflits;
  }

  /**
   * Détecte les sur-allocations de ressources
   */
  static detectOverallocationConflits(affectations: Affectation[]): Conflit[] {
    const conflits: Conflit[] = [];

    // Grouper par user_id
    const byUser = new Map<number, Affectation[]>();
    affectations.forEach(a => {
      if (!byUser.has(a.user_id)) {
        byUser.set(a.user_id, []);
      }
      byUser.get(a.user_id)!.push(a);
    });

    // Vérifier sur-allocations
    byUser.forEach((affects, userId) => {
      const surAlloces = affects.filter(a => a.est_suralloue);
      
      if (surAlloces.length > 0) {
        surAlloces.forEach(affect => {
          const conflit: Conflit = {
            id: `overallocation-${affect.id}`,
            type: 'overallocation',
            severity: 'critical',
            message: `Sur-allocation de la ressource ${affect.user_nom || `ID ${userId}`}`,
            affectation_id: affect.id,
            resource_id: userId,
            date_debut: affect.date_debut || '',
            date_fin: affect.date_fin || '',
            can_auto_resolve: canAutoResolveConflit({
              id: '',
              type: 'overallocation',
              severity: 'critical',
              message: '',
              date_debut: '',
              date_fin: '',
              can_auto_resolve: false,
            }),
            resolution_suggestions: getResolutionSuggestions({
              id: '',
              type: 'overallocation',
              severity: 'critical',
              message: '',
              date_debut: '',
              date_fin: '',
              can_auto_resolve: false,
            }),
          };
          conflit.severity = calculateConflitSeverity(conflit);
          conflits.push(conflit);
        });
      }
    });

    return conflits;
  }

  /**
   * Vérifie les conflits pour un nouvel événement
   */
  static checkNewEvent(
    newEvent: Evenement,
    existingData: CalendrierData
  ): ConflitDetectionResult {
    // Créer données temporaires avec le nouvel événement
    const tempData: CalendrierData = {
      evenements: [...existingData.evenements, newEvent],
      jalons: existingData.jalons,
      absences: existingData.absences,
      affectations: existingData.affectations,
      alertes: existingData.alertes,
    };

    // Détecter conflits
    return this.detectAllConflits(tempData);
  }

  /**
   * Résout automatiquement un conflit si possible
   */
  static autoResolveConflit(conflit: Conflit): {
    resolved: boolean;
    action?: string;
    newDate?: string;
  } {
    if (!conflit.can_auto_resolve) {
      return { resolved: false };
    }

    // Logique de résolution automatique selon le type
    switch (conflit.type) {
      case 'overlap_time':
        // Décaler de 1 heure
        if (conflit.evenement_id) {
          // Logique à implémenter avec données réelles
          return {
            resolved: true,
            action: 'Décaler l\'événement de 1 heure',
          };
        }
        break;
      
      case 'holiday_conflict':
        return {
          resolved: true,
          action: 'Reporter au prochain jour ouvrable',
        };
      
      default:
        return { resolved: false };
    }

    return { resolved: false };
  }
}
