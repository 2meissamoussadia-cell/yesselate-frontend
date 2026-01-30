import type { ReceptionRow, ReceptionFormData } from './types';

export function rowToFormData(row: ReceptionRow): ReceptionFormData {
  return {
    id: row.id,
    code: row.code,
    projet: row.projet,
    typeReception: row.typeReception,
    statut: row.statut,
    dateReception: row.dateReception,
    nbReserves: row.nbReserves,
    reservesLevees: row.reservesLevees,
    doeRemis: row.doeRemis,
  };
}

export function formDataToRow(form: ReceptionFormData, id?: string): ReceptionRow {
  return {
    id: id ?? form.id ?? '',
    code: form.code ?? '',
    projet: form.projet ?? '',
    typeReception: form.typeReception ?? 'Provisoire',
    statut: form.statut ?? 'À planifier',
    dateReception: form.dateReception ?? '',
    nbReserves: form.nbReserves ?? 0,
    reservesLevees: form.reservesLevees ?? 0,
    doeRemis: form.doeRemis ?? 'Non',
  };
}
