/**
 * Tests unitaires pour RiskService
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { RiskService } from '../services/risk.service';
import type { Demande, BudgetInfo } from '../types/demande.types';

describe('RiskService', () => {
  describe('calculateGlobalRiskScore', () => {
    it('should return 0 if no risks', () => {
      expect(RiskService.calculateGlobalRiskScore([])).toBe(0);
    });

    it('should return the highest score', () => {
      const risks = [
        { id: '1', type: 'budget' as const, score: 50, description: 'Test', detectedAt: new Date() },
        { id: '2', type: 'delay' as const, score: 80, description: 'Test', detectedAt: new Date() },
        { id: '3', type: 'quality' as const, score: 30, description: 'Test', detectedAt: new Date() }
      ];
      
      expect(RiskService.calculateGlobalRiskScore(risks)).toBe(80);
    });
  });

  describe('getRiskLevel', () => {
    it('should return critical for score >= 80', () => {
      expect(RiskService.getRiskLevel(85)).toBe('critical');
      expect(RiskService.getRiskLevel(80)).toBe('critical');
    });

    it('should return high for score >= 60', () => {
      expect(RiskService.getRiskLevel(70)).toBe('high');
      expect(RiskService.getRiskLevel(60)).toBe('high');
    });

    it('should return medium for score >= 30', () => {
      expect(RiskService.getRiskLevel(45)).toBe('medium');
      expect(RiskService.getRiskLevel(30)).toBe('medium');
    });

    it('should return low for score < 30', () => {
      expect(RiskService.getRiskLevel(20)).toBe('low');
      expect(RiskService.getRiskLevel(0)).toBe('low');
    });
  });

  describe('evaluateRisks', () => {
    it('should detect budget critical risk', () => {
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
      
      const risks = RiskService.evaluateRisks(demande);
      const budgetRisk = risks.find(r => r.type === 'budget' && r.score === 90);
      
      expect(budgetRisk).toBeDefined();
      expect(budgetRisk?.description).toContain('Budget critique');
    });

    it('should detect delay risk for overdue deadline', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
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
        deadline: yesterday
      };
      
      const risks = RiskService.evaluateRisks(demande);
      const delayRisk = risks.find(r => r.type === 'delay' && r.score === 95);
      
      expect(delayRisk).toBeDefined();
      expect(delayRisk?.description).toContain('Délai dépassé');
    });

    it('should detect high amount risk', () => {
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
      
      const risks = RiskService.evaluateRisks(demande);
      const amountRisk = risks.find(r => r.type === 'compliance');
      
      expect(amountRisk).toBeDefined();
      expect(amountRisk?.score).toBe(70);
    });
  });

  describe('evaluateRisksComplete', () => {
    it('should return complete risk evaluation', () => {
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
      
      const result = RiskService.evaluateRisksComplete(demande);
      
      expect(result.risks.length).toBeGreaterThan(0);
      expect(result.globalScore).toBeGreaterThanOrEqual(0);
      expect(result.riskLevel).toBeDefined();
      expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
    });
  });
});

