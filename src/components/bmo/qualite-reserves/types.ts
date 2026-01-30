/**
 * Types pour le module Qualité & Réserves (Phases 8–9).
 * Punch list, non-conformités, réserves réception.
 */

export type TypeReserve = 'structure' | 'second œuvre' | 'technique' | 'finition' | 'défaut qualité' | 'sécurité' | 'manque' | 'essai KO';
export type PrioriteReserve = 'Critique' | 'Haute' | 'Moyenne' | 'Basse';
export type StatutReserve = 'Ouverte' | 'En cours' | 'Levée' | 'Refusée';

/** Ligne réserve pour le tableau */
export interface ReserveRow {
  id: string;
  code: string;
  chantier: string;
  zone: string; // bâtiment / niveau / pièce
  lot: string;
  priorite: PrioriteReserve;
  responsable: string;
  statut: StatutReserve;
  dateDetection: string;
  dateCible: string;
  /** Date effective de levée (pour calcul délai moyen) */
  dateLeveeReelle?: string;
}

/** Données complètes fiche réserve */
export interface ReserveFormData {
  id?: string;
  code?: string;
  chantier?: string;
  zone?: string;
  lot?: string;
  priorite?: PrioriteReserve;
  responsable?: string;
  statut?: StatutReserve;
  dateDetection?: string;
  dateCible?: string;
  dateLeveeReelle?: string;
  // Détail
  description?: string;
  typeReserve?: TypeReserve;
  // Gestion
  commentairesMoe?: string;
  commentairesMoa?: string;
  commentairesEntreprise?: string;
  historique?: string;
  photosAvantApres?: string;
  /** Photos avant levée (lien ou référence) */
  photosAvant?: string;
  /** Photos après levée (lien ou référence) */
  photosApres?: string;
}

/** Entrée d'historique structurée (log des actions) */
export interface HistoriqueEntry {
  date: string;
  auteur: string;
  action: string;
}
