/**
 * Règles d'approbation pour les demandes
 * Stub minimal pour compilation - à compléter avec la logique métier.
 */

import type { Demande, ApproverLevel } from '../types/demande.types';

export const ApprovalRules = {
  getApproverLevel(demande: Demande): ApproverLevel {
    const amount = demande.amount ?? demande.montant ?? 0;
    if (amount < 500_000) return { level: 'auto', reason: 'Montant < 500K', threshold: 500_000 };
    if (amount < 5_000_000) return { level: 'manager', reason: '500K–5M', threshold: 5_000_000 };
    if (amount < 50_000_000) return { level: 'direction', reason: '5M–50M', threshold: 50_000_000 };
    return { level: 'comex', reason: '≥ 50M', threshold: 50_000_000 };
  },

  canAutoApprove(demande: Demande): boolean {
    const { level } = this.getApproverLevel(demande);
    return level === 'auto';
  },
};
