/**
 * Tests unitaires pour RecurrenceService
 */

import { describe, it, expect } from '@jest/globals';
import { RecurrenceService } from '../services/recurrence.service';
import type { Recurrence } from '../types/calendrier.types';

describe('RecurrenceService', () => {
  const mockRecurrenceDaily: Recurrence = {
    type: 'daily',
    interval: 1,
  };

  const mockRecurrenceWeekly: Recurrence = {
    type: 'weekly',
    interval: 1,
    daysOfWeek: [1, 3, 5], // Lundi, Mercredi, Vendredi
  };

  const mockRecurrenceMonthly: Recurrence = {
    type: 'monthly',
    interval: 1,
    dayOfMonth: 15,
  };

  const mockRecurrenceWithEnd: Recurrence = {
    type: 'daily',
    interval: 1,
    endDate: '2026-01-31',
  };

  const mockRecurrenceWithCount: Recurrence = {
    type: 'daily',
    interval: 1,
    count: 10,
  };

  describe('generateDates', () => {
    it('should generate daily recurrence dates', () => {
      const startDate = new Date('2026-01-15');
      const dates = RecurrenceService.generateDates(startDate, mockRecurrenceDaily, undefined, 5);

      expect(dates.length).toBe(5);
      expect(dates[0].getTime()).toBe(startDate.getTime());
    });

    it('should respect endDate', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-20');
      const dates = RecurrenceService.generateDates(startDate, mockRecurrenceDaily, endDate);

      expect(dates.every(d => d <= endDate)).toBe(true);
    });

    it('should respect count', () => {
      const startDate = new Date('2026-01-15');
      const dates = RecurrenceService.generateDates(startDate, mockRecurrenceWithCount);

      expect(dates.length).toBeLessThanOrEqual(10);
    });
  });

  describe('calculateNext', () => {
    it('should calculate next occurrence for daily', () => {
      const startDate = new Date('2026-01-15');
      const next = RecurrenceService.calculateNext(startDate, mockRecurrenceDaily);

      expect(next).toBeDefined();
      if (next) {
        expect(next.getTime()).toBeGreaterThan(startDate.getTime());
      }
    });
  });

  describe('isInfinite', () => {
    it('should return true for infinite recurrence', () => {
      const isInfinite = RecurrenceService.isInfinite(mockRecurrenceDaily);
      expect(isInfinite).toBe(true);
    });

    it('should return false for recurrence with endDate', () => {
      const isInfinite = RecurrenceService.isInfinite(mockRecurrenceWithEnd);
      expect(isInfinite).toBe(false);
    });

    it('should return false for recurrence with count', () => {
      const isInfinite = RecurrenceService.isInfinite(mockRecurrenceWithCount);
      expect(isInfinite).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate correct recurrence', () => {
      const result = RecurrenceService.validate(mockRecurrenceDaily);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return errors for invalid recurrence', () => {
      const invalidRecurrence: Recurrence = {
        type: 'monthly',
        interval: -1, // Invalid
      };

      const result = RecurrenceService.validate(invalidRecurrence);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate weekly with daysOfWeek', () => {
      const result = RecurrenceService.validate(mockRecurrenceWeekly);

      expect(result.valid).toBe(true);
    });
  });
});
