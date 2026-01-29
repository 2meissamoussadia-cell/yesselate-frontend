/**
 * Tests unitaires pour TrendAnalysisService - Cas limites
 * Complément pour atteindre 70% coverage
 */

import { describe, it, expect } from '@jest/globals';
import { TrendAnalysisService } from '@/domain/analytics/services/TrendAnalysisService';
import type { PeriodData } from '@/domain/analytics/entities/Period';
import type { TrendAnalysisConfig } from '@/domain/analytics/entities/TrendAnalysis';

describe('TrendAnalysisService - Edge Cases', () => {
  describe('analyzePeriods - Edge Cases', () => {
    it('should handle empty period data', () => {
      const data: PeriodData[] = [];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result.problematicPeriods).toHaveLength(0);
      expect(result.worstPeriod).toBeNull();
      expect(result.needsAction).toBe(false);
    });

    it('should handle single period', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 10 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result.problematicPeriods).toHaveLength(0);
      expect(result.worstPeriod).toBeNull();
    });

    it('should handle identical values across periods', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 10 },
        { period: '2024-02', label: 'Feb 24', value: 10 },
        { period: '2024-03', label: 'Mar 24', value: 10 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result.isDegrading).toBe(false);
      expect(result.isImproving).toBe(false);
    });

    it('should handle very large values', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 1000000 },
        { period: '2024-02', label: 'Feb 24', value: 2000000 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result).toBeDefined();
      expect(result.globalTrend).toBeDefined();
    });

    it('should handle negative values', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: -10 },
        { period: '2024-02', label: 'Feb 24', value: -5 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result).toBeDefined();
    });

    it('should handle zero values', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 0 },
        { period: '2024-02', label: 'Feb 24', value: 0 },
        { period: '2024-03', label: 'Mar 24', value: 5 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result).toBeDefined();
      // Pour "critical", une hausse (0→5) = dégradation, donc isImproving = false
      expect(result.isImproving).toBe(false);
    });
  });

  describe('generateRecommendations - Edge Cases', () => {
    it('should handle analysis with no problematic periods', () => {
      const analysis = {
        globalTrend: 'improving',
        globalTrendPercent: '-10%',
        isImproving: true,
        isDegrading: false,
        problematicPeriods: [],
        worstPeriod: null,
        needsAction: false,
      };

      const recommendations = TrendAnalysisService.generateRecommendations(analysis, {
        subCategory: 'critical',
        currentPeriodValue: 10,
      });

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle analysis with null worstPeriod', () => {
      const analysis = {
        globalTrend: 'degrading',
        globalTrendPercent: '20%',
        isImproving: false,
        isDegrading: true,
        problematicPeriods: [
          { period: '2024-01', label: 'Jan 24', value: 10 },
        ],
        worstPeriod: null,
        needsAction: true,
      };

      const recommendations = TrendAnalysisService.generateRecommendations(analysis, {
        subCategory: 'critical',
        currentPeriodValue: 15,
      });

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.id === 'rec-worst-period')).toBe(false);
    });

    it('should handle low priority subCategory', () => {
      const analysis = {
        globalTrend: 'degrading',
        globalTrendPercent: '20%',
        isImproving: false,
        isDegrading: true,
        problematicPeriods: [],
        worstPeriod: null,
        needsAction: true,
      };

      const recommendations = TrendAnalysisService.generateRecommendations(analysis, {
        subCategory: 'low',
        currentPeriodValue: 5,
      });

      expect(recommendations.length).toBeGreaterThan(0);
      const degradingRec = recommendations.find(r => r.id === 'rec-degrading');
      expect(degradingRec?.priority).toBe('medium');
    });
  });
});

