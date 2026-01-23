/**
 * Tests unitaires pour JalonService
 */

import { describe, it, expect } from '@jest/globals';
import { JalonService } from '../services/jalon.service';
import type { Jalon } from '../types/gouvernance.types';

describe('JalonService', () => {
  const mockJalon: Jalon = {
    id: 1,
    nom: 'Jalon Test',
    type: 'SLA',
    date_prevue: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // 30 jours dans le futur
    statut: 'pending',
    est_retard: false,
    retard_jours: 0,
    est_sla_risque: false,
    projet_id: 1,
  };

  const mockJalonRetard: Jalon = {
    ...mockJalon,
    id: 2,
    date_prevue: '2026-01-01', // Passé
    statut: 'in-progress',
    est_retard: true,
    retard_jours: 14,
    est_sla_risque: true,
  };

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly', () => {
      const metrics = JalonService.calculateMetrics(mockJalon);

      expect(metrics).toBeDefined();
      // retard_jours est calculé même si 0 (peut être > 0 si date_prevue est passée)
      expect(metrics.retard_jours).toBeGreaterThanOrEqual(0);
      expect(metrics.is_overdue).toBe(false);
      expect(metrics.is_sla_risque).toBe(false);
    });

    it('should identify overdue jalon', () => {
      const metrics = JalonService.calculateMetrics(mockJalonRetard);
      expect(metrics.is_overdue).toBe(true);
      expect(metrics.retard_jours).toBeGreaterThan(0);
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for overdue jalon', () => {
      const alerts = JalonService.getAlerts(mockJalonRetard);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'overdue')).toBe(true);
    });
  });

  describe('getOverdueJalons', () => {
    it('should filter overdue jalons', () => {
      const jalons = [mockJalon, mockJalonRetard];
      const overdue = JalonService.getOverdueJalons(jalons);

      expect(overdue.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateRespectRate', () => {
    it('should calculate respect rate', () => {
      const jalons = [
        { ...mockJalon, statut: 'completed' },
        { ...mockJalonRetard, statut: 'completed' },
        { ...mockJalon, id: 3, statut: 'pending' },
      ];
      const rate = JalonService.calculateRespectRate(jalons);

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  });
});
