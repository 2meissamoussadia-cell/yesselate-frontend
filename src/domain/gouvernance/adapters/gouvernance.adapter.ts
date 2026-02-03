/**
 * Adaptateur pour convertir les données API vers le format Domain
 * Bridge entre les types API (modules/gouvernance) et les types Domain
 */

import type {
  ProjetGouvernance,
  BudgetGouvernance,
  JalonGouvernance,
  RisqueGouvernance,
  ValidationGouvernance,
  GouvernanceOverviewResponse,
  GouvernanceStats as ApiGouvernanceStats,
  TendanceMensuelle as ApiTendanceMensuelle,
} from '@/modules/gouvernance/types/gouvernanceTypes';
import type {
  Projet,
  Budget,
  Jalon,
  Risque,
  Validation,
  GouvernanceData,
  GouvernanceOverview,
  GouvernanceStats,
  TendanceMensuelle,
} from '../types/gouvernance.types';

/**
 * Convertit un ProjetGouvernance (API) vers Projet (Domain)
 */
export function adaptProjet(apiProjet: ProjetGouvernance): Projet {
  return {
    id: apiProjet.id,
    nom: apiProjet.nom,
    code: apiProjet.code,
    statut: apiProjet.statut,
    bureau: '', // À mapper depuis API si disponible
    budget_total: apiProjet.budget_total,
    budget_consomme: apiProjet.budget_consomme,
    budget_pourcent: apiProjet.budget_pourcent,
    jalons_total: apiProjet.jalons_total,
    jalons_valides: apiProjet.jalons_valides,
    jalons_retard: apiProjet.jalons_retard,
    retard_jours: apiProjet.retard_jours,
    risques_count: apiProjet.risques_count || 0,
    risques_critiques_count: apiProjet.risques_critiques_count,
  };
}

/**
 * Convertit un BudgetGouvernance (API) vers Budget (Domain)
 */
export function adaptBudget(apiBudget: BudgetGouvernance): Budget {
  return {
    id: apiBudget.projet_id, // Utiliser projet_id comme id temporaire
    code: apiBudget.projet_nom.substring(0, 10) || `BUD-${apiBudget.projet_id}`,
    libelle: `Budget ${apiBudget.projet_nom}`,
    bureau: '', // À mapper depuis API si disponible
    projet_id: apiBudget.projet_id,
    budget_initial: apiBudget.budget_initial,
    budget_consomme: apiBudget.budget_consomme,
    budget_restant: apiBudget.budget_restant,
    pourcent_consomme: apiBudget.pourcent_consomme,
    statut: calculateBudgetStatut(apiBudget),
  };
}

/**
 * Calcule le statut d'un budget depuis les données API
 */
function calculateBudgetStatut(apiBudget: BudgetGouvernance): 'on-track' | 'warning' | 'critical' | 'exceeded' {
  if (apiBudget.depassement && apiBudget.depassement > 0) {
    return 'exceeded';
  }
  if (apiBudget.pourcent_consomme >= 90) {
    return 'critical';
  }
  if (apiBudget.pourcent_consomme >= 75) {
    return 'warning';
  }
  return 'on-track';
}

/**
 * Convertit un JalonGouvernance (API) vers Jalon (Domain)
 */
export function adaptJalon(apiJalon: JalonGouvernance): Jalon {
  return {
    id: apiJalon.id,
    nom: apiJalon.libelle,
    type: apiJalon.type,
    date_prevue: apiJalon.date_prevue,
    date_reelle: apiJalon.date_reelle,
    statut: adaptJalonStatut(apiJalon.statut),
    est_retard: apiJalon.est_retard,
    retard_jours: apiJalon.retard_jours,
    est_sla_risque: apiJalon.est_sla_risque,
    projet_id: apiJalon.projet_id,
    bureau: '', // À mapper depuis API si disponible
  };
}

/**
 * Adapte le statut du jalon
 */
