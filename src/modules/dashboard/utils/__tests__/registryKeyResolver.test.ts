/**
 * Tests unitaires — getRegistryKey (alias store → registry)
 */

import { describe, it, expect } from '@jest/globals';
import { getRegistryKey } from '../registryKeyResolver';
import type { NavKey } from '../../types/dashboard';

describe('registryKeyResolver', () => {
  describe('getRegistryKey', () => {
    it('retourne overview::summary::dashboard pour pilotage::dashboard::default', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'dashboard', leaf: 'default' };
      expect(getRegistryKey(nav)).toBe('overview::summary::dashboard');
    });

    it('retourne overview::summary::dashboard pour pilotage::dashboard sans leaf', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'dashboard', leaf: '' };
      expect(getRegistryKey(nav)).toBe('overview::summary::dashboard');
    });

    it('retourne overview::kpis::projets pour pilotage::analytics::projets', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'analytics', leaf: 'projets' };
      expect(getRegistryKey(nav)).toBe('overview::kpis::projets');
    });

    it('retourne overview::kpis::demandes pour pilotage::analytics::demandes', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'analytics', leaf: 'demandes' };
      expect(getRegistryKey(nav)).toBe('overview::kpis::demandes');
    });

    it('retourne overview::kpis::projets pour pilotage::analytics sans leaf', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'analytics', leaf: '' };
      expect(getRegistryKey(nav)).toBe('overview::kpis::projets');
    });

    it('retourne pilotage::gouvernance::default pour pilotage::gouvernance sans leaf', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'gouvernance', leaf: '' };
      expect(getRegistryKey(nav)).toBe('pilotage::gouvernance::default');
    });

    it('retourne pilotage::calendrier::default pour pilotage::calendrier sans leaf', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'calendrier', leaf: '' };
      expect(getRegistryKey(nav)).toBe('pilotage::calendrier::default');
    });

    it('retourne pilotage::alertes::default pour pilotage::alertes sans leaf', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'alertes', leaf: '' };
      expect(getRegistryKey(nav)).toBe('pilotage::alertes::default');
    });

    it('retourne pilotage::hse::default pour pilotage::hse sans leaf', () => {
      const nav: NavKey = { main: 'pilotage', sub: 'hse', leaf: '' };
      expect(getRegistryKey(nav)).toBe('pilotage::hse::default');
    });

    it('retourne la clé directe pour une route sans alias', () => {
      const nav: NavKey = { main: 'performance', sub: 'achats', leaf: 'dashboard' };
      expect(getRegistryKey(nav)).toBe('performance::achats::dashboard');
    });

    it('gère sub/leaf null ou undefined (clé sans alias)', () => {
      const nav: NavKey = { main: 'chantiers', sub: null as unknown as string, leaf: null as unknown as string };
      const key = getRegistryKey(nav);
      expect(key).toMatch(/chantiers::/);
    });
  });
});
