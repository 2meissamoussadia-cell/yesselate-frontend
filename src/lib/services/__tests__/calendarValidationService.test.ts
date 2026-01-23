/**
 * Tests unitaires pour calendarValidationService
 */

import { describe, it, expect } from '@jest/globals';
import { CalendarValidationService } from '../calendarValidationService';
import type { EventData } from '../calendarValidationService';

const service = new CalendarValidationService();

describe('CalendarValidationService', () => {
  describe('validateEvent', () => {
    it('should validate a valid event', () => {
      const event: EventData = {
        title: 'Réunion équipe',
        description: 'Réunion hebdomadaire',
        start: new Date('2025-02-01T10:00:00'),
        end: new Date('2025-02-01T11:00:00'),
        category: 'meeting',
        priority: 'normal',
        status: 'open',
        bureau: 'BMO'
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject event without title', () => {
      const event: EventData = {
        title: '',
        start: new Date('2025-02-01T10:00:00'),
        end: new Date('2025-02-01T11:00:00')
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
      expect(result.errors.some(e => e.code === 'TITLE_REQUIRED')).toBe(true);
    });

    it('should reject event with title too long', () => {
      const event: EventData = {
        title: 'A'.repeat(201), // > 200 caractères
        start: new Date('2025-02-01T10:00:00'),
        end: new Date('2025-02-01T11:00:00')
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TITLE_TOO_LONG')).toBe(true);
    });

    it('should reject event without start date', () => {
      const event: EventData = {
        title: 'Réunion',
        start: null as any,
        end: new Date('2025-02-01T11:00:00')
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'start')).toBe(true);
    });

    it('should reject event with end before start', () => {
      const event: EventData = {
        title: 'Réunion',
        start: new Date('2025-02-01T11:00:00'),
        end: new Date('2025-02-01T10:00:00') // Avant start
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'END_BEFORE_START')).toBe(true);
    });

    it('should warn for invalid category', () => {
      const event: EventData = {
        title: 'Réunion',
        start: new Date('2025-02-01T10:00:00'),
        end: new Date('2025-02-01T11:00:00'),
        category: 'invalid-category'
      };

      const result = service.validateEvent(event);

      // Invalid category is a warning, not an error
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'INVALID_CATEGORY')).toBe(true);
    });

    it('should warn for invalid priority', () => {
      const event: EventData = {
        title: 'Réunion',
        start: new Date('2025-02-01T10:00:00'),
        end: new Date('2025-02-01T11:00:00'),
        priority: 'invalid-priority'
      };

      const result = service.validateEvent(event);

      // Invalid priority is a warning, not an error
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'INVALID_PRIORITY')).toBe(true);
    });

    it('should reject event with too many attendees', () => {
      const event: EventData = {
        title: 'Réunion',
        start: new Date('2025-02-01T10:00:00'),
        end: new Date('2025-02-01T11:00:00'),
        attendees: Array.from({ length: 51 }, (_, i) => ({
          name: `Participant ${i}`,
          email: `participant${i}@example.com`
        }))
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TOO_MANY_ATTENDEES')).toBe(true);
    });

    it('should warn for very long duration (>24h)', () => {
      const event: EventData = {
        title: 'Événement très long',
        start: new Date('2025-02-01T09:00:00'),
        end: new Date('2025-02-02T10:00:00'), // > 24 heures
        allDay: false
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'LONG_DURATION')).toBe(true);
    });

    it('should accept valid all-day event', () => {
      const event: EventData = {
        title: 'Jour férié',
        start: new Date('2025-05-01T00:00:00'),
        end: new Date('2025-05-01T23:59:59'),
        allDay: true
      };

      const result = service.validateEvent(event);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});

