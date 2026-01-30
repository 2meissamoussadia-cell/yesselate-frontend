import type { ReserveRow, ReserveFormData } from './types';

export function rowToFormData(row: ReserveRow): ReserveFormData {
  return {
    id: row.id,
    code: row.code,
    chantier: row.chantier,
    zone: row.zone,
    lot: row.lot,
    priorite: row.priorite,
    responsable: row.responsable,
    statut: row.statut,
    dateDetection: row.dateDetection,
    dateCible: row.dateCible,
    dateLeveeReelle: row.dateLeveeReelle,
  };
}

export function formDataToRow(form: ReserveFormData, id?: string): ReserveRow {
  return {
    id: id ?? form.id ?? '',
    code: form.code ?? '',
    chantier: form.chantier ?? '',
    zone: form.zone ?? '',
    lot: form.lot ?? '',
    priorite: form.priorite ?? 'Moyenne',
    responsable: form.responsable ?? '',
    statut: form.statut ?? 'Ouverte',
    dateDetection: form.dateDetection ?? '',
    dateCible: form.dateCible ?? '',
    dateLeveeReelle: form.dateLeveeReelle,
  };
}
