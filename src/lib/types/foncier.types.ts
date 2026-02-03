/**
 * Types pour le module Foncier
 */

export interface Foncier {
  id: string;
  numero: string;
  titre: string;
  description: string;
  statut: 'actif' | 'en-cours' | 'termine' | 'archive';
  dateCreation: Date;
  dateModification: Date;
  creePar: { id: string; nom: string };
  archived: boolean;
  deleted: boolean;
  version: number;
}

export interface FoncierFilters {
  statuts?: string[];
  dateDebut?: Date;
  dateFin?: Date;
}

export type FoncierSortField = 'date' | 'titre' | 'statut';
export type SortOrder = 'asc' | 'desc';

export interface FoncierSort {
  field: FoncierSortField;
  order: SortOrder;
}
