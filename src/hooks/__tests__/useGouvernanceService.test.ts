/**
 * Tests unitaires pour useGouvernanceService
 */

import { describe, it, expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useGouvernanceService } from '../useGouvernanceService';
import type { GouvernanceData } from '@/domain/gouvernance/types';

describe('useGouvernanceService', () => {
  const mockData: GouvernanceData = {
    projets: [
      {
        id: 1,
        nom: 'Projet Test',
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
    ],
    budgets: [],
    jalons: [],
    risques: [],
    validations: [],
  };

  it('should return null overview when data is null', () => {
    const { result } = renderHook(() => useGouvernanceService(null));

    expect(result.current.overview).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it('should calculate overview when data is provided', () => {
    const { result } = renderHook(() => useGouvernanceService(mockData));

    expect(result.current.overview).toBeDefined();
    expect(result.current.overview?.projets_actifs).toBeGreaterThanOrEqual(0);
  });

  it('should calculate stats when data is provided', () => {
    const { result } = renderHook(() => useGouvernanceService(mockData));

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.projets_actifs).toBeGreaterThanOrEqual(0);
  });

  it('should provide projets metrics', () => {
    const { result } = renderHook(() => useGouvernanceService(mockData));

    expect(result.current.projetsMetrics).toBeDefined();
    expect(Array.isArray(result.current.projetsMetrics)).toBe(true);
  });

  it('should provide budgets metrics', () => {
    const { result } = renderHook(() => useGouvernanceService(mockData));

    expect(result.current.budgetsMetrics).toBeDefined();
    expect(Array.isArray(result.current.budgetsMetrics)).toBe(true);
  });

  it('should provide filterData function', () => {
    const { result } = renderHook(() => useGouvernanceService(mockData));

    expect(result.current.filterData).toBeDefined();
    expect(typeof result.current.filterData).toBe('function');
  });

  it('should provide services object', () => {
    const { result } = renderHook(() => useGouvernanceService(mockData));

    expect(result.current.services).toBeDefined();
    expect(result.current.services.gouvernance).toBeDefined();
    expect(result.current.services.projet).toBeDefined();
  });
});
