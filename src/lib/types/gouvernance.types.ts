/**
 * Types spécifiques au module Gouvernance (indicateurs pilotage)
 */

import type { Document } from './demandes.types';

export type CategorieKPI = 'budget' | 'planning' | 'qualite' | 'securite' | 'performance';
export type StatutKPI = 'critique' | 'alerte' | 'conforme' | 'excellent';
export type FrequenceMesure = 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel';

export interface IndicateurKPI {
  id: string;
  code: string;
  nom: string;
  description: string;

  // Classification
  categorie: CategorieKPI;
  statut: StatutKPI;
  critique: boolean;

  // Valeurs
  valeurActuelle: number;
  valeurCible: number;
  valeurMin?: number;
  valeurMax?: number;
  unite: string;

  // Tendance
  tendance: 'hausse' | 'baisse' | 'stable';
  evolution: {
    pourcentage: number;
    periode: string;
  };

  // Historique
  historique: {
    date: Date;
    valeur: number;
    commentaire?: string;
  }[];

  // Configuration
  frequenceMesure: FrequenceMesure;
  seuilAlerte: number;
  seuilCritique: number;
  formuleCalcul?: string;

  // Responsable
  responsable: {
    id: string;
    nom: string;
    role: string;
  };

  // Relations
  chantiers?: {
    id: string;
    nom: string;
    valeur: number;
  }[];

  // Dates
  dateCreation: Date;
  dateModification: Date;
  dateDerniereMesure: Date;
  dateProchaineMesure: Date;

  // Actions associées
  actionsCorrectivesRequises?: {
    id: string;
    description: string;
    responsable: string;
    echeance: Date;
    statut: 'en-cours' | 'termine';
  }[];

  // Métadonnées
  tags?: string[];
  archived: boolean;
}

export interface TableauBord {
  id: string;
  nom: string;
  description: string;

  // Configuration
  type: 'general' | 'chantier' | 'theme';
  layout: 'grid' | 'list' | 'mixed';

  // Widgets
  widgets: Widget[];

  // Filtres appliqués
  filtres: {
    chantiers?: string[];
    periode?: {
      debut: Date;
      fin: Date;
    };
    categories?: CategorieKPI[];
  };

  // Partage
  partageAvec?: {
    id: string;
    nom: string;
    role: string;
  }[];

  // Dates
  dateCreation: Date;
  dateModification: Date;
}

export interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge' | 'stat';
  titre: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };

  // Configuration spécifique au type
  config: {
    kpiId?: string;
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    dataSource?: string;
    refreshInterval?: number; // en secondes
  };

  // Données
  data?: unknown;
}

export interface RapportGouvernance {
  id: string;
  numero: string;
  titre: string;
  type: 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'comite' | 'custom';

  // Période couverte
  periode: {
    debut: Date;
    fin: Date;
  };

  // Contenu
  sections: {
    id: string;
    titre: string;
    type: 'texte' | 'kpi' | 'tableau' | 'graphique';
    contenu: unknown;
    ordre: number;
  }[];

  // KPI inclus
  kpis: string[];

  // Statut
  statut: 'brouillon' | 'finalise' | 'envoye';

  // Auteur et destinataires
  auteur: {
    id: string;
    nom: string;
  };

  destinataires: {
    id: string;
    nom: string;
    email: string;
    role: string;
  }[];

  // Dates
  dateCreation: Date;
  dateModification: Date;
  dateEnvoi?: Date;

  // Documents
  pieceJointes: Document[];
}

export interface GouvernanceFilters {
  categories?: CategorieKPI[];
  statuts?: StatutKPI[];
  chantiers?: string[];
  responsables?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  critiquesUniquement?: boolean;
  tags?: string[];
}
