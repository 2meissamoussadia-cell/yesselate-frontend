/**
 * Conversion TenderRow ↔ TenderFormData pour liste et fiche AO.
 */

import type { TenderRow, TenderFormData } from './types';

export function rowToFormData(row: TenderRow): TenderFormData {
  return {
    id: row.id,
    code: row.code,
    projet: row.projet,
    lot: row.lot,
    type: row.type,
    statut: row.statut,
    invites: row.invites,
    offres: row.offres,
    bestPrice: row.bestPrice,
    budgetLot: row.budgetLot,
    deadline: row.deadline,
    dateLimiteOffres: row.deadline,
    typePrix: 'forfait',
    modeConsultation: row.type === 'AO' ? 'AO' : row.type === 'RFQ' ? 'RFQ' : 'Gré à gré',
    montantAttribue: row.bestPrice,
  };
}

export function formDataToRow(form: TenderFormData, id?: string): TenderRow {
  return {
    id: id ?? form.id ?? '',
    code: form.code ?? '',
    projet: form.projet ?? '',
    lot: form.lot ?? '',
    type: form.type ?? 'AO',
    statut: form.statut ?? 'En préparation',
    invites: form.invites ?? 0,
    offres: form.offres ?? 0,
    bestPrice: form.bestPrice ?? form.montantAttribue ?? 0,
    budgetLot: form.budgetLot ?? 0,
    deadline: form.deadline ?? form.dateLimiteOffres ?? '',
  };
}
