/**
 * Conversion OpportunityRow ↔ OpportunityFormData pour liste et fiche complète.
 */

import type { OpportunityRow, OpportunityFormData } from './types';
import type { RisqueLevel } from './types';

export function rowToFormData(row: OpportunityRow): OpportunityFormData {
  return {
    id: row.id,
    code: row.code,
    projet: row.projet,
    clientType: row.clientType as OpportunityFormData['clientType'],
    ville: row.ville,
    typeProjet: (row.type === 'Neuf' || row.type === 'Rénovation' || row.type === 'Extension' || row.type === 'Maintenance lourde')
      ? row.type
      : 'Neuf',
    phase: row.phase,
    proba: row.proba,
    budgetMin: row.budget,
    budgetMax: row.budget,
    devise: 'FCFA',
    statutPipeline: 'En étude',
    risque: row.risque,
    gateFoncier: row.phase === 1 ? (row.gate === 'Foncier OK' ? 'OK' : row.gate === 'À sécuriser' ? 'À sécuriser' : 'KO') : undefined,
    programmeValide: row.phase === 2 ? (row.gate === 'Programme validé' ? 'Oui' : 'Non') : undefined,
  };
}

export function formDataToRow(form: OpportunityFormData, id?: string): OpportunityRow {
  const gate =
    form.phase === 1
      ? (form.gateFoncier === 'OK' ? 'Foncier OK' : form.gateFoncier === 'À sécuriser' ? 'Foncier à sécuriser' : form.gateFoncier === 'KO' ? 'KO' : 'En cours')
      : form.phase === 2
        ? (form.programmeValide === 'Oui' ? 'Programme validé' : 'En révision')
        : form.phase === 0
          ? 'GO étude'
          : 'En cours';
  const budget = Number(form.budgetMax ?? form.budgetMin ?? 0);
  const proba = Number(form.proba ?? 50);
  return {
    id: id ?? form.id ?? '',
    code: form.code ?? `OPP-${new Date().getFullYear()}-XXX`,
    projet: form.projet ?? '',
    clientType: (form.clientType as string) ?? 'Promoteur',
    ville: form.ville ?? '',
    type: (form.typeProjet as string) ?? 'Neuf',
    phase: Number(form.phase ?? 0),
    gate,
    budget,
    proba,
    risque: (form.risque as RisqueLevel) ?? 'medium',
    nextDecision: form.gate2Commentaire ?? form.dateLivraison ?? `Décision phase ${form.phase ?? 0}`,
  };
}