function adaptJalonStatut(statut: 'À venir' | 'En cours' | 'Terminé'): 'planned' | 'in-progress' | 'completed' {
  switch (statut) {
    case 'À venir':
      return 'planned';
    case 'En cours':
      return 'in-progress';
    case 'Terminé':
      return 'completed';
    default:
      return 'planned';
  }
}

/**
 * Convertit un RisqueGouvernance (API) vers Risque (Domain)
 */
export function adaptRisque(apiRisque: RisqueGouvernance): Risque {
  // Convertir probabilite et impact en nombres
  const probabiliteNum = probabiliteToNumber(apiRisque.probabilite);
  const impactNum = impactToNumber(apiRisque.impact);
  const score = (probabiliteNum * impactNum) / 100;
  
  // Déterminer severite depuis probabilite + impact
  const severite = calculateSeverite(probabiliteNum, impactNum);
  
  return {
    id: apiRisque.id,
    nom: apiRisque.titre,
    description: apiRisque.description,
    severite,
    probabilite: probabiliteNum,
    impact: impactNum,
    score,
    statut: adaptRisqueStatut(apiRisque.statut),
    projet_id: apiRisque.projet_id,
    bureau: '', // À mapper depuis API si disponible
    date_detection: apiRisque.date_detection,
  };
}

/**
 * Convertit probabilite string en nombre (0-100)
 */
function probabiliteToNumber(probabilite: 'low' | 'medium' | 'high'): number {
  switch (probabilite) {
    case 'low':
      return 25;
    case 'medium':
      return 50;
    case 'high':
      return 75;
    default:
      return 50;
  }
}

/**
 * Convertit impact string en nombre (0-100)
 */
function impactToNumber(impact: 'financial' | 'planning' | 'reputation' | 'quality'): number {
  // Simplification: tous les impacts ont la même valeur
  // À adapter selon logique métier réelle
  return 50;
}

/**
 * Calcule la severite depuis probabilite et impact
 */
