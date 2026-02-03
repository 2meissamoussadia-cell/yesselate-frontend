/**
 * Types Centre d'Alertes BTP — Architecture Outlook-like
 */

export type NiveauAlerte = 'critique' | 'important' | 'normal' | 'faible';
export type StatutAlerte = 'non-traite' | 'en-cours' | 'traite' | 'cloture' | 'archive';
export type CategorieAlerte = 'technique' | 'budget' | 'financier' | 'planning' | 'securite' | 'qualite' | 'juridique';
export type PrioriteAlerte = 'haute' | 'moyenne' | 'basse';

export interface ChantierRef {
  id: string;
  nom: string;
  code: string;
  progression?: number;
}

export interface ActeurRef {
  id: string;
  nom: string;
  role: string;
  email?: string;
  avatar?: string;
}

export interface AlerteBTP {
  id: string;
  numero: string;
  titre: string;
  description: string;

  niveau: NiveauAlerte;
  statut: StatutAlerte;
  categorie: CategorieAlerte;
  priorite: PrioriteAlerte;
  urgent: boolean;

  chantier: ChantierRef;
  emetteur: ActeurRef;
  assigneA?: ActeurRef;
  assignePar?: { id: string; nom: string; date: Date };

  dateCreation: Date;
  dateModification: Date;
  dateEcheance?: Date;
  dateTraitement?: Date;
  dateCloture?: Date;

  impactBudget?: { montant: number; devise: string; detail: string };
  impactPlanning?: { retard: number; unite: 'jours' | 'semaines'; detail: string };
  impactQualite?: { niveau: 'faible' | 'moyen' | 'eleve'; detail: string };

  pieceJointes: DocumentRef[];
  commentaires: CommentaireRef[];
  historique: HistoriqueAction[];
  tags?: string[];
  archived: boolean;
  deleted: boolean;
  version: number;
}

export interface DocumentRef {
  id: string;
  nom: string;
  type: 'pv' | 'photo' | 'plan' | 'facture' | 'rapport' | 'autre';
  mimeType: string;
  taille: number;
  url: string;
  thumbnail?: string;
  uploadePar: { id: string; nom: string };
  uploadeA: Date;
}

export interface CommentaireRef {
  id: string;
  contenu: string;
  auteur: ActeurRef;
  date: Date;
  modifie: boolean;
  dateModification?: Date;
  pieceJointes?: DocumentRef[];
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface HistoriqueAction {
  id: string;
  type: 'creation' | 'modification' | 'commentaire' | 'assignation' | 'changement_statut' | 'cloture';
  titre: string;
  description?: string;
  auteur: { id: string; nom: string };
  date: Date;
  donnees?: Record<string, unknown>;
}

export interface AlerteFilters {
  statuts?: StatutAlerte[];
  niveaux?: NiveauAlerte[];
  categories?: CategorieAlerte[];
  chantiers?: string[];
  assignes?: string[];
  emetteurs?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  urgent?: boolean;
  avecRetard?: boolean;
  avecImpactBudget?: boolean;
  tags?: string[];
}

export type AlerteSortField = 'date' | 'echeance' | 'niveau' | 'chantier' | 'budget' | 'priorite';
export type SortOrder = 'asc' | 'desc';

export interface AlerteSort {
  field: AlerteSortField;
  order: SortOrder;
}
