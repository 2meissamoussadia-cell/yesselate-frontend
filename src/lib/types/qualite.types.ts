/**
 * Types spécifiques au module Qualité (contrôles, non-conformités)
 */

import type { Document } from './demandes.types';

export type TypeControle =
  | 'reception'
  | 'execution'
  | 'essai'
  | 'levee-reserves';

export type StatutControle =
  | 'planifie'
  | 'en-cours'
  | 'realise'
  | 'reporte'
  | 'annule';

export type CriticiteNC = 'mineure' | 'majeure' | 'critique';

export type StatutNC = 'ouverte' | 'en-traitement' | 'traitee' | 'cloturee';

export interface ControleQualite {
  id: string;
  reference: string;

  // Type et statut
  type: TypeControle;
  statut: StatutControle;
  libelle: string;
  description?: string;

  // Relation chantier
  chantier: {
    id: string;
    nom: string;
    code: string;
  };

  // Planning
  datePrevue: Date;
  dateReelle?: Date;
  dateReport?: Date;
  motifReport?: string;

  // Contrôleur
  controleur: {
    id: string;
    nom: string;
    role: string;
  };

  // Résultat
  conforme?: boolean;
  resultat?: string;
  observations?: string;

  // Non-conformité liée
  nonConformiteId?: string;

  // Documents
  piecesJointes: Document[];
  photos?: Document[];

  // Métadonnées
  dateCreation: Date;
  dateModification: Date;
  version: number;
}

export interface NonConformite {
  id: string;
  numero: string;

  // Classification
  criticite: CriticiteNC;
  statut: StatutNC;
  type: 'reception' | 'execution' | 'essai' | 'autre';
  libelle: string;
  description: string;

  // Relation
  chantier: {
    id: string;
    nom: string;
    code: string;
  };
  controleId?: string;
  lot?: string;
  zone?: string;

  // Impact
  impactPlanning?: { delai: number; unite: 'jours'; detail: string };
  impactBudget?: { montant: number; detail: string };

  // Traitement
  responsableTraitement?: { id: string; nom: string; role: string };
  dateLimiteTraitement?: Date;
  planAction?: string;
  dateCloture?: Date;
  verificationCloture?: boolean;

  // Documents
  piecesJointes: Document[];
  planActionDoc?: Document[];

  // Métadonnées
  declareePar: { id: string; nom: string };
  dateDeclaration: Date;
  dateCreation: Date;
  dateModification: Date;
  version: number;
}

export interface QualiteFilters {
  types?: TypeControle[];
  statuts?: StatutControle[];
  chantiers?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  conformes?: boolean;
  avecNC?: boolean;
  ncCritiques?: boolean;
  ncOuvertes?: boolean;
}

export type QualiteSortField =
  | 'date'
  | 'criticite'
  | 'chantier'
  | 'statut'
  | 'reference';

export interface QualiteSort {
  field: QualiteSortField;
  order: 'asc' | 'desc';
}
