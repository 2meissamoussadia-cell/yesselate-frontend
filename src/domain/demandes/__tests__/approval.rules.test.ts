/**
 * Tests unitaires pour ApprovalRules
 */

import { describe, it, expect } from '@jest/globals';
import { ApprovalRules } from '../rules/approval.rules';
import type { Demande } from '../types/demande.types';

describe('ApprovalRules', () => {
  describe('getApproverLevel', () => {
    it('should return auto for amount < 500K FCFA', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 499999,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = ApprovalRules.getApproverLevel(demande);
      expect(result.level).toBe('auto');
      expect(result.reason).toContain('500');
    });

    it('should return manager for amount between 500K and 5M FCFA', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 1000000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = ApprovalRules.getApproverLevel(demande);
      expect(result.level).toBe('manager');
      expect(result.reason).toContain('500');
      expect(result.reason).toContain('5');
    });

    it('should return direction for amount between 5M and 50M FCFA', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 10000000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = ApprovalRules.getApproverLevel(demande);
      expect(result.level).toBe('direction');
      expect(result.reason).toContain('5');
      expect(result.reason).toContain('50');
    });

    it('should return comex for amount >= 50M FCFA', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = ApprovalRules.getApproverLevel(demande);
      expect(result.level).toBe('comex');
      expect(result.reason).toContain('50');
    });
  });

  describe('canAutoApprove', () => {
    it('should return true for amount < 500K FCFA', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 499999,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(ApprovalRules.canAutoApprove(demande)).toBe(true);
    });

    it('should return false for amount >= 500K FCFA', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 500000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(ApprovalRules.canAutoApprove(demande)).toBe(false);
    });
  });
});
