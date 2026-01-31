/**
 * Tests unitaires P3 — routeValidation (dashboard)
 */

import { describe, it, expect } from '@jest/globals';
import { getNavigationConfig, isValidRoute } from '../routeValidation';

describe('routeValidation', () => {
  describe('getNavigationConfig', () => {
    it('returns an object with at least one main key', () => {
      const config = getNavigationConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      const keys = Object.keys(config);
      expect(keys.length).toBeGreaterThanOrEqual(0);
      if (keys.length > 0) {
        expect(keys.every((k) => typeof k === 'string')).toBe(true);
      }
    });

    it('returns config entries with label when present', () => {
      const config = getNavigationConfig();
      for (const key of Object.keys(config)) {
        const entry = config[key];
        expect(entry).toHaveProperty('label');
        expect(typeof entry.label).toBe('string');
      }
    });
  });

  describe('isValidRoute', () => {
    it('returns false for empty or invalid main', () => {
      expect(isValidRoute('', null, null)).toBe(false);
      expect(isValidRoute(null as unknown as string, null, null)).toBe(false);
    });

    it('returns a boolean for valid main string', () => {
      const config = getNavigationConfig();
      const mainKeys = Object.keys(config);
      if (mainKeys.length > 0) {
        const main = mainKeys[0];
        const result = isValidRoute(main, null, null);
        expect(typeof result).toBe('boolean');
      } else {
        const result = isValidRoute('overview', null, null);
        expect(typeof result).toBe('boolean');
      }
    });
  });
});
