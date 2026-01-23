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
  });
});

