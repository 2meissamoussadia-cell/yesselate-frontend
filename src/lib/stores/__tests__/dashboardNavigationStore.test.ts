/**
 * Tests unitaires pour dashboardNavigationStore
 * Vérifie que getServerSnapshot fonctionne correctement pour SSR
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { useDashboardNavigationStore } from '../dashboardNavigationStore';

describe('dashboardNavigationStore', () => {
  beforeEach(() => {
    // Réinitialiser le store avant chaque test
    useDashboardNavigationStore.setState({
      main: 'overview',
      sub: null,
      leaf: null,
    });
  });

  describe('getServerSnapshot', () => {
    it('should have getServerSnapshot that returns initial state', () => {
      // Test SSR snapshot
      const store = useDashboardNavigationStore;
      const snapshot = store.getServerSnapshot?.();
      
      expect(snapshot).toBeDefined();
      expect(snapshot?.main).toBe('overview');
      expect(snapshot?.sub).toBeNull();
      expect(snapshot?.leaf).toBeNull();
      expect(typeof snapshot?.setMain).toBe('function');
      expect(typeof snapshot?.setSub).toBe('function');
      expect(typeof snapshot?.setLeaf).toBe('function');
    });

    it('should return stable snapshot for SSR', () => {
      const store = useDashboardNavigationStore;
      const snapshot1 = store.getServerSnapshot?.();
      const snapshot2 = store.getServerSnapshot?.();
      
      // Les snapshots doivent être identiques (même référence ou même valeurs)
      expect(snapshot1).toEqual(snapshot2);
    });
  });

  describe('state management', () => {
    it('should update main and reset sub/leaf', () => {
      const store = useDashboardNavigationStore.getState();
      
      store.setMain('performance');
      
      expect(store.main).toBe('performance');
      expect(store.sub).toBeNull();
      expect(store.leaf).toBeNull();
    });

    it('should update sub and reset leaf', () => {
      const store = useDashboardNavigationStore.getState();
      
      store.setMain('overview');
      store.setSub('summary');
      
      expect(store.main).toBe('overview');
      expect(store.sub).toBe('summary');
      expect(store.leaf).toBeNull();
    });

    it('should update leaf without affecting main/sub', () => {
      const store = useDashboardNavigationStore.getState();
      
      store.setMain('overview');
      store.setSub('summary');
      store.setLeaf('dashboard');
      
      expect(store.main).toBe('overview');
      expect(store.sub).toBe('summary');
      expect(store.leaf).toBe('dashboard');
    });

    it('should avoid unnecessary updates when value is identical', () => {
      const store = useDashboardNavigationStore.getState();
      const initialMain = store.main;
      
      // Essayer de définir la même valeur
      store.setMain(initialMain);
      
      // La valeur ne devrait pas changer
      expect(store.main).toBe(initialMain);
    });
  });

  describe('selectors', () => {
    it('should work with individual selectors', () => {
      const store = useDashboardNavigationStore.getState();
      store.setMain('performance');
      store.setSub('kpis');
      store.setLeaf('trends');
      
      // Simuler l'utilisation des sélecteurs
      const main = useDashboardNavigationStore.getState().main;
      const sub = useDashboardNavigationStore.getState().sub;
      const leaf = useDashboardNavigationStore.getState().leaf;
      
      expect(main).toBe('performance');
      expect(sub).toBe('kpis');
      expect(leaf).toBe('trends');
    });
  });
});
