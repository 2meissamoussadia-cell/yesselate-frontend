/**
 * Tests unitaires pour les fonctions utilitaires du domaine Demandes
 * Extrait des composants via codemod
 */

import { describe, it, expect } from '@jest/globals';
import { formatCurrency, formatDate, getRiskColor, getPriorityText, calculateRiskScore } from '@/domain/demandes/service';

describe('DemandesService Utils', () => {
  describe('formatCurrency', () => {
    it('should return "—" for null amount', () => {
      expect(formatCurrency(null)).toBe('—');
    });

    it('should return "—" for undefined amount', () => {
      expect(formatCurrency(undefined)).toBe('—');
    });

    it('should format amount correctly', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1');
      expect(result).toContain('FCFA');
    });

    it('should format large amounts with separators', () => {
      const result = formatCurrency(5000000);
      expect(result).toMatch(/\d[\s,.]?\d/); // Should have separator
      expect(result).toContain('FCFA');
    });
  });

  describe('formatDate', () => {
    it('should return "—" for null date', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('should return "—" for undefined date', () => {
      expect(formatDate(undefined)).toBe('—');
    });

    it('should format date correctly', () => {
      const date = '2025-01-15';
      const result = formatDate(date);
      expect(result).toContain('15');
      expect(result).toContain('jan');
    });

    it('should handle ISO date strings', () => {
      const date = '2025-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).not.toBe('—');
    });
  });

  describe('getRiskColor', () => {
    it('should return rose color for score >= 15', () => {
      const result = getRiskColor(15);
      expect(result).toContain('rose');
    });

    it('should return rose color for high scores', () => {
      const result = getRiskColor(20);
      expect(result).toContain('rose');
    });

    it('should return amber color for score >= 9 and < 15', () => {
      const result = getRiskColor(10);
      expect(result).toContain('amber');
    });

    it('should return emerald color for score < 9', () => {
      const result = getRiskColor(5);
      expect(result).toContain('emerald');
    });

    it('should return emerald color for low scores', () => {
      const result = getRiskColor(0);
      expect(result).toContain('emerald');
    });
  });

  describe('getPriorityText', () => {
    it('should return correct text for urgent priority', () => {
      expect(getPriorityText('urgent')).toBe('Urgent');
    });

    it('should return correct text for high priority', () => {
      expect(getPriorityText('high')).toBe('Élevée');
    });

    it('should return correct text for normal priority', () => {
      expect(getPriorityText('normal')).toBe('Normale');
    });

    it('should return correct text for low priority', () => {
      expect(getPriorityText('low')).toBe('Basse');
    });

    it('should return correct text for critical priority', () => {
      expect(getPriorityText('critical')).toBe('Critique');
    });
  });

  describe('calculateRiskScore', () => {
    it('should calculate score correctly', () => {
      expect(calculateRiskScore(3, 4)).toBe(12);
    });

    it('should handle minimum values', () => {
      expect(calculateRiskScore(1, 1)).toBe(1);
    });

    it('should handle maximum values', () => {
      expect(calculateRiskScore(5, 5)).toBe(25);
    });

    it('should handle zero probability', () => {
      expect(calculateRiskScore(0, 5)).toBe(0);
    });

    it('should handle zero impact', () => {
      expect(calculateRiskScore(5, 0)).toBe(0);
    });
  });
});

