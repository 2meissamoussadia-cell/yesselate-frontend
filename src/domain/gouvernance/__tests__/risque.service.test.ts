/**
 * Tests unitaires pour RisqueService
 */

import { describe, it, expect } from '@jest/globals';
import { RisqueService } from '../services/risque.service';
import type { Risque } from '../types/gouvernance.types';

describe('RisqueService', () => {
  const mockRisque: Risque = {
    id: 1,
    nom: 'Risque Test',
    description: 'Description',
    severite: 'medium',
    probabilite: 50,
    impact: 50,
    score: 25,
    statut: 'ouvert',
    projet_id: 1,
  };

  const mockRisqueCritical: Risque = {
    ...mockRisque,
    id: 2,
    severite: 'critical',
    probabilite: 90,
    impact: 90,
    score: 81,
  };

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly', () => {
      const metrics = RisqueService.calculateMetrics(mockRisque);

      expect(metrics).toBeDefined();
      expect(metrics.score).toBe(25);
      expect(metrics.criticite).toBe('medium');
      expect(metrics.exposition).toBeGreaterThanOrEqual(0);
    });

    it('should identify critical risque', () => {
      const metrics = RisqueService.calculateMetrics(mockRisqueCritical);
      expect(metrics.criticite).toBe('critical');
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for critical risque', () => {
      const alerts = RisqueService.getAlerts(mockRisqueCritical);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'critical')).toBe(true);
    });
  });

  describe('getCriticalRisques', () => {
    it('should filter critical risques', () => {
      const risques = [mockRisque, mockRisqueCritical];
      const critical = RisqueService.getCriticalRisques(risques);

      expect(critical.length).toBe(1);
      expect(critical[0].severite).toBe('critical');
    });
  });

  describe('calculateExpositionFinanciere', () => {
    it('should calculate total financial exposure', () => {
      const risques = [mockRisque, mockRisqueCritical];
      const exposition = RisqueService.calculateExpositionFinanciere(risques);

      expect(exposition).toBeGreaterThanOrEqual(0);
    });
  });
});
