/**
 * Types pour le module Suivi chantier (Phases 6–8).
 * Lancement → Exécution → Fin de chantier.
 */

export type ChantierStatut =
  | 'Préparation'
  | 'En cours'
  | 'En retard'
  | 'Suspendu'
  | 'Clôturé';

/** Ligne chantier pour le tableau principal */
export interface ChantierRow {
  id: string;
  code: string;
  projet: string;
  lot: string;
  entreprise: string;
  statut: ChantierStatut;
  avancement: number;
  budgetLot: number;
  realise: number;
  dateDebut: string;
  dateFinPrevue: string;
  retardJours: number;
}

/** Données complètes fiche chantier (4 onglets) */
export interface ChantierFormData {
  id?: string;
  code?: string;
  projet?: string;
  lot?: string;
  entreprise?: string;
  statut?: ChantierStatut;
  avancement?: number;
  budgetLot?: number;
  realise?: number;
  dateDebut?: string;
  dateFinPrevue?: string;
  retardJours?: number;
  // Général
  maitreOuvrage?: string;
  maitreOeuvre?: string;
  coordinateur?: string;
  // Planning
  jalons?: string;
  pointageSemaine?: string;
  // Coûts
  ecartBudget?: number;
  commentaireCouts?: string;
  // Points de suivi
  pointsSuivi?: string;
  reservesOuvertes?: number;
}
