/**
 * Types pour le module Programmation
 */

export interface Programmation {
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

export interface ProgrammationFilters {
  statuts?: string[];
  dateDebut?: Date;
  dateFin?: Date;
}

export type ProgrammationSortField = 'date' | 'titre' | 'statut';
export type SortOrder = 'asc' | 'desc';

export interface ProgrammationSort {
  field: ProgrammationSortField;
  order: SortOrder;
}
