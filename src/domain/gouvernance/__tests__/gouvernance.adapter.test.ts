/**
 * Tests unitaires pour les adaptateurs Gouvernance
 */

import { describe, it, expect } from '@jest/globals';
import {
  adaptProjet,
  adaptBudget,
  adaptJalon,
  adaptRisque,
  adaptValidation,
  adaptGouvernanceData,
  adaptGouvernanceOverview,
  adaptGouvernanceStats,
} from '../adapters/gouvernance.adapter';
import type {
  ProjetGouvernance,
  BudgetGouvernance,
  JalonGouvernance,
  RisqueGouvernance,
  ValidationGouvernance,
  GouvernanceOverviewResponse,
  GouvernanceStats as ApiGouvernanceStats,
} from '@/modules/gouvernance/types/gouvernanceTypes';

describe('Gouvernance Adapters', () => {
  describe('adaptProjet', () => {
    it('should adapt ProjetGouvernance to Projet', () => {
      const apiProjet: ProjetGouvernance = {
        id: 1,
        nom: 'Projet Test',
        code: 'PRJ-001',
        statut: 'on-track',
        budget_total: 100000,
        budget_consomme: 50000,
        budget_pourcent: 50,
        jalons_total: 10,
        jalons_valides: 8,
        jalons_retard: 2,
        retard_jours: 5,
        risques_count: 3,
        risques_critiques_count: 1,
        exposition_financiere: 5000,
      };

      const domainProjet = adaptProjet(apiProjet);

      expect(domainProjet.id).toBe(apiProjet.id);
      expect(domainProjet.nom).toBe(apiProjet.nom);
      expect(domainProjet.statut).toBe(apiProjet.statut);
      expect(domainProjet.budget_total).toBe(apiProjet.budget_total);
      expect(domainProjet.budget_consomme).toBe(apiProjet.budget_consomme);
    });
  });

  describe('adaptBudget', () => {
    it('should adapt BudgetGouvernance to Budget', () => {
      const apiBudget: BudgetGouvernance = {
        projet_id: 1,
        projet_nom: 'Projet Test',
        budget_initial: 100000,
        budget_consomme: 50000,
        budget_engage: 60000,
        budget_restant: 40000,
        pourcent_consomme: 50,
        depassement: 0,
        depassement_pourcent: 0,
        tendance: 'stable',
      };

      const domainBudget = adaptBudget(apiBudget);

      expect(domainBudget.projet_id).toBe(apiBudget.projet_id);
      expect(domainBudget.budget_initial).toBe(apiBudget.budget_initial);
      expect(domainBudget.budget_consomme).toBe(apiBudget.budget_consomme);
      expect(domainBudget.statut).toBeDefined();
    });

    it('should calculate statut as exceeded if depassement > 0', () => {
      const apiBudget: BudgetGouvernance = {
        projet_id: 1,
        projet_nom: 'Projet Test',
        budget_initial: 100000,
        budget_consomme: 110000,
        budget_engage: 110000,
        budget_restant: -10000,
        pourcent_consomme: 110,
        depassement: 10000,
        depassement_pourcent: 10,
        tendance: 'up',
      };

      const domainBudget = adaptBudget(apiBudget);
      expect(domainBudget.statut).toBe('exceeded');
    });
  });

  describe('adaptJalon', () => {
    it('should adapt JalonGouvernance to Jalon', () => {
      const apiJalon: JalonGouvernance = {
        id: 1,
        projet_id: 1,
        projet_nom: 'Projet Test',
        libelle: 'Jalon Test',
        type: 'SLA',
        date_prevue: '2026-01-15',
        date_reelle: '2026-01-15',
        est_retard: false,
        retard_jours: 0,
        est_sla_risque: false,
        statut: 'Terminé',
      };

      const domainJalon = adaptJalon(apiJalon);

      expect(domainJalon.id).toBe(apiJalon.id);
      expect(domainJalon.nom).toBe(apiJalon.libelle);
      expect(domainJalon.type).toBe(apiJalon.type);
      expect(domainJalon.statut).toBe('completed');
    });
  });

  describe('adaptRisque', () => {
    it('should adapt RisqueGouvernance to Risque', () => {
      const apiRisque: RisqueGouvernance = {
        id: 1,
        projet_id: 1,
        projet_nom: 'Projet Test',
        titre: 'Risque Test',
        description: 'Description',
        probabilite: 'high',
        impact: 'financial',
        exposition: 5000,
        exposition_type: 'financial',
        statut: 'ouvert',
        date_detection: '2026-01-01',
      };

      const domainRisque = adaptRisque(apiRisque);

      expect(domainRisque.id).toBe(apiRisque.id);
      expect(domainRisque.nom).toBe(apiRisque.titre);
      expect(domainRisque.probabilite).toBeGreaterThanOrEqual(0);
      expect(domainRisque.probabilite).toBeLessThanOrEqual(100);
      expect(domainRisque.impact).toBeGreaterThanOrEqual(0);
      expect(domainRisque.impact).toBeLessThanOrEqual(100);
      expect(domainRisque.score).toBeGreaterThanOrEqual(0);
      expect(domainRisque.severite).toBeDefined();
    });
  });

  describe('adaptValidation', () => {
    it('should adapt ValidationGouvernance to Validation', () => {
      const apiValidation: ValidationGouvernance = {
        id: 1,
        projet_id: 1,
        projet_nom: 'Projet Test',
        type: 'BC',
        reference: 'REF-001',
        titre: 'Validation Test',
        statut: 'en-attente',
        date_demande: '2026-01-01',
        date_echeance: '2026-01-15',
        jours_attente: 5,
      };

      const domainValidation = adaptValidation(apiValidation);

      expect(domainValidation.id).toBe(apiValidation.id);
      expect(domainValidation.type).toBe(apiValidation.type);
      expect(domainValidation.objet).toBe(apiValidation.titre);
      expect(domainValidation.statut).toBe('pending');
    });
  });

  describe('adaptGouvernanceData', () => {
    it('should adapt complete data structure', () => {
      const apiOverview: GouvernanceOverviewResponse = {
        projets_actifs: 2,
        projets_total: 2,
        budget_total: 300000,
        budget_consomme: 150000,
        budget_consomme_pourcent: 50,
        jalons_total: 15,
        jalons_valides: 10,
        jalons_retard: 5,
        risques_total: 8,
        risques_critiques: 2,
        validations_total: 5,
        validations_en_attente: 3,
        exposition_financiere: 10000,
        escalades_actives: 1,
        decisions_en_attente: 2,
        taux_conformite: 80,
      };

      const projets: ProjetGouvernance[] = [];
      const budgets: BudgetGouvernance[] = [];
      const jalons: JalonGouvernance[] = [];
      const risques: RisqueGouvernance[] = [];
      const validations: ValidationGouvernance[] = [];

      const domainData = adaptGouvernanceData(
        apiOverview,
        projets,
        budgets,
        jalons,
        risques,
        validations
      );

      expect(domainData).toBeDefined();
      expect(domainData.projets).toBeDefined();
      expect(domainData.budgets).toBeDefined();
      expect(domainData.jalons).toBeDefined();
      expect(domainData.risques).toBeDefined();
      expect(domainData.validations).toBeDefined();
    });
  });

  describe('adaptGouvernanceOverview', () => {
    it('should adapt overview response', () => {
      const apiOverview: GouvernanceOverviewResponse = {
        stats: {
          projets_actifs: 2,
          budget_consomme_pourcent: 50,
          jalons_respectes_pourcent: 80,
          risques_critiques: 2,
          validations_en_attente: 3,
          budget_total: 300000,
          budget_consomme: 150000,
          jalons_total: 15,
          jalons_valides: 10,
          jalons_retard: 5,
          exposition_financiere: 10000,
          escalades_actives: 1,
          decisions_en_attente: 2,
          taux_conformite: 80,
        },
        projets: [],
        tendances: [],
        points_attention: [],
      };

      const domainOverview = adaptGouvernanceOverview(apiOverview);

      expect(domainOverview.projets_actifs).toBe(2);
      expect(domainOverview.budget_total).toBe(300000);
      expect(domainOverview.jalons_total).toBe(15);
    });
  });

  describe('adaptGouvernanceStats', () => {
    it('should adapt stats response', () => {
      const apiStats: ApiGouvernanceStats = {
        projets_actifs: 2,
        budget_consomme_pourcent: 50,
        jalons_respectes_pourcent: 80,
        risques_critiques: 2,
        validations_en_attente: 3,
        budget_total: 300000,
        budget_consomme: 150000,
        jalons_total: 15,
        jalons_valides: 12,
        jalons_retard: 3,
        exposition_financiere: 10000,
        escalades_actives: 1,
        decisions_en_attente: 2,
        taux_conformite: 80,
      };

      const domainStats = adaptGouvernanceStats(apiStats);

      expect(domainStats.projets_actifs).toBe(2);
      expect(domainStats.budget_consomme_pourcent).toBe(50);
      expect(domainStats.jalons_respectes_pourcent).toBe(80);
    });
  });
});
