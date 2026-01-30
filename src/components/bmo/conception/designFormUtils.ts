/**
 * Conversion DesignProjectRow ↔ DesignFormData pour liste et fiche Conception.
 */

import type { DesignProjectRow, DesignFormData } from './types';

export function rowToFormData(row: DesignProjectRow): DesignFormData {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    architecte: row.architecte,
    phase: row.phase,
    costEstimate: row.costEstimate,
    budgetProgramme: row.budgetProgramme,
    coutESQ: row.costEstimate ? Math.round(row.costEstimate * 0.1) : undefined,
    coutAPS: row.costEstimate ? Math.round(row.costEstimate * 0.3) : undefined,
    coutAPD: row.costEstimate,
    apsMontant: row.costEstimate ? Math.round(row.costEstimate * 0.3) : undefined,
    apdMontant: row.costEstimate,
    apsEcartBudget: row.budgetProgramme
      ? Math.round(((row.costEstimate - row.budgetProgramme) / row.budgetProgramme) * 100)
      : undefined,
    apdEcartBudget: row.budgetProgramme
      ? Math.round(((row.costEstimate - row.budgetProgramme) / row.budgetProgramme) * 100)
      : undefined,
    nextReview: row.nextReview,
  };
}

export function formDataToRow(form: DesignFormData, id?: string): DesignProjectRow {
  const costEstimate = form.coutAPD ?? form.apdMontant ?? form.costEstimate ?? 0;
  const budgetProgramme = form.budgetProgramme ?? 0;
  const gateStatus =
    form.gateAPD === 'APD gelé'
      ? 'APD gelé'
      : form.gateAPS === 'Validé'
        ? 'APS validé'
        : form.gateESQ === 'Validé'
          ? 'ESQ validée'
          : form.phase === 'APD'
            ? 'APD en cours'
            : form.phase === 'APS'
              ? 'APS en révision'
              : 'ESQ en cours';
  return {
    id: id ?? form.id ?? '',
    code: form.code ?? '',
    name: form.name ?? '',
    architecte: form.architecte ?? '',
    phase: form.phase ?? 'ESQ',
    costEstimate,
    budgetProgramme,
    docsStatus: form.docsStatus ?? 'partiel',
    gateStatus,
    nextReview: form.nextReview ?? '',
  };
}
