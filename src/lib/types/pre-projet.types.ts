/**
 * Types pour le module Pre projet
 */

export interface PreProjet {
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

export interface PreProjetFilters {
  statuts?: string[];
  dateDebut?: Date;
  dateFin?: Date;
}

export type PreProjetSortField = 'date' | 'titre' | 'statut';
export type SortOrder = 'asc' | 'desc';

export interface PreProjetSort {
  field: PreProjetSortField;
  order: SortOrder;
}
