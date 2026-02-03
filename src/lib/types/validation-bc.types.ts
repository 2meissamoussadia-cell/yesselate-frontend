/**
 * Types spécifiques au module Validation BC (architecture Outlook-like)
 */

import type { Document, Commentaire, HistoriqueAction } from './demandes.types';

export type TypeBC = 'travaux' | 'fourniture' | 'service' | 'location';
export type StatutBC =
  | 'brouillon'
  | 'soumis'
  | 'en-validation'
  | 'valide'
  | 'rejete'
  | 'annule';
export type NiveauValidation =
  | 'chef-chantier'
  | 'conducteur-travaux'
  | 'directeur-technique'
  | 'direction-generale'
  | 'finance';

export interface LigneBC {
  id: string;
  designation: string;
  reference?: string;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  montantHT: number;
  tauxTVA: number;
  montantTTC: number;
  notes?: string;
}

export interface BonCommande {
  id: string;
  numero: string;
  reference: string;
  objet: string;

  // Type et statut
  type: TypeBC;
  statut: StatutBC;
  urgent: boolean;

  // Fournisseur
  fournisseur: {
    id: string;
    nom: string;
    siret?: string;
    adresse?: string;
    contact: {
      nom: string;
      telephone: string;
      email: string;
    };
    referencie: boolean;
    evaluation?: {
      note: number;
      commentaire?: string;
    };
  };

  // Montants
  montantHT: number;
  tauxTVA: number;
  montantTVA: number;
  montantTTC: number;
  devise: string;

  // Détail commande
  lignes: LigneBC[];

  // Conditions
  delaiLivraison: number;
  uniteLivraison: 'jours' | 'semaines' | 'mois';
  conditionsPaiement: string;
  garantie?: {
    duree: number;
    unite: 'mois' | 'annees';
    description: string;
  };

  // Workflow validation
  demandeur: {
    id: string;
    nom: string;
    role: string;
    service: string;
  };

  circuitValidation: {
    niveau: NiveauValidation;
    valideur: {
      id: string;
      nom: string;
      role: string;
    };
    ordre: number;
    statut: 'en-attente' | 'valide' | 'rejete';
    dateValidation?: Date;
    commentaire?: string;
    seuilMontant?: number;
  }[];

  validationActuelle?: {
    niveau: NiveauValidation;
    valideur: {
      id: string;
      nom: string;
    };
    dateEcheance?: Date;
  };

  // Relations
  chantier: {
    id: string;
    nom: string;
    code: string;
    budgetDisponible?: number;
  };

  marche?: {
    id: string;
    numero: string;
    type: string;
  };

  devisCompares?: {
    id: string;
    fournisseur: string;
    montantTTC: number;
    selectionne: boolean;
  }[];

  // Dates
  dateCreation: Date;
  dateModification: Date;
  dateSoumission?: Date;
  dateValidationComplete?: Date;
  dateRejet?: Date;
  dateEcheance?: Date;
  dateExecutionSouhaitee?: Date;

  // Documents
  devis: Document[];
  pieceJointes: Document[];
  commentaires: Commentaire[];
  historique: HistoriqueAction[];

  // Métadonnées
  codeAnalytique?: string;
  centreCoût?: string;
  tags?: string[];
  archived: boolean;
  deleted: boolean;
  version: number;
}

export interface ValidationBCFilters {
  types?: TypeBC[];
  statuts?: StatutBC[];
  fournisseurs?: string[];
  chantiers?: string[];
  validateurs?: string[];
  niveauxValidation?: NiveauValidation[];
  montantMin?: number;
  montantMax?: number;
  dateDebut?: Date;
  dateFin?: Date;
  urgent?: boolean;
  maValidation?: boolean;
  nouveauxFournisseurs?: boolean;
  devisMultiples?: boolean;
}

export type ValidationBCSortField = 'date' | 'deadline' | 'montant' | 'fournisseur' | 'chantier';

export interface ValidationBCSort {
  field: ValidationBCSortField;
  order: 'asc' | 'desc';
}
