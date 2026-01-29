/**
 * Workflow des états d'une Demande (logique type Odoo)
 *
 * Définit les états possibles et les transitions autorisées.
 * Utilisé par l'UI pour afficher le cycle de vie et désactiver les actions interdites.
 */

import type { DemandeStatus } from '../types';

/** États possibles d'une demande */
export const DEMANDE_STATES = [
  'pending',
  'in_progress',
  'validated',
  'rejected',
  'cancelled',
] as const;

export type DemandeState = (typeof DEMANDE_STATES)[number];

/** Transitions autorisées : from -> to[] */
export const DEMANDE_TRANSITIONS: Record<DemandeState, DemandeState[]> = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['validated', 'rejected', 'cancelled'],
  validated: [],
  rejected: ['pending'], // re-soumission possible
  cancelled: [],
};

/** Libellés métier des états (pour affichage) */
export const DEMANDE_STATE_LABELS: Record<DemandeState, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  validated: 'Validée',
  rejected: 'Rejetée',
  cancelled: 'Annulée',
};

/** Actions possibles sur une demande (boutons / commandes) */
export type DemandeAction = 'soumettre' | 'valider' | 'rejeter' | 'annuler' | 'reouvrir';

/** Quelle action mène à quel état */
export const DEMANDE_ACTION_TO_STATE: Partial<Record<DemandeAction, DemandeState>> = {
  soumettre: 'in_progress',
  valider: 'validated',
  rejeter: 'rejected',
  annuler: 'cancelled',
  reouvrir: 'pending',
};

/**
 * Indique si une transition est autorisée.
 */
export function canTransition(from: DemandeStatus | DemandeState, to: DemandeState): boolean {
  const allowed = DEMANDE_TRANSITIONS[from as DemandeState];
  return Array.isArray(allowed) && allowed.includes(to);
}

/**
 * Indique si une action est disponible pour l'état actuel.
 */
export function canPerformAction(status: DemandeStatus | DemandeState, action: DemandeAction): boolean {
  const targetState = DEMANDE_ACTION_TO_STATE[action];
  if (!targetState) return false;
  return canTransition(status, targetState);
}

/**
 * Retourne les actions disponibles pour un état donné.
 */
export function getAvailableActions(status: DemandeStatus | DemandeState): DemandeAction[] {
  const actions: DemandeAction[] = [];
  if (canPerformAction(status, 'soumettre')) actions.push('soumettre');
  if (canPerformAction(status, 'valider')) actions.push('valider');
  if (canPerformAction(status, 'rejeter')) actions.push('rejeter');
  if (canPerformAction(status, 'annuler')) actions.push('annuler');
  if (canPerformAction(status, 'reouvrir')) actions.push('reouvrir');
  return actions;
}
