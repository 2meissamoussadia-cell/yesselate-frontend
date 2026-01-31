/**
 * Tests unitaires P12 — csvFormatter (séparateurs localisés, format CSV)
 */

import { describe, it, expect } from '@jest/globals';
import { getCsvSeparator, formatAsCSV } from '../csvFormatter';

describe('csvFormatter (P12)', () => {
  describe('getCsvSeparator', () => {
    it('returns semicolon for fr-FR', () => {
      expect(getCsvSeparator('fr-FR')).toBe(';');
    });
    it('returns semicolon for fr (prefix)', () => {
      expect(getCsvSeparator('fr')).toBe(';');
      expect(getCsvSeparator('fr-CA')).toBe(';');
    });
    it('returns comma for en-GB and others', () => {
      expect(getCsvSeparator('en-GB')).toBe(',');
      expect(getCsvSeparator('en-US')).toBe(',');
      expect(getCsvSeparator('ar-MA')).toBe(',');
      expect(getCsvSeparator('de-DE')).toBe(',');
    });
  });

  describe('formatAsCSV', () => {
    it('returns empty string for null or non-object', () => {
      expect(formatAsCSV(null as any, 'fr-FR')).toBe('');
      expect(formatAsCSV(undefined as any, 'fr-FR')).toBe('');
      expect(formatAsCSV(42 as any, 'fr-FR')).toBe('');
    });
    it('formats array of objects with fr-FR separator', () => {
      const data = [
        { id: 1, name: 'A', value: 10 },
        { id: 2, name: 'B', value: 20 },
      ];
      const out = formatAsCSV(data, 'fr-FR');
      expect(out).toContain(';');
      expect(out).not.toContain(',');
      expect(out.split('\n').length).toBe(3);
      expect(out).toContain('id;name;value');
      expect(out).toContain('1;A;10');
    });
    it('formats array of objects with en-GB separator', () => {
      const data = [{ a: 1, b: 2 }];
      const out = formatAsCSV(data, 'en-GB');
      expect(out).toContain(',');
      expect(out).toContain('a,b');
      expect(out).toContain('1,2');
    });
    it('escapes values containing separator and quotes', () => {
      const data = [{ col: 'a;b', other: 'say "hi"' }];
      const out = formatAsCSV(data, 'fr-FR');
      expect(out).toContain('"a;b"');
      expect(out).toContain('"say ""hi"""');
    });
    it('flattens single object to one row', () => {
      const data = { x: 1, y: 2 };
      const out = formatAsCSV(data, 'fr-FR');
      expect(out.split('\n').length).toBe(2);
      expect(out).toContain('x;y');
      expect(out).toContain('1;2');
    });
    it('defaults to fr-FR locale', () => {
      const data = [{ a: 1, b: 2 }];
      expect(formatAsCSV(data)).toContain(';');
      expect(formatAsCSV(data)).toContain('a;b');
    });
  });
});
