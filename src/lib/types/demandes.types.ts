/**
 * Types spécifiques au module Demandes (architecture Outlook-like)
 */

export type TypeDemande = 'travaux' | 'budget' | 'fourniture' | 'personnel' | 'modification';
export type StatutDemande =
  | 'brouillon'
  | 'soumise'
  | 'en-validation'
  | 'approuvee'
  | 'rejetee'
  | 'annulee';
export type PrioriteDemande = 'haute' | 'normale' | 'basse';

/** Pièce jointe ou document */
export interface Document {
  id: string;
  nom: string;
  type: 'pv' | 'photo' | 'plan' | 'facture' | 'rapport' | 'devis' | 'autre';
  mimeType: string;
  taille: number;
  url: string;
  thumbnail?: string;
  uploadePar: { id: string; nom: string };
  uploadeA: Date;
}

/** Commentaire sur une demande */
export interface Commentaire {
  id: string;
  contenu: string;
  auteur: { id: string; nom: string; role?: string; avatar?: string };
  date: Date;
  modifie?: boolean;
  dateModification?: Date;
  pieceJointes?: Document[];
}

/** Entrée d'historique (audit trail) */
export interface HistoriqueAction {
  id: string;
  type:
    | 'creation'
    | 'modification'
    | 'commentaire'
    | 'soumission'
    | 'validation'
    | 'rejet'
    | 'annulation';
  titre: string;
  description?: string;
  auteur: { id: string; nom: string };
  date: Date;
  donnees?: Record<string, unknown>;
}

export interface Demande {
  id: string;
  numero: string;
  titre: string;
  description: string;

  // Type et classification
  type: TypeDemande;
  statut: StatutDemande;
  priorite: PrioriteDemande;
  urgente: boolean;

  // Informations budgétaires
  montantEstime?: number;
  devise: string;
  codeAnalytique?: string;

  // Workflow de validation
  demandeur: {
    id: string;
    nom: string;
    role: string;
    service: string;
    email?: string;
    avatar?: string;
  };

  valideurs: {
    id: string;
    nom: string;
    role: string;
    ordre: number;
    statut: 'en-attente' | 'approuve' | 'rejete';
    dateValidation?: Date;
    commentaire?: string;
  }[];

  valideurActuel?: {
    id: string;
    nom: string;
    role: string;
  };

  // Relations
  chantier: {
    id: string;
    nom: string;
    code: string;
  };

  lieeA?: {
    type: 'alerte' | 'bc' | 'projet';
    id: string;
    numero: string;
  };

  // Dates
  dateCreation: Date;
  dateModification: Date;
  dateSoumission?: Date;
  dateValidation?: Date;
  dateRejet?: Date;
  dateLimite?: Date;

  // Impacts
  impactPlanning?: {
    delai: number;
    unite: 'jours' | 'semaines';
    detail: string;
  };

  impactQualite?: {
    niveau: 'faible' | 'moyen' | 'eleve';
    detail: string;
  };

  // Contenus
  pieceJointes: Document[];
  commentaires: Commentaire[];
  historique: HistoriqueAction[];

  // Métadonnées
  tags?: string[];
  archived: boolean;
  deleted: boolean;
  version: number;
}

export interface DemandeFilters {
  types?: TypeDemande[];
  statuts?: StatutDemande[];
  priorites?: PrioriteDemande[];
  chantiers?: string[];
  demandeurs?: string[];
  valideurs?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  urgentes?: boolean;
  maValidation?: boolean;
  montantMin?: number;
  montantMax?: number;
  tags?: string[];
}

export type DemandeSortField = 'date' | 'deadline' | 'priorite' | 'montant' | 'chantier';
export type SortOrder = 'asc' | 'desc';

export interface DemandeSort {
  field: DemandeSortField;
  order: SortOrder;
}
