/**
 * Tests unitaires pour SLAService
 */

import { describe, it, expect } from '@jest/globals';
import { SLAService } from '../services/sla.service';
import type { Jalon } from '../types/calendrier.types';

describe('SLAService', () => {
  const mockJalonSLA: Jalon = {
    id: 1,
    chantier_id: 1,
    libelle: 'Jalon SLA',
    type: 'SLA',
    date_debut: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], // 10 jours dans le passé
    date_fin: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0], // 20 jours dans le futur
    est_retard: false,
    est_sla_risque: false,
    statut: 'À venir',
  };

  const mockJalonAtRisk: Jalon = {
    ...mockJalonSLA,
    id: 2,
    date_fin: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 jours
    est_sla_risque: true,
    statut: 'En cours',
  };

  const mockJalonOverdue: Jalon = {
    ...mockJalonSLA,
    id: 3,
    date_fin: '2026-01-01', // Passé
    est_retard: true,
    statut: 'En cours',
  };

  describe('calculateMetrics', () => {
    it('should calculate metrics for SLA jalon', () => {
      const metrics = SLAService.calculateMetrics(mockJalonSLA);

      expect(metrics).toBeDefined();
      // jours_restants peut être négatif si le jalon est passé
      expect(typeof metrics.jours_restants).toBe('number');
      expect(metrics.is_at_risk).toBe(false);
      expect(metrics.is_overdue).toBe(false);
      expect(metrics.criticite).toBeDefined();
    });

    it('should identify at-risk jalon', () => {
      const metrics = SLAService.calculateMetrics(mockJalonAtRisk);
      expect(metrics.is_at_risk).toBe(true);
    });

    it('should identify overdue jalon', () => {
      const metrics = SLAService.calculateMetrics(mockJalonOverdue);
      expect(metrics.is_overdue).toBe(true);
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for at-risk jalon', () => {
      const alerts = SLAService.getAlerts(mockJalonAtRisk);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'at_risk')).toBe(true);
    });

    it('should return alerts for overdue jalon', () => {
      const alerts = SLAService.getAlerts(mockJalonOverdue);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'overdue')).toBe(true);
    });
  });

  describe('getAtRiskJalons', () => {
    it('should filter at-risk jalons', () => {
      const jalons = [mockJalonSLA, mockJalonAtRisk, mockJalonOverdue];
      const atRisk = SLAService.getAtRiskJalons(jalons);

      expect(atRisk.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateConformityRate', () => {
    it('should calculate conformity rate', () => {
      const jalons = [
        { ...mockJalonSLA, statut: 'Terminé' },
        { ...mockJalonAtRisk, statut: 'Terminé' },
        mockJalonOverdue,
      ];
      const rate = SLAService.calculateConformityRate(jalons);

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  });
});