function calculateSeverite(probabilite: number, impact: number): 'low' | 'medium' | 'high' | 'critical' {
  const score = (probabilite + impact) / 2;
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/**
 * Adapte le statut du risque
 */
function adaptRisqueStatut(statut: string): 'ouvert' | 'mitige' | 'ferme' {
  switch (statut.toLowerCase()) {
    case 'ouvert':
    case 'open':
      return 'ouvert';
    case 'mitigé':
    case 'mitigated':
    case 'mitige':
      return 'mitige';
    case 'fermé':
    case 'closed':
    case 'ferme':
      return 'ferme';
    default:
      return 'ouvert';
  }
}

/**
 * Convertit une ValidationGouvernance (API) vers Validation (Domain)
 */
export function adaptValidation(apiValidation: ValidationGouvernance): Validation {
  return {
    id: apiValidation.id,
    type: apiValidation.type,
    objet: apiValidation.titre,
    statut: adaptValidationStatut(apiValidation.statut),
    demandeur: '', // À mapper depuis API si disponible
    validateur: '', // À mapper depuis API si disponible
    date_demande: apiValidation.date_demande,
    date_validation: apiValidation.date_echeance, // Approximation
    commentaire: apiValidation.reference,
    projet_id: apiValidation.projet_id,
    bureau: '', // À mapper depuis API si disponible
  };
}

/**
 * Adapte le statut de la validation
 */
function adaptValidationStatut(statut: string): 'pending' | 'approved' | 'rejected' | 'cancelled' {
  switch (statut.toLowerCase()) {
    case 'en-attente':
    case 'en attente':
    case 'pending':
      return 'pending';
    case 'valide':
    case 'approved':
      return 'approved';
    case 'rejete':
    case 'rejeté':
    case 'rejected':
      return 'rejected';
    case 'bloque':
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

/**
 * Convertit une réponse Overview (API) vers GouvernanceData (Domain)
 */
export function adaptGouvernanceData(
  overview: GouvernanceOverviewResponse,
  projets: ProjetGouvernance[] = [],
  budgets: BudgetGouvernance[] = [],
  jalons: JalonGouvernance[] = [],
  risques: RisqueGouvernance[] = [],
  validations: ValidationGouvernance[] = []
): GouvernanceData {
  return {
    projets: projets.map(adaptProjet),
    budgets: budgets.map(adaptBudget),
    jalons: jalons.map(adaptJalon),
    risques: risques.map(adaptRisque),
    validations: validations.map(adaptValidation),
  };
}

/**
 * Convertit GouvernanceOverviewResponse (API) vers GouvernanceOverview (Domain)
 */
export function adaptGouvernanceOverview(
  apiOverview: GouvernanceOverviewResponse
): GouvernanceOverview {
  const s = apiOverview.stats ?? (apiOverview as unknown as ApiGouvernanceStats);
  return {
    projets_actifs: s.projets_actifs ?? 0,
    budget_consomme_pourcent: s.budget_consomme_pourcent ?? 0,
    jalons_retard: s.jalons_retard ?? 0,
    risques_critiques: s.risques_critiques ?? 0,
    validations_en_attente: s.validations_en_attente ?? 0,
    budget_total: s.budget_total ?? 0,
    budget_consomme: s.budget_consomme ?? 0,
    jalons_total: s.jalons_total ?? 0,
    jalons_valides: s.jalons_valides ?? 0,
    exposition_financiere: s.exposition_financiere ?? 0,
    escalades_actives: s.escalades_actives ?? 0,
    decisions_en_attente: s.decisions_en_attente ?? 0,
    taux_conformite: s.taux_conformite ?? 0,
  };
}

/**
 * Convertit GouvernanceStats (API) vers GouvernanceStats (Domain)
 */
export function adaptGouvernanceStats(
  apiStats: ApiGouvernanceStats
): GouvernanceStats {
  return {
    projets_actifs: apiStats.projets_actifs,
    projets_en_retard: (apiStats as ApiGouvernanceStats & { projets_en_retard?: number }).projets_en_retard ?? 0,
    projets_at_risk: (apiStats as ApiGouvernanceStats & { projets_at_risk?: number }).projets_at_risk ?? 0,
    budget_consomme_pourcent: apiStats.budget_consomme_pourcent,
    jalons_respectes_pourcent: apiStats.jalons_respectes_pourcent,
    risques_critiques: apiStats.risques_critiques,
    validations_en_attente: apiStats.validations_en_attente,
    budget_total: apiStats.budget_total,
    budget_consomme: apiStats.budget_consomme,
    jalons_total: apiStats.jalons_total,
    jalons_valides: apiStats.jalons_valides,
    jalons_retard: apiStats.jalons_retard,
    risques_total: (apiStats as ApiGouvernanceStats & { risques_total?: number }).risques_total ?? 0,
    exposition_financiere: apiStats.exposition_financiere,
    escalades_actives: apiStats.escalades_actives,
    decisions_en_attente: apiStats.decisions_en_attente,
    taux_conformite: apiStats.taux_conformite,
  };
}

/**
 * Convertit TendanceMensuelle (API) vers TendanceMensuelle (Domain)
 */
export function adaptTendanceMensuelle(
  apiTendance: ApiTendanceMensuelle
): TendanceMensuelle {
  return {
    mois: apiTendance.mois,
    projets: apiTendance.projets_actifs ?? 0,
    budget: apiTendance.budget_consomme ?? 0,
    jalons: apiTendance.jalons_valides ?? 0,
    risques: apiTendance.risques_critiques ?? 0,
    validations: apiTendance.validations_en_attente ?? 0,
    direction: (apiTendance as ApiTendanceMensuelle & { direction?: 'up' | 'down' | 'stable' }).direction,
    variation_pourcent: (apiTendance as ApiTendanceMensuelle & { variation_pourcent?: number }).variation_pourcent,
  };
}
