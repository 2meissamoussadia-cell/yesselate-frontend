/**
 * Tests unitaires pour ValidationRules
 */

import { describe, it, expect } from '@jest/globals';
import { ValidationRules } from '../rules/validation.rules';
import type { Demande } from '../types/demande.types';

describe('ValidationRules', () => {
  describe('isTitleValid', () => {
    it('should return false for empty title', () => {
      expect(ValidationRules.isTitleValid('')).toBe(false);
    });

    it('should return false for title shorter than 10 characters', () => {
      expect(ValidationRules.isTitleValid('Short')).toBe(false);
      expect(ValidationRules.isTitleValid('123456789')).toBe(false);
    });

    it('should return true for title with 10 or more characters', () => {
      expect(ValidationRules.isTitleValid('Valid Title')).toBe(true);
      expect(ValidationRules.isTitleValid('This is a valid title')).toBe(true);
    });

    it('should trim whitespace', () => {
      expect(ValidationRules.isTitleValid('   Short   ')).toBe(false);
      expect(ValidationRules.isTitleValid('   Valid Title   ')).toBe(true);
    });
  });

  describe('isAmountValid', () => {
    it('should return false for negative amount', () => {
      expect(ValidationRules.isAmountValid(-100)).toBe(false);
    });

    it('should return false for zero amount', () => {
      expect(ValidationRules.isAmountValid(0)).toBe(false);
    });

    it('should return true for positive amount within limit', () => {
      expect(ValidationRules.isAmountValid(1000)).toBe(true);
      expect(ValidationRules.isAmountValid(100000000)).toBe(true); // Max 100M
    });

    it('should return false for amount exceeding limit', () => {
      expect(ValidationRules.isAmountValid(100000001)).toBe(false);
    });
  });

  describe('isBureauValid', () => {
    it('should return false for empty bureau', () => {
      expect(ValidationRules.isBureauValid('')).toBe(false);
      expect(ValidationRules.isBureauValid(null as null)).toBe(false);
      expect(ValidationRules.isBureauValid(undefined as undefined)).toBe(false);
    });

    it('should return true for valid bureau codes', () => {
      expect(ValidationRules.isBureauValid('BMO')).toBe(true);
      expect(ValidationRules.isBureauValid('BF')).toBe(true);
      expect(ValidationRules.isBureauValid('BJ')).toBe(true);
    });
  });

  describe('isDeadlineValid', () => {
    it('should return true for valid date (future)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      expect(ValidationRules.isDeadlineValid(futureDate)).toBe(true);
    });

    it('should return true for valid date (past - just validates format)', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      // La méthode valide juste que c'est une date valide, pas qu'elle est dans le futur
      expect(ValidationRules.isDeadlineValid(pastDate)).toBe(true);
    });

    it('should return true for today', () => {
      const today = new Date();
      expect(ValidationRules.isDeadlineValid(today)).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(ValidationRules.isDeadlineValid('invalid')).toBe(false);
    });

    it('should return true for null/undefined (optional)', () => {
      expect(ValidationRules.isDeadlineValid(null)).toBe(true);
      expect(ValidationRules.isDeadlineValid(undefined)).toBe(true);
    });
  });

  describe('requiresDocuments', () => {
    it('should return true for demande >= 1M FCFA with documents', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 2000000,
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: [{ id: '1', name: 'doc.pdf', type: 'pdf' }]
      };
      expect(ValidationRules.requiresDocuments(demande)).toBe(true);
    });

    it('should return false for demande >= 1M FCFA without documents', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 2000000,
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: []
      };
      expect(ValidationRules.requiresDocuments(demande)).toBe(false);
    });

    it('should return true for demande < 1M FCFA (documents not required)', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 999999,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(ValidationRules.requiresDocuments(demande)).toBe(true);
    });
  });

  describe('requiresJustification', () => {
    it('should return true for demande >= 500K FCFA with justification', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 600000,
        createdAt: new Date(),
        updatedAt: new Date(),
        justification: 'Justification valide'
      };
      expect(ValidationRules.requiresJustification(demande)).toBe(true);
    });

    it('should return false for demande >= 500K FCFA without justification', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'normal',
        amount: 600000,
        createdAt: new Date(),
        updatedAt: new Date(),
        justification: ''
      };
      expect(ValidationRules.requiresJustification(demande)).toBe(false);
    });

    it('should return true for demande < 500K FCFA (justification not required)', () => {
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
      expect(ValidationRules.requiresJustification(demande)).toBe(true);
    });
  });

  describe('requiresUrgencyReason', () => {
    it('should return true for urgent priority with reason', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'urgent',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        urgencyReason: 'Raison valide'
      };
      expect(ValidationRules.requiresUrgencyReason(demande)).toBe(true);
    });

    it('should return false for urgent priority without reason', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'urgent',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        urgencyReason: ''
      };
      expect(ValidationRules.requiresUrgencyReason(demande)).toBe(false);
    });

    it('should return true for critical priority with reason', () => {
      const demande: Demande = {
        id: '1',
        subject: 'Test',
        bureau: 'BMO',
        type: 'test',
        status: 'pending',
        priority: 'critical',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        urgencyReason: 'Raison valide'
      };
      expect(ValidationRules.requiresUrgencyReason(demande)).toBe(true);
    });

    it('should return true for normal priority (reason not required)', () => {
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
      expect(ValidationRules.requiresUrgencyReason(demande)).toBe(true);
    });
  });
});
