/**
 * Types pour le module Études & Conception (Phase 3 — ESQ, APS, APD).
 */

export type DesignPhase = 'ESQ' | 'APS' | 'APD';
export type DocsStatus = 'incomplet' | 'partiel' | 'complet';
export type GateESQStatus = 'En cours' | 'Validé' | 'À revoir' | 'Refusé';
export type GateAPSStatus = 'En cours' | 'Validé' | 'À revoir' | 'Refusé';
export type GateAPDStatus = 'En cours' | 'APD gelé' | 'À revoir';

/** Ligne projet pour le tableau principal Conception */
export interface DesignProjectRow {
  id: string;
  code: string;
  name: string;
  architecte: string;
  phase: DesignPhase;
  costEstimate: number;
  budgetProgramme: number;
  docsStatus: DocsStatus;
  gateStatus: string;
  nextReview: string;
}

/** Données complètes fiche projet Conception (ESQ, APS, APD, Coûts) */
export interface DesignFormData {
  id?: string;
  code?: string;
  name?: string;
  architecte?: string;
  phase?: DesignPhase;
  costEstimate?: number;
  budgetProgramme?: number;
  docsStatus?: DocsStatus;
  nextReview?: string;
  // ESQ
  esqDateDebut?: string;
  esqDateFin?: string;
  esqVariantes?: string;
  esqVarianteRetenue?: string;
  esqLivrables?: string;
  gateESQ?: GateESQStatus;
  gateESQDate?: string;
  gateESQPar?: string;
  gateESQCommentaire?: string;
  // APS
  apsMontant?: number;
  apsEcartBudget?: number;
  apsLivrables?: string;
  gateAPS?: GateAPSStatus;
  gateAPSDate?: string;
  gateAPSCommentaire?: string;
  // APD
  apdMontant?: number;
  apdEcartBudget?: number;
  apdLivrables?: string;
  gateAPD?: GateAPDStatus;
  gateAPDDate?: string;
  pretDCE?: 'Oui' | 'Non';
  gateAPDCommentaire?: string;
  // Coûts & surfaces
  coutESQ?: number;
  coutAPS?: number;
  coutAPD?: number;
  surfacesResume?: string;
}
