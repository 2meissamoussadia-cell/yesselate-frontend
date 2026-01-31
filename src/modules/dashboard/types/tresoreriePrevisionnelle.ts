/**
 * Types pour le widget Prévisionnel Trésorerie 90j — Phase 2 audit ERP BTP 2026.
 * Aligné sur Graneet / Vertuoza : encaissements, décaissements, solde, scénarios.
 */

export interface CashFlowPrevision {
  date: string; // YYYY-MM-DD
  encaissementsPrevus: number;
  decaissementsPrevus: number;
  soldePrevu: number;
  scenarios?: {
    optimiste: number;
    realiste: number;
    pessimiste: number;
  };
}

export type ScenarioTresorerie = 'realiste' | 'optimiste' | 'pessimiste';

export interface TensionTresorerie {
  date: string;
  soldePrevu: number;
  label?: string;
}
