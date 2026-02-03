/**
 * Types spécifiques au module Chantiers
 */

import type { Document } from './demandes.types';

export type StatutChantier =
  | 'etude'
  | 'preparation'
  | 'en-cours'
  | 'suspendu'
  | 'termine'
  | 'livre';

export type PhaseChantier =
  | 'etude'
  | 'preparation'
  | 'gros-oeuvre'
  | 'second-oeuvre'
  | 'finitions'
  | 'reception';

export type TypeChantier = 'neuf' | 'renovation' | 'extension' | 'demolition';

export interface Chantier {
  id: string;
  code: string;
  nom: string;
  description: string;

  // Type et statut
  type: TypeChantier;
  statut: StatutChantier;
  phaseActuelle: PhaseChantier;

  // Localisation
  adresse: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
    coordonnees?: {
      latitude: number;
      longitude: number;
    };
  };

  // Dates
  dateCreation: Date;
  dateDebut: Date;
  dateFinPrevue: Date;
  dateFinReelle?: Date;
  dureeInitiale: number; // en jours
  dureeActuelle: number;

  // Budget
  budget: {
    initial: number;
    revise: number;
    engage: number;
    realise: number;
    reste: number;
    devise: string;
  };

  // Avancement
  avancement: {
    global: number; // pourcentage
    phases: {
      phase: PhaseChantier;
      pourcentage: number;
      dateDebut: Date;
      dateFin?: Date;
    }[];
  };

  // Performance
  performance: {
    planning: number; // pourcentage respect planning
    budget: number; // pourcentage respect budget
    qualite: number; // note qualité
    securite: number; // note sécurité
    global: number; // moyenne pondérée
  };

  // Équipe
  equipe: {
    maitreOuvrage: {
      id: string;
      nom: string;
      contact: string;
    };
    maitreOeuvre?: {
      id: string;
      nom: string;
      contact: string;
    };
    conducteurTravaux: {
      id: string;
      nom: string;
      contact: string;
    };
    chefChantier: {
      id: string;
      nom: string;
      contact: string;
    };
    intervenants: {
      id: string;
      nom: string;
      role: string;
      entreprise: string;
    }[];
  };

  // Indicateurs
  indicateurs: {
    alertesOuvertes: number;
    alertesCritiques: number;
    ncQualite: number;
    incidentsSecurite: number;
    retardJours: number;
    depassementBudget: number;
  };

  // Surface et capacité
  surface?: {
    terrain: number;
    batie: number;
    plancher: number;
    unite: 'm2';
  };

  capacite?: {
    logements?: number;
    bureaux?: number;
    commerces?: number;
    parking?: number;
  };

  // Documents
  documents: {
    plans: Document[];
    permis: Document[];
    marches: Document[];
    pv: Document[];
    photos: Document[];
  };

  // Métadonnées
  tags?: string[];
  archived: boolean;
  deleted: boolean;
}

export interface ChantierFilters {
  statuts?: StatutChantier[];
  phases?: PhaseChantier[];
  types?: TypeChantier[];
  localisations?: string[];
  dateDebutMin?: Date;
  dateDebutMax?: Date;
  budgetMin?: number;
  budgetMax?: number;
  avancementMin?: number;
  avancementMax?: number;
  performanceMin?: number;
  performanceMax?: number;
  enRetard?: boolean;
  depassementBudget?: boolean;
  avecAlertes?: boolean;
}

export type ChantierSortField = 'date-debut' | 'avancement' | 'budget' | 'nom' | 'performance';

export interface ChantierSort {
  field: ChantierSortField;
  order: 'asc' | 'desc';
}
