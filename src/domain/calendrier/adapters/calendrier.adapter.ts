/**
 * Adaptateur pour convertir les données API vers le format Domain
 * Bridge entre les types API (modules/calendrier) et les types Domain
 */

import type {
  EvenementCalendrier,
  Absence,
  Affectation,
  Jalon,
  CalendrierAlerte,
  CalendrierOverviewResponse,
  CalendrierStats as ApiCalendrierStats,
} from '@/modules/calendrier/types/calendrierTypes';
import type {
  Evenement,
  Absence as DomainAbsence,
  Affectation as DomainAffectation,
  Jalon as DomainJalon,
  CalendrierAlerte as DomainCalendrierAlerte,
  CalendrierData,
  CalendrierOverview,
  CalendrierStats,
} from '../types/calendrier.types';

/**
 * Convertit un EvenementCalendrier (API) vers Evenement (Domain)
 */
export function adaptEvenement(apiEvenement: EvenementCalendrier): Evenement {
  return {
    id: apiEvenement.id,
    type: apiEvenement.type,
    titre: apiEvenement.titre,
    description: apiEvenement.description,
    date_debut: apiEvenement.date_debut,
    date_fin: apiEvenement.date_fin,
    chantier_id: apiEvenement.chantier_id,
    created_at: apiEvenement.created_at,
  };
}

/**
 * Convertit une Absence (API) vers Absence (Domain)
 */
export function adaptAbsence(apiAbsence: Absence): DomainAbsence {
  return {
    id: apiAbsence.id,
    user_id: apiAbsence.user_id,
    chantier_id: apiAbsence.chantier_id,
    type: apiAbsence.type,
    date_debut: apiAbsence.date_debut,
    date_fin: apiAbsence.date_fin,
    motif: apiAbsence.motif,
    created_at: apiAbsence.created_at,
    employe_nom: apiAbsence.employe_nom,
    equipe_id: apiAbsence.equipe_id,
    statut: apiAbsence.statut,
  };
}

/**
 * Convertit une Affectation (API) vers Affectation (Domain)
 */
export function adaptAffectation(apiAffectation: Affectation): DomainAffectation {
  return {
    id: apiAffectation.id,
    user_id: apiAffectation.user_id,
    chantier_id: apiAffectation.chantier_id,
    role: apiAffectation.role,
    date_debut: apiAffectation.date_debut,
    date_fin: apiAffectation.date_fin,
    est_suralloue: apiAffectation.est_suralloue,
    created_at: apiAffectation.created_at,
    user_nom: apiAffectation.user_nom,
    chantier_nom: apiAffectation.chantier_nom,
  };
}

/**
 * Convertit un Jalon (API) vers Jalon (Domain)
 */
export function adaptJalon(apiJalon: Jalon): DomainJalon {
  return {
    id: apiJalon.id,
    chantier_id: apiJalon.chantier_id,
    libelle: apiJalon.libelle,
    type: apiJalon.type,
    date_debut: apiJalon.date_debut,
    date_fin: apiJalon.date_fin,
    est_retard: apiJalon.est_retard,
    est_sla_risque: apiJalon.est_sla_risque,
    statut: apiJalon.statut,
    created_at: apiJalon.created_at,
  };
}

/**
 * Convertit une CalendrierAlerte (API) vers CalendrierAlerte (Domain)
 */
export function adaptCalendrierAlerte(apiAlerte: CalendrierAlerte): DomainCalendrierAlerte {
  return {
    id: apiAlerte.id,
    type: apiAlerte.type,
    jalon_id: apiAlerte.jalon_id,
    chantier_id: apiAlerte.chantier_id,
    user_id: apiAlerte.user_id,
    date_declenchement: apiAlerte.date_declenchement,
    est_resolue: apiAlerte.est_resolue,
    resolue_at: apiAlerte.resolue_at,
    created_at: apiAlerte.created_at,
    jalon_libelle: apiAlerte.jalon_libelle,
    chantier_nom: apiAlerte.chantier_nom,
    user_nom: apiAlerte.user_nom,
  };
}

/**
 * Convertit les données API vers CalendrierData (Domain)
 */
export function adaptCalendrierData(
  evenements: EvenementCalendrier[] = [],
  jalons: Jalon[] = [],
  absences: Absence[] = [],
  affectations: Affectation[] = [],
  alertes: CalendrierAlerte[] = []
): CalendrierData {
  return {
    evenements: evenements.map(adaptEvenement),
    jalons: jalons.map(adaptJalon),
    absences: absences.map(adaptAbsence),
    affectations: affectations.map(adaptAffectation),
    alertes: alertes.map(adaptCalendrierAlerte),
  };
}

/**
 * Convertit CalendrierOverviewResponse (API) vers CalendrierOverview (Domain)
 */
export function adaptCalendrierOverview(
  apiOverview: CalendrierOverviewResponse
): CalendrierOverview {
  return {
    evenements_total: apiOverview.evenements_total || 0,
    evenements_aujourdhui: apiOverview.evenements_aujourdhui || 0,
    evenements_semaine: apiOverview.evenements_semaine || 0,
    jalons_total: apiOverview.jalons_total || 0,
    jalons_retard: apiOverview.jalons_retard || 0,
    jalons_sla_risque: apiOverview.jalons_sla_risque || 0,
    absences_total: apiOverview.absences_total || 0,
    sur_allocations: apiOverview.sur_allocations || 0,
    conflits_detectes: apiOverview.conflits_detectes || 0,
  };
}

/**
 * Convertit CalendrierStats (API) vers CalendrierStats (Domain)
 */
export function adaptCalendrierStats(
  apiStats: ApiCalendrierStats
): CalendrierStats {
  return {
    evenements_total: apiStats.evenements_total || 0,
    evenements_aujourdhui: apiStats.evenements_aujourdhui || 0,
    evenements_semaine: apiStats.evenements_semaine || 0,
    evenements_mois: apiStats.evenements_mois || 0,
    jalons_total: apiStats.jalons_total || 0,
    jalons_retard: apiStats.jalons_retard || 0,
    jalons_sla_risque: apiStats.jalons_sla_risque || 0,
    absences_total: apiStats.absences_total || 0,
    sur_allocations: apiStats.sur_allocations || 0,
    conflits_detectes: apiStats.conflits_detectes || 0,
    taux_conformite_sla: apiStats.taux_conformite_sla || 0,
    temps_moyen_completion: apiStats.temps_moyen_completion || 0,
  };
}
