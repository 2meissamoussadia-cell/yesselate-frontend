/**
 * Service principal pour le domaine Gouvernance
 * Calcule les vues d'ensemble et statistiques globales
 */

import type {
  GouvernanceData,
  GouvernanceOverview,
  GouvernanceStats,
  TendanceMensuelle,
  GouvernanceFilters,
} from '../types/gouvernance.types';
import { ProjetService } from './projet.service';
import { BudgetService } from './budget.service';
import { JalonService } from './jalon.service';
import { RisqueService } from './risque.service';
import { ValidationService } from './validation.service';

export class GouvernanceService {
  /**
   * Calcule la vue d'ensemble de la gouvernance
   */
  static calculateOverview(data: GouvernanceData): GouvernanceOverview {
    const projetsActifs = data.projets.filter(p => 
      p.statut === 'on-track' || p.statut === 'at-risk' || p.statut === 'late'
    ).length;

    const budgetTotal = data.budgets.reduce((sum, b) => sum + b.budget_initial, 0);
    const budgetConsomme = data.budgets.reduce((sum, b) => sum + b.budget_consomme, 0);
    const budgetConsommePourcent = budgetTotal > 0
      ? (budgetConsomme / budgetTotal) * 100
      : 0;

    const jalonsTotal = data.jalons.length;
    const jalonsValides = data.jalons.filter(j => j.statut === 'completed').length;
    const jalonsRetard = data.jalons.filter(j => {
      const datePrevue = j.date_prevue ? new Date(j.date_prevue) : null;
      if (!datePrevue) return false;
      const aujourdhui = new Date();
      return datePrevue < aujourdhui && j.statut !== 'completed';
    }).length;

    const risquesCritiques = data.risques.filter(r => r.severite === 'critical').length;

    const validationsEnAttente = data.validations.filter(v => v.statut === 'pending').length;

    const expositionFinanciere = RisqueService.calculateExpositionFinanciere(data.risques);

    // Calculs simplifiés (à adapter selon logique métier réelle)
    const escaladesActives = 0; // À calculer depuis données réelles
    const decisionsEnAttente = 0; // À calculer depuis données réelles
    const tauxConformite = jalonsTotal > 0
      ? (jalonsValides / jalonsTotal) * 100
      : 100;

    return {
      projets_actifs: projetsActifs,
      budget_consomme_pourcent: budgetConsommePourcent,
      jalons_retard: jalonsRetard,
      risques_critiques: risquesCritiques,
      validations_en_attente: validationsEnAttente,
      budget_total: budgetTotal,
      budget_consomme: budgetConsomme,
      jalons_total: jalonsTotal,
      jalons_valides: jalonsValides,
      exposition_financiere: expositionFinanciere,
      escalades_actives: escaladesActives,
      decisions_en_attente: decisionsEnAttente,
      taux_conformite: tauxConformite,
    };
  }

