/**
 * Types pour le module Réceptions (Phase 9).
 * PV réception, DOE, levée des réserves.
 */

export type TypeReception = 'Provisoire' | 'Définitive' | 'Lot';
export type StatutReception = 'À planifier' | 'Planifiée' | 'Réalisée' | 'Avec réserves' | 'Levée';

/** Ligne réception pour le tableau principal */
export interface ReceptionRow {
  id: string;
  code: string;
  projet: string;
  typeReception: TypeReception;
  statut: StatutReception;
  dateReception: string;
  nbReserves: number;
  reservesLevees: number;
  doeRemis: 'Oui' | 'Non' | 'Partiel';
}

/** Données complètes fiche réception (3 onglets) */
export interface ReceptionFormData {
  id?: string;
  code?: string;
  projet?: string;
  typeReception?: TypeReception;
  statut?: StatutReception;
  dateReception?: string;
  nbReserves?: number;
  reservesLevees?: number;
  doeRemis?: 'Oui' | 'Non' | 'Partiel';
  // PV réception
  datePV?: string;
  lieu?: string;
  participants?: string;
  constatsPV?: string;
  // Réserves
  listeReserves?: string;
  delaiLevee?: string;
  // DOE
  doeReference?: string;
  doeDateRemise?: string;
  commentaireDoe?: string;
}

