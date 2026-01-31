/**
 * Tests unitaires P4 — tresoreriePrevisionnelleMock (getTensionsTresorerie)
 */

import { describe, it, expect } from '@jest/globals';
import { getTensionsTresorerie, getTresoreriePrevisionnelleMock, SEUIL_TRESORERIE_MIN } from '../tresoreriePrevisionnelleMock';

describe('tresoreriePrevisionnelleMock', () => {
  describe('getTensionsTresorerie', () => {
    it('returns empty array when all soldePrevu are above threshold', () => {
      const previsions = [
        { date: '2026-01-01', soldePrevu: 10_000_000, encaissementsPrevus: 0, decaissementsPrevus: 0, scenarios: null },
        { date: '2026-01-08', soldePrevu: 12_000_000, encaissementsPrevus: 0, decaissementsPrevus: 0, scenarios: null },
      ];
      const tensions = getTensionsTresorerie(previsions, 5_000_000);
      expect(tensions).toHaveLength(0);
    });

    it('returns entries where soldePrevu is below threshold', () => {
      const previsions = [
        { date: '2026-01-01', soldePrevu: 10_000_000, encaissementsPrevus: 0, decaissementsPrevus: 0, scenarios: null },
        { date: '2026-01-08', soldePrevu: 3_000_000, encaissementsPrevus: 0, decaissementsPrevus: 0, scenarios: null },
        { date: '2026-01-15', soldePrevu: 4_000_000, encaissementsPrevus: 0, decaissementsPrevus: 0, scenarios: null },
      ];
      const tensions = getTensionsTresorerie(previsions, 5_000_000);
      expect(tensions).toHaveLength(2);
      expect(tensions.map((t) => t.date)).toEqual(['2026-01-08', '2026-01-15']);
    });

    it('uses default SEUIL_TRESORERIE_MIN when threshold not provided', () => {
      const previsions = [
        { date: '2026-01-01', soldePrevu: 1_000_000, encaissementsPrevus: 0, decaissementsPrevus: 0, scenarios: null },
      ];
      const tensions = getTensionsTresorerie(previsions);
      expect(tensions).toHaveLength(1);
      expect(tensions[0].soldePrevu).toBe(1_000_000);
    });
  });

  describe('getTresoreriePrevisionnelleMock', () => {
    it('returns a non-empty array of previsions', () => {
      const previsions = getTresoreriePrevisionnelleMock();
      expect(Array.isArray(previsions)).toBe(true);
      expect(previsions.length).toBeGreaterThan(0);
    });

    it('each entry has date, soldePrevu, scenarios', () => {
      const previsions = getTresoreriePrevisionnelleMock();
      previsions.forEach((p) => {
        expect(p).toHaveProperty('date');
        expect(p).toHaveProperty('soldePrevu');
        expect(p).toHaveProperty('scenarios');
      });
    });
  });
});
