/**
 * Tests unitaires pour ApprovalRules
 */

import { describe, it, expect } from '@jest/globals';
import { ApprovalRules } from '../rules/approval.rules';
import type { Demande } from '../types/demande.types';

describe('ApprovalRules', () => {
  describe('getApproverLevel', () => {
    it('should return auto for amount < 500K', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 100000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const approver = ApprovalRules.getApproverLevel(demande);
      
      expect(approver.level).toBe('auto');
    });

    it('should return manager for amount between 500K and 5M', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 2000000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const approver = ApprovalRules.getApproverLevel(demande);
      
      expect(approver.level).toBe('manager');
    });

    it('should return direction for amount between 5M and 50M', () => {
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
      
      const approver = ApprovalRules.getApproverLevel(demande);
      
      expect(approver.level).toBe('direction');
    });

    it('should return comex for amount >= 50M', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 60000000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const approver = ApprovalRules.getApproverLevel(demande);
      
      expect(approver.level).toBe('comex');
    });
  });

  describe('canAutoApprove', () => {
    it('should return true for small amount', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 100000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(ApprovalRules.canAutoApprove(demande)).toBe(true);
    });

    it('should return false for large amount', () => {
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
      
      expect(ApprovalRules.canAutoApprove(demande)).toBe(false);
    });
  });

  describe('requiresSpecialApproval', () => {
    it('should return true for direction level', () => {
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
      
      expect(ApprovalRules.requiresSpecialApproval(demande)).toBe(true);
    });

    it('should return true for comex level', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 60000000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(ApprovalRules.requiresSpecialApproval(demande)).toBe(true);
    });

    it('should return false for auto or manager level', () => {
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
      
      expect(ApprovalRules.requiresSpecialApproval(demande)).toBe(false);
    });
  });

  describe('getNextThreshold', () => {
    it('should return 500K for amount < 500K', () => {
      expect(ApprovalRules.getNextThreshold(100000)).toBe(500000);
    });

    it('should return 5M for amount between 500K and 5M', () => {
      expect(ApprovalRules.getNextThreshold(2000000)).toBe(5000000);
    });

    it('should return 50M for amount between 5M and 50M', () => {
      expect(ApprovalRules.getNextThreshold(10000000)).toBe(50000000);
    });

    it('should return null for amount >= 50M', () => {
      expect(ApprovalRules.getNextThreshold(60000000)).toBeNull();
    });
  });
});
