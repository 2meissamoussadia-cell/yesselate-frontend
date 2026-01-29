/**
 * Intégration logique métier Validations (domaine gouvernance) → Dashboard
 *
 * Utilise les types et fonctions du domaine gouvernance (validation)
 * pour jours d'attente, priorité et alertes affichés dans les vues.
 */

import type { Validation } from '@/domain/gouvernance/types/gouvernance.types';
import {
  calculateJoursAttente,
  calculateValidationPriorite,
  calculateValidationMetrics,
  getValidationAlerts,
  isValidationOverdue,
} from '@/domain/gouvernance/types/validation.types';
import { VALIDATION_STATE_LABELS } from '@/domain/gouvernance/workflows';
import type { ValidationState } from '@/domain/gouvernance/workflows';

/** Données API type validation (readmodel) */
export interface ValidationDataLike {
  id?: number;
  type?: string;
  objet?: string;
  statut?: string;
  date_demande?: string;
  date_validation?: string;
  bureau?: string;
}

/**
 * Construit une Validation domaine à partir des données API.
 */
export function toDomainValidation(data: ValidationDataLike): Validation {
  const statut = (data.statut?.toLowerCase() ?? 'pending') as Validation['statut'];
  return {
    id: data.id ?? 0,
    type: data.type ?? '',
    objet: data.objet ?? '',
    statut: statut === 'approved' || statut === 'approuvée' ? 'approved' : statut === 'rejected' || statut === 'rejetée' ? 'rejected' : statut === 'cancelled' ? 'cancelled' : 'pending',
    date_demande: data.date_demande,
    date_validation: data.date_validation,
    bureau: data.bureau,
  };
}

/**
 * Jours d'attente (règle domaine).
 */
export function getJoursAttente(data: ValidationDataLike): number {
  return calculateJoursAttente(toDomainValidation(data));
}

/**
 * Priorité calculée (règle domaine).
 */
export function getValidationPriorite(data: ValidationDataLike): 'low' | 'medium' | 'high' | 'urgent' {
  return calculateValidationPriorite(toDomainValidation(data));
}

/**
 * Alertes métier (retard, urgent, etc.).
 */
export function getValidationAlertsFromData(data: ValidationDataLike) {
  return getValidationAlerts(toDomainValidation(data));
}

/**
 * Libellé métier du statut (workflow domaine).
 */
export function getValidationStateLabel(statut: string): string {
  const s = statut?.toLowerCase() ?? 'pending';
  const key = s === 'approved' || s === 'approuvée' ? 'approved' : s === 'rejected' || s === 'rejetée' ? 'rejected' : s === 'cancelled' ? 'cancelled' : 'pending';
  return VALIDATION_STATE_LABELS[key as ValidationState] ?? statut;
}

export {
  calculateJoursAttente,
  calculateValidationPriorite,
  calculateValidationMetrics,
  getValidationAlerts,
  isValidationOverdue,
};
