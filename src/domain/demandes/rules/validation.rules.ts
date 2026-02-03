/**
 * Règles de validation métier pour les demandes
 * Stub minimal pour compilation - à compléter avec la logique métier.
 */

import type { Demande } from '../types/demande.types';

const MAX_AMOUNT = 100_000_000;
const BUREAU_CODES = new Set(['BMO', 'BF', 'BJ', 'DRE', 'DAAF', 'DSI']);

export const ValidationRules = {
  isTitleValid(title: string | undefined): boolean {
    const t = (title ?? '').trim();
    return t.length >= 10;
  },

  isAmountValid(amount: number | undefined | null): boolean {
    if (amount == null) return false;
    return amount > 0 && amount <= MAX_AMOUNT;
  },

  isBureauValid(bureau: string | undefined | null): boolean {
    if (bureau == null || bureau === '') return false;
    return BUREAU_CODES.has(bureau) || bureau.length >= 2;
  },

  isDeadlineValid(deadline: Date | string | undefined | null): boolean {
    if (deadline == null) return true;
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    return !Number.isNaN(d.getTime());
  },

  requiresDocuments(demande: Demande): boolean {
    const amount = demande.amount ?? demande.montant ?? 0;
    return amount >= 1_000_000;
  },

  requiresJustification(demande: Demande): boolean {
    const amount = demande.amount ?? demande.montant ?? 0;
    return amount >= 500_000;
  },

  requiresUrgencyReason(demande: Demande): boolean {
    const p = demande.priority;
    return p === 'urgent' || p === 'critical';
  },
};
