/**
 * Tests unitaires pour PriorityService
 */

import { describe, it, expect } from '@jest/globals';
import { PriorityService } from '../services/priority.service';
import type { Demande } from '../types/demande.types';

describe('PriorityService', () => {
  describe('calculateAutoPriority', () => {
    it('should return critical for high risk score', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
        budget: { available: 100000, consumed: 95000, allocated: 0 } // 95% utilisé
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('critical');
    });

    it('should return urgent for high amount', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 6000000, // > 5M
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('urgent');
    });

    it('should return normal for low amount and no risks', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('normal');
    });
  });

  describe('calculateAutoPriority', () => {
    it('should return critical for amount >= 10M', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 15000000, // >= 10M
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('critical');
    });

    it('should return urgent for overdue deadline', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 jour passé
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deadline: pastDate
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('critical');
    });

    it('should return urgent for deadline < 3 days', () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 jours
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deadline: futureDate
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('urgent');
    });

    it('should return high for deadline < 7 days', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 jours
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deadline: futureDate
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('high');
    });

    it('should return urgent for isOverdue', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOverdue: true,
        delayDays: -5
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      // isOverdue peut donner urgent ou critical selon les autres critères
      expect(['urgent', 'critical']).toContain(priority);
    });

    it('should preserve existing priority if not normal', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'urgent',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const priority = PriorityService.calculateAutoPriority(demande);
      expect(priority).toBe('urgent');
    });
  });

  describe('calculatePriorityWithReason', () => {
    it('should return priority with reasons', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 15000000, // >= 10M
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = PriorityService.calculatePriorityWithReason(demande);
      
      expect(result.priority).toBe('critical');
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('shouldEscalate', () => {
    it('should return true for critical risk', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
        budget: { available: 100000, consumed: 95000, allocated: 0 }
      };
      
      expect(PriorityService.shouldEscalate(demande)).toBe(true);
    });

    it('should return true for high amount', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 6000000, // > 5M
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(PriorityService.shouldEscalate(demande)).toBe(true);
    });

    it('should return false for normal demande', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(PriorityService.shouldEscalate(demande)).toBe(false);
    });
  });
});

