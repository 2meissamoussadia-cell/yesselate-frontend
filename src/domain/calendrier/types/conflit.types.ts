/**
 * Types spécifiques pour les conflits du calendrier
 */

import type { Evenement, Absence, Affectation } from './calendrier.types';

export type ConflitType =
  | 'overlap_time'      // Chevauchement temporel
  | 'overlap_resource'  // Même ressource sur deux événements
  | 'overlap_location'   // Même lieu en même temps
  | 'absence_conflict'   // Événement pendant absence
  | 'overallocation'     // Sur-allocation ressource
  | 'sla_conflict'       // Conflit avec échéance SLA
  | 'holiday_conflict';  // Événement jour férié

export interface Conflit {
  id: string;
  type: ConflitType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  evenement_id?: number;
  absence_id?: number;
  affectation_id?: number;
  jalon_id?: number;
  resource_id?: number;
  date_debut: string;
  date_fin: string;
  can_auto_resolve: boolean;
  resolution_suggestions?: string[];
}

export interface ConflitDetectionResult {
  conflits: Conflit[];
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export function calculateConflitSeverity(conflit: Conflit): 'low' | 'medium' | 'high' | 'critical' {
  // Logique de calcul de sévérité selon le type
  switch (conflit.type) {
    case 'overallocation':
    case 'sla_conflict':
      return 'critical';
    case 'overlap_resource':
    case 'absence_conflict':
      return 'high';
    case 'overlap_time':
    case 'overlap_location':
      return 'medium';
    case 'holiday_conflict':
      return 'low';
    default:
      return 'medium';
  }
}

export function canAutoResolveConflit(conflit: Conflit): boolean {
  // Logique métier: certains conflits peuvent être auto-résolus
  switch (conflit.type) {
    case 'overlap_time':
      // Peut être résolu en décalant l'événement
      return true;
    case 'holiday_conflict':
      // Peut être résolu en reportant
      return true;
    default:
      return false;
  }
}

export function getResolutionSuggestions(conflit: Conflit): string[] {
  const suggestions: string[] = [];
  
  switch (conflit.type) {
    case 'overlap_time':
      suggestions.push('Décaler l\'un des événements');
      suggestions.push('Réduire la durée d\'un événement');
      suggestions.push('Annuler l\'événement le moins prioritaire');
      break;
    case 'overlap_resource':
      suggestions.push('Réassigner la ressource');
      suggestions.push('Décaler l\'un des événements');
      break;
    case 'overallocation':
      suggestions.push('Réduire la charge de la ressource');
      suggestions.push('Réassigner certaines tâches');
      break;
    case 'absence_conflict':
      suggestions.push('Reporter l\'événement après l\'absence');
      suggestions.push('Déléguer à une autre personne');
      break;
    case 'sla_conflict':
      suggestions.push('Prioriser le SLA');
      suggestions.push('Réorganiser les autres événements');
      break;
  }
  
  return suggestions;
}
