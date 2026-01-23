# PR #01: Corriger Zustand Stores - Optimisation Complète

**Branch**: `fix/zustand-stores-optimization`  
**Priorité**: 🔴 CRITIQUE  
**Estimation**: 16 J/H (2 jours)

---

## 🎯 Objectifs

1. Corriger l'erreur `getServerSnapshot should be cached`
2. Optimiser tous les sélecteurs Zustand
3. Ajouter `shallow` pour comparer les objets
4. Stabiliser les snapshots pour SSR

---

## 📝 Fichiers à Modifier

### 1. `src/lib/stores/dashboardNavigationStore.ts`

**Corrections à appliquer**:

```typescript
/**
 * Store Zustand pour la navigation du Dashboard
 * Gère l'état de navigation (main, sub, leaf)
 * ✅ OPTIMISÉ: getServerSnapshot pour SSR, sélecteurs optimisés
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardNavigationState {
  main: string;
  sub: string | null;
  leaf: string | null;
}

interface DashboardNavigationActions {
  setMain: (main: string) => void;
  setSub: (sub: string | null) => void;
  setLeaf: (leaf: string | null) => void;
}

type DashboardNavigationStore = DashboardNavigationState & DashboardNavigationActions;

// ✅ NOUVEAU: getServerSnapshot pour SSR (évite l'erreur "should be cached")
const getServerSnapshot = (): DashboardNavigationStore => ({
  main: 'overview',
  sub: null,
  leaf: null,
  setMain: () => {},
  setSub: () => {},
  setLeaf: () => {},
});

export const useDashboardNavigationStore = create<DashboardNavigationStore>()(
  persist(
    (set) => ({
      main: 'overview',
      sub: null,
      leaf: null,

      setMain: (main) => set({ main, sub: null, leaf: null }),

      setSub: (sub) => set({ sub, leaf: null }),

      setLeaf: (leaf) => set({ leaf }),
    }),
    {
      name: 'dashboard-navigation-storage',
      // ✅ NOUVEAU: getServerSnapshot pour SSR
      getServerSnapshot,
    }
  )
);

// ✅ NOUVEAU: Sélecteurs optimisés (export pour réutilisation)
export const selectMain = (state: DashboardNavigationStore) => state.main;
export const selectSub = (state: DashboardNavigationStore) => state.sub;
export const selectLeaf = (state: DashboardNavigationStore) => state.leaf;
export const selectNavigation = (state: DashboardNavigationStore) => ({
  main: state.main,
  sub: state.sub,
  leaf: state.leaf,
});
```

---

### 2. `src/lib/stores/navigationStore.ts`

**Corrections à appliquer**:

```typescript
// ✅ Ajouter getServerSnapshot
const getServerSnapshot = (): NavigationState => ({
  pageCounts: {},
  navigationHistory: [],
  maxHistorySize: 50,
  loadingPages: new Set(),
  pageFilters: {},
  updatePageCount: () => {},
  updatePageCounts: () => {},
  addToHistory: () => {},
  getPreviousRoute: () => null,
  setPageFilter: () => {},
  getPageFilter: () => ({}),
  setPageLoading: () => {},
  isPageLoading: () => false,
  clearFilters: () => {},
  reset: () => {},
});

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // ... état existant
    }),
    {
      name: 'navigation-storage',
      // ✅ NOUVEAU: getServerSnapshot
      getServerSnapshot,
    }
  )
);
```

---

### 3. Mise à jour des composants utilisant les stores

**Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Corrections à appliquer**:

```typescript
// ❌ AVANT
const main = useDashboardNavigationStore((state) => state.main);
const sub = useDashboardNavigationStore((state) => state.sub);
const leaf = useDashboardNavigationStore((state) => state.leaf);

// ✅ APRÈS (option 1: sélecteurs individuels - RECOMMANDÉ)
import { selectMain, selectSub, selectLeaf } from '@/lib/stores/dashboardNavigationStore';

const main = useDashboardNavigationStore(selectMain);
const sub = useDashboardNavigationStore(selectSub);
const leaf = useDashboardNavigationStore(selectLeaf);

// ✅ APRÈS (option 2: shallow pour objet)
import { shallow } from 'zustand/shallow';
import { selectNavigation } from '@/lib/stores/dashboardNavigationStore';

const navigation = useDashboardNavigationStore(selectNavigation, shallow);
```

