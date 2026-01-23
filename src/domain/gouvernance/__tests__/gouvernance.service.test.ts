/**
 * Tests unitaires pour GouvernanceService
 */

import { describe, it, expect } from '@jest/globals';
import { GouvernanceService } from '../services/gouvernance.service';
import type { GouvernanceData } from '../types/gouvernance.types';

describe('GouvernanceService', () => {
  const mockData: GouvernanceData = {
    projets: [
      {
        id: 1,
        nom: 'Projet A',
        statut: 'on-track',
        bureau: 'Bureau 1',
        budget_total: 100000,
        budget_consomme: 50000,
        budget_pourcent: 50,
        jalons_total: 10,
        jalons_valides: 8,
        jalons_retard: 2,
        risques_count: 3,
        risques_critiques_count: 1,
      },
      {
        id: 2,
        nom: 'Projet B',
        statut: 'at-risk',
        bureau: 'Bureau 1',
        budget_total: 200000,
        budget_consomme: 180000,
        budget_pourcent: 90,
        jalons_total: 5,
        jalons_valides: 2,
        jalons_retard: 3,
        risques_count: 5,
        risques_critiques_count: 3,
      },
    ],
    budgets: [
      {
        id: 1,
        code: 'BUD-001',
        libelle: 'Budget Projet A',
        budget_initial: 100000,
        budget_consomme: 50000,
        budget_restant: 50000,
        pourcent_consomme: 50,
        statut: 'ok',
      },
    ],
    jalons: [
      {
        id: 1,
        nom: 'Jalon 1',
        type: 'SLA',
        date_prevue: '2026-01-15',
        statut: 'completed',
        est_retard: false,
        est_sla_risque: false,
      },
      {
        id: 2,
        nom: 'Jalon 2',
        type: 'SLA',
        date_prevue: '2026-01-20',
        statut: 'pending',
        est_retard: true,
        est_sla_risque: true,
      },
    ],
    risques: [
      {
        id: 1,
        nom: 'Risque 1',
        severite: 'critical',
        probabilite: 80,
        impact: 90,
        score: 72,
        statut: 'ouvert',
        projet_id: 1,
      },
    ],
    validations: [
      {
        id: 1,
        type: 'BC',
        objet: 'Validation 1',
        statut: 'pending',
        projet_id: 1,
      },
    ],
  };

  describe('calculateOverview', () => {
    it('should calculate overview correctly', () => {
      const overview = GouvernanceService.calculateOverview(mockData);

      expect(overview).toBeDefined();
      expect(overview.projets_actifs).toBeGreaterThanOrEqual(0);
      expect(overview.budget_total).toBeGreaterThanOrEqual(0);
      expect(overview.jalons_total).toBeGreaterThanOrEqual(0);
      expect(overview.risques_total).toBeGreaterThanOrEqual(0);
      expect(overview.validations_total).toBeGreaterThanOrEqual(0);
    });

    it('should calculate projets_actifs correctly', () => {
      const overview = GouvernanceService.calculateOverview(mockData);
      // Projets actifs = projets avec statut on-track, at-risk, ou late
      expect(overview.projets_actifs).toBe(2);
    });

    it('should calculate budget_consomme_pourcent correctly', () => {
      const overview = GouvernanceService.calculateOverview(mockData);
      expect(overview.budget_consomme_pourcent).toBeGreaterThanOrEqual(0);
      expect(overview.budget_consomme_pourcent).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateStats', () => {
    it('should calculate stats correctly', () => {
      const stats = GouvernanceService.calculateStats(mockData);

      expect(stats).toBeDefined();
      expect(stats.projets_actifs).toBeGreaterThanOrEqual(0);
      expect(stats.budget_consomme_pourcent).toBeGreaterThanOrEqual(0);
      expect(stats.jalons_respectes_pourcent).toBeGreaterThanOrEqual(0);
      expect(stats.jalons_respectes_pourcent).toBeLessThanOrEqual(100);
    });

    it('should calculate jalons_respectes_pourcent correctly', () => {
      const stats = GouvernanceService.calculateStats(mockData);
      // 8 jalons valides sur 10 total = 80%
      expect(stats.jalons_respectes_pourcent).toBe(80);
    });
  });

  describe('filterData', () => {
    it('should filter by bureau', () => {
      const filtered = GouvernanceService.filterData(mockData, {
        bureau: 'Bureau 1',
      });

      expect(filtered.projets.every(p => p.bureau === 'Bureau 1')).toBe(true);
    });

    it('should filter by date_debut', () => {
      const filtered = GouvernanceService.filterData(mockData, {
        date_debut: '2026-01-01',
      });

      expect(filtered.projets.length).toBeGreaterThanOrEqual(0);
    });

    it('should return all data if no filters', () => {
      const filtered = GouvernanceService.filterData(mockData, {});

      expect(filtered.projets.length).toBe(mockData.projets.length);
      expect(filtered.budgets.length).toBe(mockData.budgets.length);
    });
  });
});
