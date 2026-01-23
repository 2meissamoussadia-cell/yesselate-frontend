/**
 * Tests unitaires pour BudgetService
 */

import { describe, it, expect } from '@jest/globals';
import { BudgetService } from '../services/budget.service';
import type { Demande, BudgetInfo } from '../types/demande.types';

describe('BudgetService', () => {
  describe('calculateBudgetUsage', () => {
    it('should return 0 if budget available is 0', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const budget: BudgetInfo = { available: 0, consumed: 0, allocated: 0 };
      
      expect(BudgetService.calculateBudgetUsage(demande, budget)).toBe(0);
    });

    it('should calculate correct percentage', () => {
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
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      expect(BudgetService.calculateBudgetUsage(demande, budget)).toBe(50);
    });

    it('should include consumed and allocated in calculation', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 30000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const budget: BudgetInfo = { available: 100000, consumed: 20000, allocated: 10000 };
      
      // (20000 + 10000 + 30000) / 100000 = 60%
      expect(BudgetService.calculateBudgetUsage(demande, budget)).toBe(60);
    });
  });

  describe('isBudgetExceeded', () => {
    it('should return true if usage > 100%', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 110000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      expect(BudgetService.isBudgetExceeded(demande, budget)).toBe(true);
    });

    it('should return false if usage <= 100%', () => {
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
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      expect(BudgetService.isBudgetExceeded(demande, budget)).toBe(false);
    });
  });

  describe('calculateRemainingBudget', () => {
    it('should calculate remaining budget correctly', () => {
      const budget: BudgetInfo = { available: 100000, consumed: 30000, allocated: 20000 };
      const amount = 10000;
      
      expect(BudgetService.calculateRemainingBudget(budget, amount)).toBe(40000);
    });

    it('should return 0 if budget is exceeded', () => {
      const budget: BudgetInfo = { available: 100000, consumed: 50000, allocated: 60000 };
      const amount = 0;
      
      expect(BudgetService.calculateRemainingBudget(budget, amount)).toBe(0);
    });
  });

  describe('calculateBudgetMetrics', () => {
    it('should return correct metrics for normal usage', () => {
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
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      const metrics = BudgetService.calculateBudgetMetrics(demande, budget);
      
      expect(metrics.usage).toBe(50);
      expect(metrics.exceeded).toBe(false);
      expect(metrics.warning).toBe(false);
      expect(metrics.critical).toBe(false);
    });

    it('should detect warning at 80%', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 85000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      const metrics = BudgetService.calculateBudgetMetrics(demande, budget);
      
      expect(metrics.warning).toBe(true);
      expect(metrics.critical).toBe(false);
    });

    it('should detect critical at 90%', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 95000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      const metrics = BudgetService.calculateBudgetMetrics(demande, budget);
      
      expect(metrics.critical).toBe(true);
      expect(metrics.warning).toBe(false);
    });
  });

  describe('shouldTriggerBudgetAlert', () => {
    it('should return critical alert at >90%', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 95000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      const alert = BudgetService.shouldTriggerBudgetAlert(demande, budget);
      
      expect(alert.alert).toBe(true);
      expect(alert.level).toBe('critical');
    });

    it('should return warning alert at >80%', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 85000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      const alert = BudgetService.shouldTriggerBudgetAlert(demande, budget);
      
      expect(alert.alert).toBe(true);
      expect(alert.level).toBe('warning');
    });

    it('should return no alert at <80%', () => {
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
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      
      const alert = BudgetService.shouldTriggerBudgetAlert(demande, budget);
      
      expect(alert.alert).toBe(false);
      expect(alert.level).toBeNull();
    });
  });
});

