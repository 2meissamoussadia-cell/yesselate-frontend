/**
 * Tests unitaires P9 — exportHelpers (safeCell, sanitizeFilename)
 */

import { describe, it, expect } from '@jest/globals';
import { safeCell, sanitizeFilename } from '../exportHelpers';

describe('exportHelpers (P9)', () => {
  describe('sanitizeFilename', () => {
    it('replaces invalid characters with underscore', () => {
      expect(sanitizeFilename('a/b\\c:d*e?f"g')).toBe('a_b_c_d_e_f_g');
    });

    it('keeps alphanumeric, dash, dot, underscore', () => {
      expect(sanitizeFilename('dashboard_2026-01.xlsx')).toBe('dashboard_2026-01.xlsx');
    });

    it('truncates to 120 characters', () => {
      const long = 'a'.repeat(150);
      expect(sanitizeFilename(long).length).toBe(120);
      expect(sanitizeFilename(long)).toBe('a'.repeat(120));
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeFilename('')).toBe('');
    });
  });

  describe('safeCell', () => {
    it('wraps null/undefined as empty quoted string', () => {
      expect(safeCell(null)).toBe('""');
      expect(safeCell(undefined)).toBe('""');
    });

    it('escapes double quotes', () => {
      expect(safeCell('say "hello"')).toBe('"say ""hello"""');
    });

    it('prefixes formula-like content to prevent CSV injection', () => {
      expect(safeCell('=1+1')).toBe('"\'=1+1"');
      expect(safeCell('+1')).toBe('"\'+1"');
      expect(safeCell('@SUM(A1)')).toBe('"\'@SUM(A1)"');
      expect(safeCell('-2')).toBe('"\'-2"');
    });

    it('does not prefix normal text', () => {
      expect(safeCell('hello')).toBe('"hello"');
      expect(safeCell(42)).toBe('"42"');
    });

    it('handles numbers', () => {
      expect(safeCell(0)).toBe('"0"');
      expect(safeCell(123.45)).toBe('"123.45"');
    });
  });
});
