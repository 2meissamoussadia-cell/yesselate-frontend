/**
 * Tests unitaires pour useGouvernanceDataWithDomain
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useGouvernanceDataWithDomain } from '../useGouvernanceDataWithDomain';
import * as gouvernanceApi from '../../api/gouvernanceApi';

// Mock des dépendances
jest.mock('../../api/gouvernanceApi');
jest.mock('../../hooks/useGouvernanceFilters', () => ({
  useGouvernanceFilters: () => ({
    getFilters: () => ({
      periode: 'month',
      projet_id: null,
      date_debut: null,
      date_fin: null,
    }),
  }),
}));

describe('useGouvernanceDataWithDomain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state initially', () => {
    (gouvernanceApi.getGouvernanceOverview as jest.Mock).mockResolvedValue({
      projets: [],
      budgets: [],
      jalons: [],
      risques: [],
      validations: [],
    });

    const { result } = renderHook(() =>
      useGouvernanceDataWithDomain('executive-dashboard')
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch and adapt data', async () => {
    const mockApiData = {
      projets: [
        {
          id: 1,
          nom: 'Projet Test',
          statut: 'on-track',
          budget_total: 100000,
          budget_consomme: 50000,
          budget_pourcent: 50,
          jalons_total: 10,
          jalons_valides: 8,
          jalons_retard: 2,
          risques_count: 3,
          risques_critiques_count: 1,
          exposition_financiere: 5000,
        },
      ],
      budgets: [],
      jalons: [],
      risques: [],
      validations: [],
    };

    (gouvernanceApi.getGouvernanceOverview as jest.Mock).mockResolvedValue(mockApiData);

    const { result } = renderHook(() =>
      useGouvernanceDataWithDomain('executive-dashboard')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.domainData).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    (gouvernanceApi.getGouvernanceOverview as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    const { result } = renderHook(() =>
      useGouvernanceDataWithDomain('executive-dashboard')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });
});
