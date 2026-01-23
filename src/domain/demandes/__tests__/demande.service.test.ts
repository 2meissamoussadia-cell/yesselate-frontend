/**
 * Tests unitaires pour DemandeService
 */

import { describe, it, expect } from '@jest/globals';
import { DemandeService } from '../services/demande.service';
import type { Demande } from '../types/demande.types';

describe('DemandeService', () => {
  describe('validate', () => {
    it('should return valid for correct demande', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Demande de test avec titre suffisamment long',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Description détaillée de la demande'
      };
      
      const result = DemandeService.validate(demande);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return errors for invalid demande', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Court', // Trop court
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: -100, // Montant négatif
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = DemandeService.validate(demande);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return warnings for budget alert', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Demande de test avec titre suffisamment long',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 85000,
        createdAt: new Date(),
        updatedAt: new Date(),
        budget: { available: 100000, consumed: 0, allocated: 0 }
      };
      
      const result = DemandeService.validate(demande);
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Budget'))).toBe(true);
    });
  });

  describe('prepareForAction', () => {
    it('should calculate risks and priority', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 95000,
        createdAt: new Date(),
        updatedAt: new Date(),
        budget: { available: 100000, consumed: 0, allocated: 0 }
      };
      
      const prepared = DemandeService.prepareForAction(demande);
      
      expect(prepared.risks).toBeDefined();
      expect(prepared.risks?.length).toBeGreaterThan(0);
      expect(prepared.priority).toBeDefined();
    });
  });

  describe('getApprover', () => {
    it('should return auto for small amount', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 100000, // < 500K
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const approver = DemandeService.getApprover(demande);
      
      expect(approver.level).toBe('auto');
    });

    it('should return manager for medium amount', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 2000000, // Entre 500K et 5M
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const approver = DemandeService.getApprover(demande);
      
      expect(approver.level).toBe('manager');
    });

    it('should return direction for large amount', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 10000000, // Entre 5M et 50M
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const approver = DemandeService.getApprover(demande);
      
      expect(approver.level).toBe('direction');
    });

    it('should return comex for very large amount', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 60000000, // > 50M
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const approver = DemandeService.getApprover(demande);
      
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
      
      expect(DemandeService.canAutoApprove(demande)).toBe(true);
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
      
      expect(DemandeService.canAutoApprove(demande)).toBe(false);
    });
  });

  describe('shouldEscalate', () => {
    it('should return true for high risk demande', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'critical',
        amount: 15000000, // > 10M
        createdAt: new Date(),
        updatedAt: new Date(),
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 jour en retard
      };
      
      expect(DemandeService.shouldEscalate(demande)).toBe(true);
    });

    it('should return false for normal demande', () => {
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
      
      expect(DemandeService.shouldEscalate(demande)).toBe(false);
    });
  });

  describe('getSummary', () => {
    it('should return complete summary', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test demande avec titre suffisamment long',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
        budget: { available: 100000, consumed: 0, allocated: 0 }
      };
      
      const summary = DemandeService.getSummary(demande);
      
      expect(summary.demande).toBeDefined();
      expect(summary.validation).toBeDefined();
      expect(summary.approver).toBeDefined();
      expect(summary.riskEvaluation).toBeDefined();
      expect(summary.budgetMetrics).toBeDefined();
      expect(summary.canAutoApprove).toBeDefined();
      expect(summary.shouldEscalate).toBeDefined();
    });
  });

  describe('prepareForAction', () => {
    it('should calculate delayDays and isOverdue', () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 jours passés
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deadline: pastDate
      };
      
      const prepared = DemandeService.prepareForAction(demande);
      
      expect(prepared.delayDays).toBeDefined();
      expect(prepared.isOverdue).toBe(true);
    });

    it('should preserve existing priority if not normal', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'urgent',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const prepared = DemandeService.prepareForAction(demande);
      
      expect(prepared.priority).toBe('urgent');
    });
  });
});

