/**
 * Tests unitaires pour DemandesService - Cas limites et edge cases
 * Complément pour atteindre 70% coverage
 */

import { describe, it, expect } from '@jest/globals';
import { DemandesService } from '@/domain/demandes/service';
import type { Demande, BudgetInfo } from '@/domain/demandes/types';

describe('DemandesService - Edge Cases', () => {
  const createMockDemande = (overrides?: Partial<Demande>): Demande => ({
    id: '1',
    subject: 'Test demande avec titre assez long',
    bureau: 'BMO',
    type: 'test',
    priority: 'normal',
    status: 'pending',
    amount: 100000,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  describe('validate - Edge Cases', () => {
    it('should handle null amount', () => {
      const demande = createMockDemande({
        amount: null as any,
        montant: null as any
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('montant'))).toBe(true);
    });

    it('should handle undefined amount', () => {
      const demande = createMockDemande({
        amount: undefined,
        montant: undefined
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
    });

    it('should handle empty title with whitespace', () => {
      const demande = createMockDemande({
        subject: '   ' // Only whitespace
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('titre'))).toBe(true);
    });

    it('should handle title alias', () => {
      const demande = createMockDemande({
        subject: undefined,
        title: 'Titre alternatif avec longueur suffisante'
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(true);
    });

    it('should handle montant alias', () => {
      const demande = createMockDemande({
        amount: undefined,
        montant: 50000
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(true);
    });

    it('should handle invalid deadline string', () => {
      const demande = createMockDemande({
        deadline: 'invalid-date-string' as any
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('délai'))).toBe(true);
    });

    it('should handle amount at exact threshold (1M)', () => {
      const demande = createMockDemande({
        amount: 1000000,
        documents: [{ name: 'doc.pdf', type: 'pdf', url: '#' }]
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(true);
    });

    it('should handle amount just below threshold (500K)', () => {
      const demande = createMockDemande({
        amount: 499999,
        justification: ''
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(true);
    });

    it('should handle critical priority without urgency reason', () => {
      const demande = createMockDemande({
        priority: 'critical',
        urgencyReason: ''
      });

      const result = DemandesService.validate(demande);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('urgence'))).toBe(true);
    });
  });

  describe('calculateBudgetMetrics - Edge Cases', () => {
    it('should handle zero available budget', () => {
      const budget: BudgetInfo = {
        available: 0,
        consumed: 0,
        allocated: 0
      };

      const demande = createMockDemande({ amount: 100000 });

      const metrics = DemandesService.calculateBudgetMetrics(demande, budget);

      expect(metrics.usage).toBe(0);
      expect(metrics.remaining).toBe(-100000);
    });

    it('should handle very large amounts', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 0,
        allocated: 0
      };

      const demande = createMockDemande({ amount: 2000000 });

      const metrics = DemandesService.calculateBudgetMetrics(demande, budget);

      expect(metrics.usage).toBe(200);
      expect(metrics.exceeded).toBe(true);
    });

    it('should handle budget at exactly 80%', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 800000,
        allocated: 0
      };

      const demande = createMockDemande({ amount: 1 });

      const metrics = DemandesService.calculateBudgetMetrics(demande, budget);

      expect(metrics.warning).toBe(false); // Exactly 80% is not warning
      expect(metrics.usage).toBe(80);
    });

    it('should handle budget at exactly 90%', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 900000,
        allocated: 0
      };

      const demande = createMockDemande({ amount: 1 });

      const metrics = DemandesService.calculateBudgetMetrics(demande, budget);

      expect(metrics.critical).toBe(false); // Exactly 90% is not critical
      expect(metrics.usage).toBe(90);
    });
  });

  describe('evaluateRisks - Edge Cases', () => {
    it('should handle demande without budget', () => {
      const demande = createMockDemande({
        budget: undefined
      });

      const risks = DemandesService.evaluateRisks(demande);

      expect(risks).toBeDefined();
      expect(Array.isArray(risks)).toBe(true);
    });

    it('should handle demande without deadline', () => {
      const demande = createMockDemande({
        deadline: undefined
      });

      const risks = DemandesService.evaluateRisks(demande);

      expect(risks).toBeDefined();
    });

    it('should handle deadline exactly 7 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const demande = createMockDemande({
        deadline: futureDate
      });

      const risks = DemandesService.evaluateRisks(demande);

      // Exactly 7 days should not trigger delay risk
      expect(risks.some(r => r.type === 'delay')).toBe(false);
    });

    it('should handle amount exactly at 10M threshold', () => {
      const demande = createMockDemande({
        amount: 10000000
      });

      const risks = DemandesService.evaluateRisks(demande);

      expect(risks.some(r => r.type === 'compliance')).toBe(true);
    });

    it('should handle amount just below 10M threshold', () => {
      const demande = createMockDemande({
        amount: 9999999
      });

      const risks = DemandesService.evaluateRisks(demande);

      expect(risks.some(r => r.type === 'compliance')).toBe(false);
    });
  });

  describe('calculateAutoPriority - Edge Cases', () => {
    it('should handle demande with all risk factors', () => {
      const budget: BudgetInfo = {
        available: 1000000,
        consumed: 950000,
        allocated: 0
      };

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const demande = createMockDemande({
        amount: 15000000,
        budget,
        deadline: pastDate,
        priority: 'normal'
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      expect(priority).toBe('critical');
    });

    it('should handle normal priority explicitly set', () => {
      const demande = createMockDemande({
        priority: 'normal',
        amount: 100000
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      // Should recalculate even if normal
      expect(['normal', 'high']).toContain(priority);
    });

    it('should handle amount exactly at 1M threshold', () => {
      const demande = createMockDemande({
        amount: 1000000,
        priority: 'normal'
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      expect(priority).toBe('high');
    });

    it('should handle amount exactly at 5M threshold', () => {
      const demande = createMockDemande({
        amount: 5000000,
        priority: 'normal'
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      expect(priority).toBe('urgent');
    });

    it('should handle amount exactly at 10M threshold', () => {
      const demande = createMockDemande({
        amount: 10000000,
        priority: 'normal'
      });

      const priority = DemandesService.calculateAutoPriority(demande);

      expect(priority).toBe('critical');
    });
  });

  describe('getApproverLevel - Edge Cases', () => {
    it('should handle amount exactly at 500K threshold', () => {
      const demande = createMockDemande({ amount: 500000 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('manager');
    });

    it('should handle amount exactly at 5M threshold', () => {
      const demande = createMockDemande({ amount: 5000000 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('direction');
    });

    it('should handle amount exactly at 50M threshold', () => {
      const demande = createMockDemande({ amount: 50000000 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('comex');
    });

    it('should handle zero amount', () => {
      const demande = createMockDemande({ amount: 0 });

      const approver = DemandesService.getApproverLevel(demande);

      expect(approver.level).toBe('auto');
    });
  });

  describe('prepareForAction - Edge Cases', () => {
    it('should handle demande without deadline', () => {
      const demande = createMockDemande({
        deadline: undefined
      });

      const prepared = DemandesService.prepareForAction(demande);

      expect(prepared.delayDays).toBeUndefined();
      expect(prepared.isOverdue).toBe(false);
    });

    it('should handle deadline exactly today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const demande = createMockDemande({
        deadline: today
      });

      const prepared = DemandesService.prepareForAction(demande);

      expect(prepared.delayDays).toBeDefined();
      expect(prepared.isOverdue).toBe(false);
    });

    it('should preserve existing risks if present', () => {
      const existingRisks = [
        {
          id: 'existing-1',
          type: 'budget' as const,
          score: 85,
          description: 'Existing risk'
        }
      ];

      const demande = createMockDemande({
        risks: existingRisks
      });

      const prepared = DemandesService.prepareForAction(demande);

      // Should merge with evaluated risks
      expect(prepared.risks).toBeDefined();
      expect(prepared.risks!.length).toBeGreaterThanOrEqual(existingRisks.length);
    });
  });
});

