/**
 * Service de calcul de priorité pour les demandes
 * Stub minimal pour compilation - à compléter avec la logique métier.
 */

import type { Demande, DemandePriority } from '../types/demande.types';

export const PriorityService = {
  calculateAutoPriority(demande: Demande): DemandePriority {
    const amount = demande.amount ?? demande.montant ?? 0;
    if (demande.budget) {
      const available = demande.budget.available ?? 0;
      const consumed = demande.budget.consumed ?? 0;
      if (available > 0 && (consumed + amount) / available >= 0.9) return 'critical';
      if (available > 0 && (consumed + amount) / available >= 0.8) return 'urgent';
    }
    if (amount >= 5_000_000) return 'urgent';
    if (amount >= 1_000_000) return 'high';
    return 'normal';
  },

  shouldEscalate(_demande: Demande): boolean {
    return false;
  },
};
