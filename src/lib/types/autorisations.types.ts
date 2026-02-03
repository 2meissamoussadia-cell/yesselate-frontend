/**
 * Types pour le module Autorisations
 */

export interface Autorisations {
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

export interface AutorisationsFilters {
  statuts?: string[];
  dateDebut?: Date;
  dateFin?: Date;
}

export type AutorisationsSortField = 'date' | 'titre' | 'statut';
export type SortOrder = 'asc' | 'desc';

export interface AutorisationsSort {
  field: AutorisationsSortField;
  order: SortOrder;
}
