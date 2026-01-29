/**
 * Tests unitaires pour DemandesService
 * Utilise Jest pour les tests
 */

import { describe, it, expect } from '@jest/globals';
import { DemandesService } from '@/domain/demandes/service';
import type { Demande, BudgetInfo } from '@/domain/demandes/types';

describe('DemandesService', () => {
  const createMockDemande = (overrides?: Partial<Demande>): Demande => ({
    id: '1',
    subject: 'Test demande',
    bureau: 'BMO',
    type: 'test',
    priority: 'normal',
    status: 'pending',
    amount: 100000,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  describe('validate', () => {
    it('should return valid for correct demande', () => {
      const demande = createMockDemande({
        subject: 'Demande de test valide avec titre assez long',
        amount: 50000
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for title too short', () => {
      const demande = createMockDemande({
        subject: 'Short'
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Le titre est requis et doit faire au moins 10 caractères');
    });

    it('should return error for invalid amount', () => {
      const demande = createMockDemande({
        subject: 'Valid title here',
        amount: -1000
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('montant'))).toBe(true);
    });

    it('should return error for invalid bureau', () => {
      const demande = createMockDemande({
        subject: 'Valid title here',
        bureau: 'INVALID'
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('bureau'))).toBe(true);
    });

    it('should require documents for amount >= 1M', () => {
      const demande = createMockDemande({
        subject: 'Valid title here',
        amount: 1000000,
        documents: []
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('documents'))).toBe(true);
    });

    it('should require justification for amount >= 500K', () => {
      const demande = createMockDemande({
        subject: 'Valid title here',
        amount: 500000,
        justification: ''
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('justification'))).toBe(true);
    });

    it('should require urgency reason for urgent priority', () => {
      const demande = createMockDemande({
        subject: 'Valid title here',
        priority: 'urgent',
        urgencyReason: ''
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('urgence'))).toBe(true);
    });

    it('should add warning for budget > 80%', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 750000, // 75% + 100k = 85% → warning (80-90%)
        allocated: 0
      };

      const demande = createMockDemande({
        subject: 'Valid title here',
        amount: 100000,
        budget
      });

      const result = DemandesService.validate(demande);

      expect(result.warnings.some(w => w.includes('alerte'))).toBe(true);
    });

    it('should add warning for budget > 90%', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 950000,
        allocated: 0
      };

      const demande = createMockDemande({
        subject: 'Valid title here',
        amount: 100000,
        budget
      });

      const result = DemandesService.validate(demande);

      expect(result.warnings.some(w => w.includes('critique'))).toBe(true);
    });
  });

  describe('calculateBudgetMetrics', () => {
    it('should calculate usage correctly', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 500000,
        allocated: 0
      };

      const demande = createMockDemande({ amount: 200000 });

      const metrics = DemandesService.calculateBudgetMetrics(demande, budget);

      expect(metrics.usage).toBe(70); // (500000 + 200000) / 1000000 * 100
      expect(metrics.remaining).toBe(300000);
      expect(metrics.exceeded).toBe(false);
    });

    it('should detect exceeded budget', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 900000,
        allocated: 0
      };

      const demande = createMockDemande({ amount: 200000 });

      const metrics = DemandesService.calculateBudgetMetrics(demande, budget);

      expect(metrics.exceeded).toBe(true);
      expect(metrics.usage).toBeGreaterThan(100);
    });
  });

  describe('evaluateRisks', () => {
    it('should detect budget risk', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 950000,
        allocated: 0
      };

      const demande = createMockDemande({
        amount: 100000,
        budget
      });

      const risks = DemandesService.evaluateRisks(demande);

      expect(risks.length).toBeGreaterThan(0);
      expect(risks.some(r => r.type === 'budget')).toBe(true);
    });

    it('should detect delay risk', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const demande = createMockDemande({
        deadline: yesterday
      });

      const risks = DemandesService.evaluateRisks(demande);

      expect(risks.length).toBeGreaterThan(0);
      expect(risks.some(r => r.type === 'delay')).toBe(true);
    });

    it('should detect high amount risk', () => {
      const demande = createMockDemande({
        amount: 15000000 // 15M
      });

      const risks = DemandesService.evaluateRisks(demande);

      expect(risks.length).toBeGreaterThan(0);
      expect(risks.some(r => r.type === 'compliance')).toBe(true);
    });
  });

  describe('calculateAutoPriority', () => {
    it('should return critical for high risk score', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 950000,
        allocated: 0
      };

      const demande = createMockDemande({
        amount: 100000,
        budget,
        priority: 'normal'
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      expect(priority).toBe('critical');
    });

    it('should return urgent for medium risk', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 750000, // 85% usage → warning (score 70) → urgent
        allocated: 0
      };

      const demande = createMockDemande({
        amount: 100000,
        budget,
        priority: 'normal'
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      expect(priority).toBe('urgent');
    });

    it('should respect manual priority', () => {
      const demande = createMockDemande({
        priority: 'urgent'
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      expect(priority).toBe('urgent');
    });
  });

  describe('getApproverLevel', () => {
    it('should return auto for amount < 500K', () => {
      const demande = createMockDemande({ amount: 400000 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('auto');
    });

    it('should return manager for amount between 500K and 5M', () => {
      const demande = createMockDemande({ amount: 2000000 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('manager');
    });

    it('should return direction for amount between 5M and 50M', () => {
      const demande = createMockDemande({ amount: 10000000 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('direction');
    });

    it('should return comex for amount >= 50M', () => {
      const demande = createMockDemande({ amount: 50000000 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('comex');
    });
  });

  describe('canAutoApprove', () => {
    it('should return true for amount < 500K', () => {
      const demande = createMockDemande({ amount: 400000 });

      expect(DemandesService.canAutoApprove(demande)).toBe(true);
    });

    it('should return false for amount >= 500K', () => {
      const demande = createMockDemande({ amount: 500000 });

      expect(DemandesService.canAutoApprove(demande)).toBe(false);
    });
  });

  describe('prepareForAction', () => {
    it('should calculate risks and priority', () => {
      const demande = createMockDemande({
        amount: 10000000,
        priority: 'normal'
      });

      const prepared = DemandesService.prepareForAction(demande);

      expect(prepared.risks).toBeDefined();
      expect(prepared.risks!.length).toBeGreaterThan(0);
      expect(prepared.priority).not.toBe('normal');
    });

    it('should calculate delay days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const demande = createMockDemande({
        deadline: futureDate
      });

      const prepared = DemandesService.prepareForAction(demande);

      expect(prepared.delayDays).toBeDefined();
      expect(prepared.delayDays).toBeCloseTo(7, 0);
      expect(prepared.isOverdue).toBe(false);
    });

    it('should detect overdue', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);

      const demande = createMockDemande({
        deadline: pastDate
      });

      const prepared = DemandesService.prepareForAction(demande);

      expect(prepared.isOverdue).toBe(true);
      expect(prepared.delayDays).toBeLessThan(0);
    });
  });
});

