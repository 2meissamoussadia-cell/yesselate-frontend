/**
 * Workflow des états d'une Validation (logique type Odoo)
 *
 * Définit les états et transitions pour le circuit de validation.
 * Aligné sur ValidationStatut dans gouvernance.types.
 */

import type { ValidationStatut } from '../types/gouvernance.types';

/** États possibles d'une validation */
export const VALIDATION_STATES = ['pending', 'approved', 'rejected', 'cancelled'] as const;

export type ValidationState = (typeof VALIDATION_STATES)[number];

/** Transitions autorisées : from -> to[] */
export const VALIDATION_TRANSITIONS: Record<ValidationState, ValidationState[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: [],
  rejected: ['pending'],
  cancelled: [],
};

/** Libellés métier des états */
export const VALIDATION_STATE_LABELS: Record<ValidationState, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  cancelled: 'Annulée',
};

/** Actions possibles sur une validation */
export type ValidationAction = 'approuver' | 'rejeter' | 'annuler' | 'reouvrir';

export const VALIDATION_ACTION_TO_STATE: Partial<Record<ValidationAction, ValidationState>> = {
  approuver: 'approved',
  rejeter: 'rejected',
  annuler: 'cancelled',
  reouvrir: 'pending',
};

export function canTransitionValidation(
  from: ValidationStatut | ValidationState,
  to: ValidationState
): boolean {
  const allowed = VALIDATION_TRANSITIONS[from as ValidationState];
  return Array.isArray(allowed) && allowed.includes(to);
}

export function canPerformValidationAction(
  statut: ValidationStatut | ValidationState,
  action: ValidationAction
): boolean {
  const targetState = VALIDATION_ACTION_TO_STATE[action];
  if (!targetState) return false;
  return canTransitionValidation(statut, targetState);
}

export function getAvailableValidationActions(
  statut: ValidationStatut | ValidationState
): ValidationAction[] {
  const actions: ValidationAction[] = [];
  if (canPerformValidationAction(statut, 'approuver')) actions.push('approuver');
  if (canPerformValidationAction(statut, 'rejeter')) actions.push('rejeter');
  if (canPerformValidationAction(statut, 'annuler')) actions.push('annuler');
  if (canPerformValidationAction(statut, 'reouvrir')) actions.push('reouvrir');
  return actions;
}
