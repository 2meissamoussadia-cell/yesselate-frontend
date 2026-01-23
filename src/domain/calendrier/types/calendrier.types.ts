/**
 * Types métier pour le domaine Calendrier
 * Extrait de la logique métier des composants
 */

import { z } from 'zod';

// ============================================
// Schemas de validation Zod
// ============================================

export const EvenementTypeSchema = z.enum([
  'EVENEMENT',
  'REUNION_PROJET',
  'REUNION_DECISIONNELLE',
]);

export const AbsenceTypeSchema = z.enum([
  'CONGÉ',
  'MISSION',
  'ABSENCE',
]);

export const JalonTypeSchema = z.enum([
  'SLA',
  'CONTRAT',
  'INTERNE',
]);

export const JalonStatutSchema = z.enum([
  'À venir',
  'En cours',
  'Terminé',
]);

export const AlerteTypeSchema = z.enum([
  'SLA_RISQUE',
  'RETARD',
  'SURALLOCATION',
]);

export const RecurrenceTypeSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'none',
]);

// ============================================
// Types TypeScript
// ============================================

export type EvenementType = z.infer<typeof EvenementTypeSchema>;
export type AbsenceType = z.infer<typeof AbsenceTypeSchema>;
export type JalonType = z.infer<typeof JalonTypeSchema>;
export type JalonStatut = z.infer<typeof JalonStatutSchema>;
export type AlerteType = z.infer<typeof AlerteTypeSchema>;
export type RecurrenceType = z.infer<typeof RecurrenceTypeSchema>;

// ============================================
// Types de base
// ============================================

export interface Evenement {
  id: number;
  type: EvenementType | null;
  titre: string | null;
  description?: string | null;
  date_debut: string | null; // TIMESTAMP
  date_fin: string | null; // TIMESTAMP
  chantier_id: number | null;
  created_at?: string;
  // Champs calculés
  duree_minutes?: number;
  is_conflict?: boolean;
  participants?: string[];
}

export interface Absence {
  id: number;
  user_id: number;
  chantier_id: number | null;
  type: AbsenceType | null;
  date_debut: string | null; // DATE
  date_fin: string | null; // DATE
  motif?: string | null;
  created_at?: string;
  // Champs calculés
  employe_nom?: string;
  equipe_id?: number | null;
  statut?: 'DEMANDE' | 'VALIDE' | 'REFUSE';
  duree_jours?: number;
}

export interface Jalon {
  id: number;
  chantier_id: number | null;
  libelle: string;
  type: JalonType | null;
  date_debut: string | null; // DATE
  date_fin: string | null; // DATE
  est_retard: boolean;
  est_sla_risque: boolean;
  statut: JalonStatut | null;
  created_at?: string;
  // Champs calculés
  retard_jours?: number;
  jours_restants?: number;
}

export interface Affectation {
  id: number;
  user_id: number;
  chantier_id: number;
  role: string | null;
  date_debut: string | null; // DATE
  date_fin: string | null; // DATE
  est_suralloue: boolean;
  created_at?: string;
  // Champs calculés
  user_nom?: string;
  chantier_nom?: string;
  charge_pourcent?: number;
}

export interface CalendrierAlerte {
  id: number;
  type: AlerteType;
  jalon_id: number | null;
  chantier_id: number | null;
  user_id: number | null;
  date_declenchement: string; // TIMESTAMP
  est_resolue: boolean;
  resolue_at: string | null; // TIMESTAMP
  created_at?: string;
  // Champs calculés
  jalon_libelle?: string;
  chantier_nom?: string;
  user_nom?: string;
  priorite?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Recurrence {
  type: RecurrenceType;
  interval?: number; // Pour weekly: chaque 2 semaines = interval: 2
  endDate?: string; // Date de fin de récurrence
  count?: number; // Nombre d'occurrences
  daysOfWeek?: number[]; // Pour weekly: [1,3,5] = lundi, mercredi, vendredi
  dayOfMonth?: number; // Pour monthly
  monthOfYear?: number; // Pour yearly
}

// ============================================
// Types agrégés
// ============================================

export interface CalendrierOverview {
  evenements_total: number;
  evenements_aujourdhui: number;
  evenements_semaine: number;
  jalons_total: number;
  jalons_retard: number;
  jalons_sla_risque: number;
  absences_total: number;
  sur_allocations: number;
  conflits_detectes: number;
}

export interface CalendrierStats {
  evenements_total: number;
  evenements_aujourdhui: number;
  evenements_semaine: number;
  evenements_mois: number;
  jalons_total: number;
  jalons_retard: number;
  jalons_sla_risque: number;
  absences_total: number;
  sur_allocations: number;
  conflits_detectes: number;
  taux_conformite_sla: number;
  temps_moyen_completion: number; // En minutes
}

// ============================================
// Types de données complètes
// ============================================

export interface CalendrierData {
  evenements: Evenement[];
  jalons: Jalon[];
  absences: Absence[];
  affectations: Affectation[];
  alertes: CalendrierAlerte[];
}

// ============================================
// Types de filtres
// ============================================

export interface CalendrierFilters {
  chantier_id?: number;
  equipe_id?: number;
  user_id?: number;
  date_debut?: string;
  date_fin?: string;
  type?: EvenementType | AbsenceType | JalonType;
  search?: string;
}
