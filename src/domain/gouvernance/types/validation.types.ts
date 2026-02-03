/**
 * Types spécifiques pour les validations de gouvernance
 */

import type { Validation, ValidationStatut } from './gouvernance.types';
export type { Validation, ValidationStatut } from './gouvernance.types';

export interface ValidationMetrics {
  is_overdue: boolean;
  jours_attente: number;
  priorite: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ValidationAlert {
  type: 'overdue' | 'urgent' | 'pending';
  message: string;
  action_required: boolean;
}

export function calculateJoursAttente(validation: Validation): number {
  if (!validation.date_demande) return 0;
  if (validation.statut !== 'pending') return 0;
  
  const dateDemande = new Date(validation.date_demande);
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  dateDemande.setHours(0, 0, 0, 0);
  
  return Math.floor((aujourdhui.getTime() - dateDemande.getTime()) / (1000 * 60 * 60 * 24));
}

export function isValidationOverdue(validation: Validation): boolean {
  const joursAttente = calculateJoursAttente(validation);
  // Considéré en retard si > 7 jours
  return joursAttente > 7;
}

export function calculateValidationPriorite(validation: Validation): 'low' | 'medium' | 'high' | 'urgent' {
  const joursAttente = calculateJoursAttente(validation);
  
  if (joursAttente > 14) return 'urgent';
  if (joursAttente > 7) return 'high';
  if (joursAttente > 3) return 'medium';
  return 'low';
}

export function calculateValidationMetrics(validation: Validation): ValidationMetrics {
  const joursAttente = calculateJoursAttente(validation);
  
  return {
    is_overdue: isValidationOverdue(validation),
    jours_attente: joursAttente,
    priorite: calculateValidationPriorite(validation),
  };
}

export function getValidationAlerts(validation: Validation): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const metrics = calculateValidationMetrics(validation);
  
  if (metrics.is_overdue) {
    alerts.push({
      type: 'overdue',
      message: `Validation en retard de ${metrics.jours_attente - 7} jour(s)`,
      action_required: true,
    });
  } else if (metrics.priorite === 'urgent') {
    alerts.push({
      type: 'urgent',
      message: `Validation urgente: ${metrics.jours_attente} jour(s) d'attente`,
      action_required: true,
    });
  } else if (metrics.priorite === 'high') {
    alerts.push({
      type: 'pending',
      message: `Validation en attente depuis ${metrics.jours_attente} jour(s)`,
      action_required: false,
    });
  }
  
  return alerts;
}
