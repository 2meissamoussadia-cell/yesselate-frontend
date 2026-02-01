/**
 * Tests unitaires — logique sectionExpanded du Dashboard Home (presets et mode d'affichage).
 */

import { describe, it, expect } from '@jest/globals';
import { computeSectionExpanded } from '../dashboardHomeSectionExpanded';

describe('computeSectionExpanded', () => {
  describe('sans preset (personnalisée)', () => {
    it('displayMode "all" : toutes les sections dépliées', () => {
      const r = computeSectionExpanded(null, 'all');
      expect(r.vueFinances).toBe(true);
      expect(r.hse).toBe(true);
      expect(r.risques).toBe(true);
      expect(r.indicateurs).toBe(true);
      expect(r.activite).toBe(true);
      expect(r.phase4).toBe(true);
    });

    it('displayMode "synthetique" : toutes repliées', () => {
      const r = computeSectionExpanded(null, 'synthetique');
      expect(r.vueFinances).toBe(false);
      expect(r.hse).toBe(false);
      expect(r.risques).toBe(false);
      expect(r.indicateurs).toBe(false);
      expect(r.activite).toBe(false);
      expect(r.phase4).toBe(false);
    });

    it('displayMode "critical" : seulement vueFinances et phase4 dépliées', () => {
      const r = computeSectionExpanded(null, 'critical');
      expect(r.vueFinances).toBe(true);
      expect(r.hse).toBe(false);
      expect(r.risques).toBe(false);
      expect(r.indicateurs).toBe(false);
      expect(r.activite).toBe(false);
      expect(r.phase4).toBe(true);
    });
  });

  describe('preset executive', () => {
    it('toutes les sections dépliées', () => {
      const r = computeSectionExpanded('executive', 'synthetique');
      expect(r.vueFinances).toBe(true);
      expect(r.hse).toBe(true);
      expect(r.risques).toBe(true);
      expect(r.indicateurs).toBe(true);
      expect(r.activite).toBe(true);
      expect(r.phase4).toBe(true);
    });
  });

  describe('preset financial', () => {
    it('seule vueFinances dépliée', () => {
      const r = computeSectionExpanded('financial', 'synthetique');
      expect(r.vueFinances).toBe(true);
      expect(r.hse).toBe(false);
      expect(r.risques).toBe(false);
      expect(r.indicateurs).toBe(false);
      expect(r.activite).toBe(false);
      expect(r.phase4).toBe(false);
    });
  });

  describe('preset operational', () => {
    it('seule phase4 dépliée', () => {
      const r = computeSectionExpanded('operational', 'synthetique');
      expect(r.vueFinances).toBe(false);
      expect(r.hse).toBe(false);
      expect(r.risques).toBe(false);
      expect(r.indicateurs).toBe(false);
      expect(r.activite).toBe(false);
      expect(r.phase4).toBe(true);
    });
  });

  describe('preset hse', () => {
    it('seule hse dépliée', () => {
      const r = computeSectionExpanded('hse', 'synthetique');
      expect(r.vueFinances).toBe(false);
      expect(r.hse).toBe(true);
      expect(r.risques).toBe(false);
      expect(r.indicateurs).toBe(false);
      expect(r.activite).toBe(false);
      expect(r.phase4).toBe(false);
    });
  });
});
