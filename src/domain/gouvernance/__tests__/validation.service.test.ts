/**
 * Tests unitaires pour ValidationService
 */

import { describe, it, expect } from '@jest/globals';
import { ValidationService } from '../services/validation.service';
import type { Validation } from '../types/gouvernance.types';

describe('ValidationService', () => {
  const mockValidation: Validation = {
    id: 1,
    type: 'BC',
    objet: 'Validation Test',
    statut: 'pending',
    projet_id: 1,
    date_demande: '2026-01-01',
  };

  const mockValidationOverdue: Validation = {
    ...mockValidation,
    id: 2,
    date_demande: '2025-12-01', // Il y a plus de 30 jours
  };

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly', () => {
      const metrics = ValidationService.calculateMetrics(mockValidation);

      expect(metrics).toBeDefined();
      expect(metrics.jours_attente).toBeGreaterThanOrEqual(0);
      expect(metrics.priorite).toBeDefined();
    });

    it('should identify overdue validation', () => {
      const metrics = ValidationService.calculateMetrics(mockValidationOverdue);
      expect(metrics.is_overdue).toBe(true);
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for overdue validation', () => {
      const alerts = ValidationService.getAlerts(mockValidationOverdue);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'overdue')).toBe(true);
    });
  });

  describe('getOverdueValidations', () => {
    it('should filter overdue validations', () => {
      const validations = [mockValidation, mockValidationOverdue];
      const overdue = ValidationService.getOverdueValidations(validations);

      expect(overdue.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateAverageWaitTime', () => {
    it('should calculate average wait time', () => {
      const validations = [mockValidation, mockValidationOverdue];
      const avgWait = ValidationService.calculateAverageWaitTime(validations);

      expect(avgWait).toBeGreaterThanOrEqual(0);
    });
  });
});
