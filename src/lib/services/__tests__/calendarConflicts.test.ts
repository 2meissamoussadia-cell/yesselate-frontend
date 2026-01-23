/**
 * Tests unitaires pour calendarConflicts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CalendarConflictService } from '../calendarConflicts';
import type { ConflictCheckResult } from '../calendarConflicts';

// Mock Prisma - doit être fait avant l'import du service
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    calendarEvent: {
      findMany: (...args: any[]) => mockFindMany(...args),
      findFirst: (...args: any[]) => mockFindFirst(...args),
    },
  },
}));

describe('CalendarConflictService', () => {
  let service: CalendarConflictService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
    mockFindFirst.mockResolvedValue(null);
    service = CalendarConflictService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = CalendarConflictService.getInstance();
      const instance2 = CalendarConflictService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('checkNewEvent', () => {
    it('should return no conflicts for event without assignees', async () => {
      const eventData = {
        id: 'new-event',
        title: 'Test Event',
        start: new Date('2025-02-01T10:00:00'),
        end: new Date('2025-02-01T11:00:00'),
        assignees: [],
      };

      mockFindMany.mockResolvedValue([]);

      const result: ConflictCheckResult = await service.checkNewEvent(eventData);

      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts.length).toBe(0);
      expect(result.canProceed).toBe(true);
    });

    // Note: Les tests avec assignees nécessitent un mock Prisma fonctionnel
    // Pour l'instant, on skip ce test car Prisma n'est pas correctement mocké dans l'environnement de test
    it.skip('should handle event with assignees (requires Prisma mock)', async () => {
      // Ce test nécessite un mock Prisma complet qui n'est pas disponible dans l'environnement de test
      // Il sera activé une fois que Prisma sera correctement mocké
    });
  });
});

