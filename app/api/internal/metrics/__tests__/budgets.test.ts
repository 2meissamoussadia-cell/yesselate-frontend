/**
 * Tests unitaires P11 — budgets (normalizeRouteForBudget, getBudgetForRoute, exceedsBudget)
 */

import { describe, it, expect } from '@jest/globals';
import {
  normalizeRouteForBudget,
  getBudgetForRoute,
  exceedsBudget,
} from '../budgets';

describe('budgets (P11)', () => {
  describe('normalizeRouteForBudget', () => {
    it('normalizes dashboard dynamic route to [main]/[sub]/[leaf]', () => {
      expect(normalizeRouteForBudget('/api/dashboard/overview/summary/dashboard')).toBe(
        '/api/dashboard/[main]/[sub]/[leaf]'
      );
      expect(normalizeRouteForBudget('/api/dashboard/performance/kpis/projets')).toBe(
        '/api/dashboard/[main]/[sub]/[leaf]'
      );
    });

    it('normalizes export dashboard by format', () => {
      expect(normalizeRouteForBudget('/api/export/dashboard/csv')).toBe('/api/export/dashboard/csv');
      expect(normalizeRouteForBudget('/api/export/dashboard/json')).toBe('/api/export/dashboard/json');
      expect(normalizeRouteForBudget('/api/export/dashboard/pdf')).toBe('/api/export/dashboard/pdf');
      expect(normalizeRouteForBudget('/api/export/dashboard/excel')).toBe('/api/export/dashboard/excel');
    });

    it('returns /api/export/dashboard for export without format', () => {
      expect(normalizeRouteForBudget('/api/export/dashboard')).toBe('/api/export/dashboard');
    });

    it('returns route as-is when no normalisation applies', () => {
      expect(normalizeRouteForBudget('/api/me/policy')).toBe('/api/me/policy');
    });
  });

  describe('getBudgetForRoute', () => {
    it('returns budget for dashboard route', () => {
      const budget = getBudgetForRoute('/api/dashboard/overview/summary/dashboard');
      expect(budget).not.toBeNull();
      expect(budget?.p95_ms).toBe(400);
      expect(budget?.p99_ms).toBe(900);
    });

    it('returns budget for export route', () => {
      const budget = getBudgetForRoute('/api/export/dashboard');
      expect(budget).not.toBeNull();
      expect(budget?.p95_ms).toBe(800);
    });

    it('returns budget for /api/me/policy', () => {
      const budget = getBudgetForRoute('/api/me/policy');
      expect(budget).not.toBeNull();
      expect(budget?.p95_ms).toBe(150);
    });

    it('returns null for unknown route', () => {
      expect(getBudgetForRoute('/api/unknown')).toBeNull();
    });
  });

  describe('exceedsBudget', () => {
    it('returns true when duration exceeds p95', () => {
      expect(exceedsBudget('/api/dashboard/overview/summary/dashboard', 500)).toBe(true);
      expect(exceedsBudget('/api/dashboard/overview/summary/dashboard', 400)).toBe(false);
      expect(exceedsBudget('/api/dashboard/overview/summary/dashboard', 399)).toBe(false);
    });

    it('returns false when no budget for route', () => {
      expect(exceedsBudget('/api/unknown', 10000)).toBe(false);
    });
  });
});
