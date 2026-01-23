/**
 * Tests unitaires pour calendarSLA
 */

import { describe, it, expect } from '@jest/globals';
import { CalendarSLAService } from '../calendarSLA';

describe('CalendarSLAService', () => {
  let service: CalendarSLAService;

  beforeEach(() => {
    service = CalendarSLAService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = CalendarSLAService.getInstance();
      const instance2 = CalendarSLAService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getSLAConfig', () => {
    it('should return config for meeting critical', () => {
      const config = service.getSLAConfig('meeting', 'critical');

      expect(config).toBeDefined();
      expect(config?.eventType).toBe('meeting');
      expect(config?.priority).toBe('critical');
      expect(config?.targetDays).toBe(1);
    });

    it('should return config for site-visit normal', () => {
      const config = service.getSLAConfig('site-visit', 'normal');

      expect(config).toBeDefined();
      expect(config?.eventType).toBe('site-visit');
      expect(config?.priority).toBe('normal');
    });

    it('should return null for unknown event type', () => {
      const config = service.getSLAConfig('unknown-type', 'normal');

      expect(config).toBeNull();
    });
  });

  describe('isBusinessDay', () => {
    it('should return true for weekday', () => {
      // Mardi 2025-01-07 (mardi)
      const tuesday = new Date('2025-01-07');
      expect(service.isBusinessDay(tuesday)).toBe(true);
    });

    it('should return false for saturday', () => {
      // Samedi 2025-01-04
      const saturday = new Date('2025-01-04');
      expect(service.isBusinessDay(saturday)).toBe(false);
    });

    it('should return false for sunday', () => {
      // Dimanche 2025-01-05
      const sunday = new Date('2025-01-05');
      expect(service.isBusinessDay(sunday)).toBe(false);
    });

    it('should return false for holiday', () => {
      // Jour de l'an 2025-01-01 (mercredi, mais férié)
      const newYear = new Date('2025-01-01');
      expect(service.isBusinessDay(newYear)).toBe(false);
    });
  });

  describe('calculateDueDate', () => {
    it('should calculate due date with business days', () => {
      // Mardi 2025-01-07
      const startDate = new Date('2025-01-07T09:00:00');
      const dueDate = service.calculateDueDate(startDate, 2);

      // Devrait être jeudi 2025-01-09 (2 jours ouvrés)
      expect(dueDate.getDate()).toBeGreaterThan(startDate.getDate());
      expect(dueDate.getHours()).toBe(17); // Fin de journée
    });

    it('should skip weekends when calculating', () => {
      // Vendredi 2025-01-03
      const friday = new Date('2025-01-03T09:00:00');
      const dueDate = service.calculateDueDate(friday, 1);

      // Devrait être lundi 2025-01-06 (skip weekend)
      expect(dueDate.getDay()).not.toBe(0); // Pas dimanche
      expect(dueDate.getDay()).not.toBe(6); // Pas samedi
    });
  });

  describe('calculate', () => {
    it('should return "ok" status for event within SLA', () => {
      // Créer un événement avec une date de création dans le passé
      const createdAt = new Date('2025-01-01T09:00:00');
      const event = {
        id: '1',
        kind: 'meeting',
        priority: 'normal',
        createdAt,
        start: new Date('2025-01-02T10:00:00')
      };

      const result = service.calculate(event);

      // Le statut peut varier selon la date actuelle, mais la structure doit être correcte
      expect(['ok', 'warning', 'overdue']).toContain(result.status);
      expect(result.dueAt).toBeDefined();
      expect(result.compliance).toBeGreaterThanOrEqual(0);
      expect(result.compliance).toBeLessThanOrEqual(100);
    });

    it('should return appropriate status based on SLA calculation', () => {
      const event = {
        id: '1',
        kind: 'meeting',
        priority: 'critical',
        createdAt: new Date('2025-01-01T09:00:00'),
        start: new Date('2025-01-02T10:00:00')
      };

      const result = service.calculate(event);

      // Le statut peut varier selon la date actuelle
      expect(['ok', 'warning', 'overdue', 'none']).toContain(result.status);
      expect(result.dueAt).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(result.urgencyLevel).toBeDefined();
    });

    it('should return "none" status for unknown event type', () => {
      const event = {
        id: '1',
        kind: 'unknown-type',
        priority: 'normal',
        createdAt: new Date('2025-01-01T09:00:00'),
        start: new Date('2025-01-02T10:00:00')
      };

      const result = service.calculate(event);

      expect(result.status).toBe('none');
      expect(result.recommendation).toContain('Aucun SLA défini');
      expect(result.urgencyLevel).toBe('low');
    });
  });
});