---

### 4. `src/lib/stores/dashboardCommandCenterStore.ts`

**Note**: Ce store n'utilise pas `persist`, mais il faut optimiser les sélecteurs.

**Corrections à appliquer**:

```typescript
// ❌ AVANT
const navigation = useDashboardCommandCenterStore((state) => state.navigation);
const sidebarCollapsed = useDashboardCommandCenterStore((state) => state.sidebarCollapsed);

// ✅ APRÈS: Utiliser shallow pour comparer les objets
import { shallow } from 'zustand/shallow';

const { navigation, sidebarCollapsed } = useDashboardCommandCenterStore(
  (state) => ({
    navigation: state.navigation,
    sidebarCollapsed: state.sidebarCollapsed,
  }),
  shallow
);

// ✅ OU: Comparateur personnalisé pour navigation
const navigation = useDashboardCommandCenterStore(
  (state) => state.navigation,
  (a, b) =>
    a.mainCategory === b.mainCategory &&
    a.subCategory === b.subCategory &&
    a.subSubCategory === b.subSubCategory
);
```

---

## 🧪 Tests à Ajouter

### 1. Tests unitaires pour `getServerSnapshot`

**Fichier**: `src/lib/stores/__tests__/dashboardNavigationStore.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { useDashboardNavigationStore } from '../dashboardNavigationStore';

describe('dashboardNavigationStore', () => {
  it('should have getServerSnapshot that returns initial state', () => {
    // Test SSR snapshot
    const snapshot = useDashboardNavigationStore.getServerSnapshot?.();
    expect(snapshot).toBeDefined();
    expect(snapshot.main).toBe('overview');
    expect(snapshot.sub).toBeNull();
    expect(snapshot.leaf).toBeNull();
  });

  it('should update main and reset sub/leaf', () => {
    const store = useDashboardNavigationStore.getState();
    store.setMain('performance');
    expect(store.main).toBe('performance');
    expect(store.sub).toBeNull();
    expect(store.leaf).toBeNull();
  });
});
```

### 2. Tests E2E pour vérifier l'absence de re-renders infinis

**Fichier**: `e2e/dashboard/zustand-stores.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should not cause infinite re-renders', async ({ page }) => {
  await page.goto('/maitre-ouvrage/dashboard');
  
  // Attendre que la page soit chargée
  await page.waitForSelector('[data-testid="dashboard-content"]');
  
  // Vérifier qu'il n'y a pas d'erreurs console
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Attendre un peu pour voir si des erreurs apparaissent
  await page.waitForTimeout(2000);
  
  // Vérifier qu'il n'y a pas d'erreur "getServerSnapshot should be cached"
  const getServerSnapshotErrors = errors.filter(e => 
    e.includes('getServerSnapshot') || e.includes('infinite loop')
  );
  expect(getServerSnapshotErrors).toHaveLength(0);
});
```

---

## ✅ Checklist Validation

- [ ] Tous les stores avec `persist` ont `getServerSnapshot`
- [ ] Tous les sélecteurs utilisent `shallow` ou comparateurs personnalisés
- [ ] Aucune erreur console "getServerSnapshot should be cached"
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Performance améliorée (mesurer avec React DevTools)
- [ ] Vérifier que les fonctionnalités existantes fonctionnent toujours

---

## 📝 Notes

1. **getServerSnapshot**: Doit retourner un objet avec la même structure que le store, mais avec des valeurs par défaut
2. **shallow**: Utilisé pour comparer les objets de manière shallow (comparaison de référence pour les objets)
3. **Sélecteurs**: Toujours utiliser des sélecteurs spécifiques plutôt que de lire tout le store
4. **Performance**: Mesurer avec React DevTools Profiler avant/après les corrections

---

## 🚀 Commandes pour Tester

```bash
# Tests unitaires
npm run test -- src/lib/stores/__tests__/dashboardNavigationStore.test.ts

# Tests E2E
npm run test:e2e -- e2e/dashboard/zustand-stores.spec.ts

# Build pour vérifier les erreurs TypeScript
npm run build
```
