/**
 * Tests unitaires pour ProjetService
 */

import { describe, it, expect } from '@jest/globals';
import { ProjetService } from '../services/projet.service';
import type { Projet } from '../types/gouvernance.types';

describe('ProjetService', () => {
  const mockProjet: Projet = {
    id: 1,
    nom: 'Projet Test',
    code: 'PRJ-001',
    statut: 'on-track',
    bureau: 'Bureau 1',
    budget_total: 100000,
    budget_consomme: 50000,
    budget_pourcent: 50,
    jalons_total: 10,
    jalons_valides: 8,
    jalons_retard: 2,
    retard_jours: 5,
    risques_count: 3,
    risques_critiques_count: 1,
  };

  const mockProjetAtRisk: Projet = {
    ...mockProjet,
    id: 2,
    statut: 'at-risk',
    budget_pourcent: 95,
    risques_critiques_count: 5,
  };

  const mockProjetLate: Projet = {
    ...mockProjet,
    id: 3,
    statut: 'late',
    retard_jours: 30,
  };

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly', () => {
      const metrics = ProjetService.calculateMetrics(mockProjet);

      expect(metrics).toBeDefined();
      expect(metrics.budget_consomme_pourcent).toBe(50);
      expect(metrics.jalons_respectes_pourcent).toBe(80);
      expect(metrics.risques_critiques_count).toBe(1);
      expect(metrics.retard_jours).toBe(5);
      expect(metrics.health_score).toBeGreaterThanOrEqual(0);
      expect(metrics.health_score).toBeLessThanOrEqual(100);
    });

    it('should identify at-risk project', () => {
      const metrics = ProjetService.calculateMetrics(mockProjetAtRisk);
      expect(metrics.is_at_risk).toBe(true);
    });

    it('should identify late project', () => {
      const metrics = ProjetService.calculateMetrics(mockProjetLate);
      expect(metrics.is_late).toBe(true);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary with alerts', () => {
      const summary = ProjetService.generateSummary(mockProjetAtRisk);

      expect(summary).toBeDefined();
      expect(summary.alerts).toBeDefined();
      expect(summary.recommendations).toBeDefined();
      expect(summary.alerts.length).toBeGreaterThan(0);
    });

    it('should include budget alert if budget > 90%', () => {
      const summary = ProjetService.generateSummary(mockProjetAtRisk);
      const hasBudgetAlert = summary.alerts.some(a => a.includes('Budget'));
      expect(hasBudgetAlert).toBe(true);
    });
  });

  describe('filterProjets', () => {
    const projets = [mockProjet, mockProjetAtRisk, mockProjetLate];

    it('should filter by bureau', () => {
      const filtered = ProjetService.filterProjets(projets, {
        bureau: 'Bureau 1',
      });

      expect(filtered.length).toBe(3);
      expect(filtered.every(p => p.bureau === 'Bureau 1')).toBe(true);
    });

    it('should filter by statut', () => {
      const filtered = ProjetService.filterProjets(projets, {
        statut: 'at-risk',
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].statut).toBe('at-risk');
    });

    it('should filter by search', () => {
      const filtered = ProjetService.filterProjets(projets, {
        search: 'Test',
      });

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(p => 
        p.nom.toLowerCase().includes('test') || 
        p.code?.toLowerCase().includes('test')
      )).toBe(true);
    });
  });

  describe('sortByPriority', () => {
    it('should sort by priority (late > at-risk > on-track)', () => {
      const projets = [mockProjet, mockProjetAtRisk, mockProjetLate];
      const sorted = ProjetService.sortByPriority(projets);

      expect(sorted[0].statut).toBe('late');
      expect(sorted[1].statut).toBe('at-risk');
      expect(sorted[2].statut).toBe('on-track');
    });
  });
});
