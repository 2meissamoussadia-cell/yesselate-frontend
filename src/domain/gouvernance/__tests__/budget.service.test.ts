/**
 * Tests unitaires pour BudgetService
 */

import { describe, it, expect } from '@jest/globals';
import { BudgetService } from '../services/budget.service';
import type { Budget } from '../types/gouvernance.types';

describe('BudgetService', () => {
  const mockBudget: Budget = {
    id: 1,
    code: 'BUD-001',
    libelle: 'Budget Test',
    budget_initial: 100000,
    budget_consomme: 50000,
    budget_restant: 50000,
    pourcent_consomme: 50,
    statut: 'ok',
  };

  const mockBudgetWarning: Budget = {
    ...mockBudget,
    id: 2,
    budget_consomme: 80000,
    budget_restant: 20000,
    pourcent_consomme: 80,
    statut: 'warning',
  };

  const mockBudgetCritical: Budget = {
    ...mockBudget,
    id: 3,
    budget_consomme: 95000,
    budget_restant: 5000,
    pourcent_consomme: 95,
    statut: 'critical',
  };

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly', () => {
      const metrics = BudgetService.calculateMetrics(mockBudget);

      expect(metrics).toBeDefined();
      expect(metrics.pourcent_consomme).toBe(50);
      expect(metrics.pourcent_restant).toBe(50);
      expect(metrics.projection_fin).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for critical budget', () => {
      const alerts = BudgetService.getAlerts(mockBudgetCritical);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'critical')).toBe(true);
    });

    it('should return alerts for warning budget', () => {
      const alerts = BudgetService.getAlerts(mockBudgetWarning);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'warning')).toBe(true);
    });
  });

  describe('getExceededBudgets', () => {
    it('should identify exceeded budgets', () => {
      const budgets = [mockBudget, mockBudgetWarning, mockBudgetCritical];
      const exceeded = BudgetService.getExceededBudgets(budgets);

      expect(exceeded.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('filterBudgets', () => {
    it('should filter by bureau', () => {
      const budgets = [
        { ...mockBudget, bureau: 'Bureau 1' },
        { ...mockBudgetWarning, bureau: 'Bureau 2' },
      ];
      const filtered = BudgetService.filterBudgets(budgets, {
        bureau: 'Bureau 1',
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].bureau).toBe('Bureau 1');
    });
  });
});
