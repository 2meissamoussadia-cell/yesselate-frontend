/**
 * Types métier pour le domaine Gouvernance
 * Extrait de la logique métier des composants
 */

import { z } from 'zod';

// ============================================
// Schemas de validation Zod
// ============================================

export const ProjetStatutSchema = z.enum([
  'on-track',
  'at-risk',
  'late',
  'blocked',
  'completed'
]);

export const JalonStatutSchema = z.enum([
  'planned',
  'in-progress',
  'completed',
  'delayed',
  'cancelled'
]);

export const RisqueSeveriteSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

export const ValidationStatutSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled'
]);

export const BudgetStatutSchema = z.enum([
  'on-track',
  'warning',
  'exceeded',
  'critical'
]);

// ============================================
// Types TypeScript
// ============================================

export type ProjetStatut = z.infer<typeof ProjetStatutSchema>;
export type JalonStatut = z.infer<typeof JalonStatutSchema>;
export type RisqueSeverite = z.infer<typeof RisqueSeveriteSchema>;
export type ValidationStatut = z.infer<typeof ValidationStatutSchema>;
export type BudgetStatut = z.infer<typeof BudgetStatutSchema>;

// ============================================
// Types de base
// ============================================

export interface Projet {
  id: number;
  nom: string;
  code?: string;
  statut: ProjetStatut;
  bureau: string;
  budget_total: number;
  budget_consomme: number;
  budget_pourcent: number;
  jalons_total: number;
  jalons_valides: number;
  jalons_retard: number;
  retard_jours?: number;
  risques_count: number;
  risques_critiques_count: number;
  date_debut?: string;
  date_fin_prevue?: string;
  responsable?: string;
}

export interface Budget {
  id: number;
  code: string;
  libelle: string;
  budget_initial: number;
  budget_consomme: number;
  budget_restant: number;
  pourcent_consomme: number;
  statut: BudgetStatut;
  bureau?: string;
  projet_id?: number;
  alertes?: string[];
}

export interface Jalon {
  id: number;
  nom: string;
  type: 'SLA' | 'CONTRAT' | 'INTERNE';
  date_prevue: string;
  date_reelle?: string;
  statut: JalonStatut;
  est_retard: boolean;
  retard_jours?: number;
  est_sla_risque: boolean;
  projet_id?: number;
  bureau?: string;
  responsable?: string;
}

export interface Risque {
  id: number;
  nom: string;
  description?: string;
  severite: RisqueSeverite;
  probabilite: number; // 0-100
  impact: number; // 0-100
  score: number; // probabilite * impact / 100
  statut: 'ouvert' | 'mitige' | 'ferme';
  projet_id?: number;
  bureau?: string;
  responsable?: string;
  date_detection?: string;
  date_resolution?: string;
}

export interface Validation {
  id: number;
  type: string;
  objet: string;
  statut: ValidationStatut;
  demandeur?: string;
  validateur?: string;
  date_demande?: string;
  date_validation?: string;
  commentaire?: string;
  projet_id?: number;
  bureau?: string;
}

// ============================================
// Types agrégés
// ============================================

export interface GouvernanceOverview {
  projets_actifs: number;
  budget_consomme_pourcent: number;
  jalons_retard: number;
  risques_critiques: number;
  validations_en_attente: number;
  budget_total: number;
  budget_consomme: number;
  jalons_total: number;
  jalons_valides: number;
  exposition_financiere: number;
  escalades_actives: number;
  decisions_en_attente: number;
  taux_conformite: number;
}

export interface GouvernanceStats {
  projets_actifs: number;
  projets_en_retard: number;
  projets_at_risk: number;
  budget_total: number;
  budget_consomme: number;
  budget_consomme_pourcent: number;
  jalons_total: number;
  jalons_valides: number;
  jalons_retard: number;
  jalons_respectes_pourcent: number;
  risques_total: number;
  risques_critiques: number;
  validations_en_attente: number;
  exposition_financiere: number;
  escalades_actives: number;
  decisions_en_attente: number;
  taux_conformite: number;
  last_updated?: string;
}

export interface TendanceMensuelle {
  mois: string;
  projets: number;
  budget: number;
  jalons: number;
  risques: number;
  validations: number;
  direction?: 'up' | 'down' | 'stable';
  variation_pourcent?: number;
}

// ============================================
// Types de données complètes
// ============================================

export interface GouvernanceData {
  projets: Projet[];
  budgets: Budget[];
  jalons: Jalon[];
  risques: Risque[];
  validations: Validation[];
}

// ============================================
// Types de filtres
// ============================================

export interface GouvernanceFilters {
  bureau?: string;
  projet_id?: number;
  date_debut?: string;
  date_fin?: string;
  statut?: ProjetStatut | JalonStatut | RisqueSeverite | ValidationStatut;
  search?: string;
}
