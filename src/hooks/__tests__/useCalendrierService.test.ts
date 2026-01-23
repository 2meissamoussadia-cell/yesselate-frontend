/**
 * Tests unitaires pour useCalendrierService
 */

import { describe, it, expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useCalendrierService } from '../useCalendrierService';
import type { CalendrierData } from '@/domain/calendrier/types';

describe('useCalendrierService', () => {
  const mockData: CalendrierData = {
    evenements: [
      {
        id: 1,
        type: 'EVENEMENT',
        titre: 'Événement Test',
        date_debut: new Date().toISOString(),
        date_fin: new Date(Date.now() + 3600000).toISOString(),
        chantier_id: 1,
      },
    ],
    jalons: [
      {
        id: 1,
        chantier_id: 1,
        libelle: 'Jalon SLA',
        type: 'SLA',
        date_debut: '2026-01-01',
        date_fin: '2026-01-15',
        est_retard: false,
        est_sla_risque: false,
        statut: 'À venir',
      },
    ],
    absences: [],
    affectations: [],
    alertes: [],
  };

  it('should return null overview when data is null', () => {
    const { result } = renderHook(() => useCalendrierService(null));

    expect(result.current.overview).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it('should calculate overview when data is provided', () => {
    const { result } = renderHook(() => useCalendrierService(mockData));

    expect(result.current.overview).toBeDefined();
    expect(result.current.overview?.evenements_total).toBeGreaterThanOrEqual(0);
  });

  it('should calculate stats when data is provided', () => {
    const { result } = renderHook(() => useCalendrierService(mockData));

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.evenements_total).toBeGreaterThanOrEqual(0);
  });

  it('should detect conflicts', () => {
    const { result } = renderHook(() => useCalendrierService(mockData));

    expect(result.current.conflits).toBeDefined();
    expect(result.current.hasConflits).toBeDefined();
    expect(typeof result.current.hasConflits).toBe('boolean');
  });

  it('should provide SLA metrics', () => {
    const { result } = renderHook(() => useCalendrierService(mockData));

    expect(result.current.slaMetrics).toBeDefined();
    expect(Array.isArray(result.current.slaMetrics)).toBe(true);
  });

  it('should provide filterData function', () => {
    const { result } = renderHook(() => useCalendrierService(mockData));

    expect(result.current.filterData).toBeDefined();
    expect(typeof result.current.filterData).toBe('function');
  });

  it('should provide services object', () => {
    const { result } = renderHook(() => useCalendrierService(mockData));

    expect(result.current.services).toBeDefined();
    expect(result.current.services.calendrier).toBeDefined();
    expect(result.current.services.sla).toBeDefined();
  });
});