  /**
   * Calcule les statistiques globales de gouvernance
   */
  static calculateStats(data: GouvernanceData): GouvernanceStats {
    const projetsActifs = data.projets.filter(p => 
      p.statut === 'on-track' || p.statut === 'at-risk' || p.statut === 'late'
    ).length;

    const projetsEnRetard = data.projets.filter(p => p.statut === 'late').length;
    const projetsAtRisk = data.projets.filter(p => p.statut === 'at-risk').length;

    const budgetTotal = data.budgets.reduce((sum, b) => sum + b.budget_initial, 0);
    const budgetConsomme = data.budgets.reduce((sum, b) => sum + b.budget_consomme, 0);
    const budgetConsommePourcent = budgetTotal > 0
      ? (budgetConsomme / budgetTotal) * 100
      : 0;

    const jalonsTotal = data.jalons.length;
    const jalonsValides = data.jalons.filter(j => j.statut === 'completed').length;
    const jalonsRetard = data.jalons.filter(j => {
      const datePrevue = j.date_prevue ? new Date(j.date_prevue) : null;
      if (!datePrevue) return false;
      const aujourdhui = new Date();
      return datePrevue < aujourdhui && j.statut !== 'completed';
    }).length;
    const jalonsRespectesPourcent = jalonsTotal > 0
      ? (jalonsValides / jalonsTotal) * 100
      : 100;

    const risquesTotal = data.risques.length;
    const risquesCritiques = data.risques.filter(r => r.severite === 'critical').length;

    const validationsEnAttente = data.validations.filter(v => v.statut === 'pending').length;

    const expositionFinanciere = RisqueService.calculateExpositionFinanciere(data.risques);

    // Calculs simplifiés
    const escaladesActives = 0;
    const decisionsEnAttente = 0;
    const tauxConformite = jalonsRespectesPourcent; // Simplifié

    return {
      projets_actifs: projetsActifs,
      projets_en_retard: projetsEnRetard,
      projets_at_risk: projetsAtRisk,
      budget_total: budgetTotal,
      budget_consomme: budgetConsomme,
      budget_consomme_pourcent: budgetConsommePourcent,
      jalons_total: jalonsTotal,
      jalons_valides: jalonsValides,
      jalons_retard: jalonsRetard,
      jalons_respectes_pourcent: jalonsRespectesPourcent,
      risques_total: risquesTotal,
      risques_critiques: risquesCritiques,
      validations_en_attente: validationsEnAttente,
      exposition_financiere: expositionFinanciere,
      escalades_actives: escaladesActives,
      decisions_en_attente: decisionsEnAttente,
      taux_conformite: tauxConformite,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Calcule les tendances mensuelles
   */
  static calculateTendances(
    data: GouvernanceData,
    months: number = 12
  ): TendanceMensuelle[] {
    const tendances: TendanceMensuelle[] = [];
    const aujourdhui = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() - i, 1);
      const mois = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      // Filtrer données pour ce mois (simplifié - à adapter selon logique réelle)
      const projetsMois = data.projets.filter(p => {
        // Logique de filtrage par mois à adapter
        return true;
      });
      
      const budgetMois = data.budgets.reduce((sum, b) => sum + b.budget_consomme, 0);
      const jalonsMois = data.jalons.filter(j => j.statut === 'completed').length;
      const risquesMois = data.risques.filter(r => r.severite === 'critical').length;
      const validationsMois = data.validations.filter(v => v.statut === 'pending').length;
      
      // Calcul direction (comparaison avec mois précédent)
      let direction: 'up' | 'down' | 'stable' = 'stable';
      const prevTendance = tendances[tendances.length - 1];
      if (prevTendance != null) {
        if (projetsMois.length > prevTendance.projets) direction = 'up';
        else if (projetsMois.length < prevTendance.projets) direction = 'down';
      }
      
      tendances.push({
        mois,
        projets: projetsMois.length,
        budget: budgetMois,
        jalons: jalonsMois,
        risques: risquesMois,
        validations: validationsMois,
        direction,
      });
    }
    
    return tendances;
  }

  /**
   * Filtre les données selon les critères
   */
  static filterData(
    data: GouvernanceData,
    filters: GouvernanceFilters
  ): GouvernanceData {
    let projets = [...data.projets];
    let budgets = [...data.budgets];
    let jalons = [...data.jalons];
    let risques = [...data.risques];
    let validations = [...data.validations];

    // Filtre par bureau
    if (filters.bureau) {
      projets = projets.filter(p => p.bureau === filters.bureau);
      budgets = budgets.filter(b => b.bureau === filters.bureau);
      jalons = jalons.filter(j => j.bureau === filters.bureau);
      risques = risques.filter(r => r.bureau === filters.bureau);
      validations = validations.filter(v => v.bureau === filters.bureau);
    }

    // Filtre par projet
    if (filters.projet_id) {
      budgets = budgets.filter(b => b.projet_id === filters.projet_id);
      jalons = jalons.filter(j => j.projet_id === filters.projet_id);
      risques = risques.filter(r => r.projet_id === filters.projet_id);
      validations = validations.filter(v => v.projet_id === filters.projet_id);
    }

    // Filtre par dates
    if (filters.date_debut || filters.date_fin) {
      // Logique de filtrage par dates à implémenter
    }

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      projets = projets.filter(p => 
        p.nom.toLowerCase().includes(searchLower) ||
        p.code?.toLowerCase().includes(searchLower)
      );
    }

    return {
      projets,
      budgets,
      jalons,
      risques,
      validations,
    };
  }
}
