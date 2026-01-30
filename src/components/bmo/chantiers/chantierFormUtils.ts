import type { ChantierRow, ChantierFormData } from './types';

export function rowToFormData(row: ChantierRow): ChantierFormData {
  const ecart = row.budgetLot ? row.realise - row.budgetLot : undefined;
  return {
    id: row.id,
    code: row.code,
    projet: row.projet,
    lot: row.lot,
    entreprise: row.entreprise,
    statut: row.statut,
    avancement: row.avancement,
    budgetLot: row.budgetLot,
    realise: row.realise,
    dateDebut: row.dateDebut,
    dateFinPrevue: row.dateFinPrevue,
    retardJours: row.retardJours,
    ecartBudget: ecart,
  };
}

export function formDataToRow(form: ChantierFormData, id?: string): ChantierRow {
  return {
    id: id ?? form.id ?? '',
    code: form.code ?? '',
    projet: form.projet ?? '',
    lot: form.lot ?? '',
    entreprise: form.entreprise ?? '',
    statut: form.statut ?? 'Préparation',
    avancement: form.avancement ?? 0,
    budgetLot: form.budgetLot ?? 0,
    realise: form.realise ?? 0,
    dateDebut: form.dateDebut ?? '',
    dateFinPrevue: form.dateFinPrevue ?? '',
    retardJours: form.retardJours ?? 0,
  };
}
