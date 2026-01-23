/**
 * Tests unitaires pour PriorityService
 */

import { describe, it, expect } from '@jest/globals';
import { PriorityService } from '../services/priority.service';
import type { Demande, BudgetInfo } from '../types/demande.types';

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
  });
});

