# PR #03: Optimiser DashboardContent et Corriger Boucles de Rendu

**Branch**: `fix/dashboard-content-optimization`  
**Priorité**: 🟡 HAUTE  
**Estimation**: 20 J/H (2.5 jours)

---

## 🎯 Objectifs

1. Stabiliser les props passées au router
2. Découper `DashboardContent` en composants plus petits
3. Ajouter `React.memo`, `useMemo`, `useCallback` partout
4. Réduire les dépendances Zustand
5. Optimiser les re-renders

---

## 📝 Fichiers à Modifier

### 1. Découper `DashboardContent`

**Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Structure proposée**:

```typescript
// ✅ NOUVEAU: Composants séparés
const DashboardKPIBar = memo(function DashboardKPIBar({ 
  kpis, 
  kpiFilter, 
  onFilterChange, 
  onKPIClick 
}: DashboardKPIBarProps) {
  // ... logique KPI bar
});

const DashboardFilters = memo(function DashboardFilters({ 
  filters, 
  onFilterChange 
}: DashboardFiltersProps) {
  // ... logique filtres
});

const DashboardNotifications = memo(function DashboardNotifications({ 
  notifications, 
  onDismiss 
}: DashboardNotificationsProps) {
  // ... logique notifications
});

const DashboardExportMenu = memo(function DashboardExportMenu({ 
  isOpen, 
  onClose, 
  onExport 
}: DashboardExportMenuProps) {
  // ... logique export menu
});

// ✅ DashboardContent optimisé
const DashboardContent = memo(function DashboardContent() {
  const log = useLogger('DashboardContent');
  
  // ✅ Sélecteurs optimisés avec shallow
  import { shallow } from 'zustand/shallow';
  
  const { main, sub, leaf } = useDashboardNavigationStore(
    (state) => ({
      main: state.main,
      sub: state.sub,
      leaf: state.leaf,
    }),
    shallow
  );
  
  const { sidebarCollapsed, toggleSidebar, toggleCommandPalette } = useDashboardCommandCenterStore(
    (state) => ({
      sidebarCollapsed: state.sidebarCollapsed,
      toggleSidebar: state.toggleSidebar,
      toggleCommandPalette: state.toggleCommandPalette,
    }),
    shallow
  );
  
  // ✅ Mémoriser les props pour le router
  const routerProps = useMemo(
    () => ({
      mainCategory: main,
      subCategory: sub,
      subSubCategory: leaf,
    }),
    [main, sub, leaf]
  );
  
  // ✅ Mémoriser les callbacks
  const handleKPIClick = useCallback((kpi: KPIData) => {
    const mapping = getKPIMappingByLabel(kpi.label);
    const openModal = useDashboardCommandCenterStore.getState().openModal;
    if (mapping) {
      openModal('kpi-drilldown', { kpi, kpiId: mapping.metadata.id });
    } else {
      openModal('kpi-drilldown', { kpi });
    }
  }, []);
  
  // ✅ Mémoriser les valeurs calculées
  const filteredKPIs = useMemo(
    () => kpis.filter(kpi => kpiFilter === '' || kpi.label.includes(kpiFilter)),
    [kpis, kpiFilter]
  );
  
  return (
    <div className="dashboard-content">
      <DashboardKPIBar 
        kpis={filteredKPIs}
        kpiFilter={kpiFilter}
        onFilterChange={setKpiFilter}
        onKPIClick={handleKPIClick}
      />
      <DashboardViewRouter {...routerProps} />
      <DashboardNotifications 
        notifications={kpiChangeNotifications}
        onDismiss={handleDismiss}
      />
    </div>
  );
});
```

---

### 2. Optimiser `DashboardViewRouter` props

**Fichier**: `src/modules/dashboard/components/DashboardViewRouter.tsx`

**Corrections**:

```typescript
// ✅ Accepter des props optionnelles
interface DashboardViewRouterProps {
  mainCategory?: string;
  subCategory?: string | null;
  subSubCategory?: string | null;
}

export function DashboardViewRouter({ 
  mainCategory: propMain, 
  subCategory: propSub, 
  subSubCategory: propLeaf 
}: DashboardViewRouterProps = {}) {
  const navigation = useDashboardNavigation();
  
  // ✅ Utiliser props en priorité, fallback sur contexte
  const main = propMain || navigation.main;
  const sub = propSub !== undefined ? propSub : navigation.sub;
  const leaf = propLeaf !== undefined ? propLeaf : navigation.leaf;
  
  // ... reste du code
}
```

---

### 3. Optimiser `DashboardContentRouter`

**Fichier**: `src/modules/dashboard/components/DashboardContentRouter.tsx`

**Corrections**:

```typescript
// ✅ Utiliser shallow pour comparer navigation
import { shallow } from 'zustand/shallow';

export function DashboardContentRouter({
  mainCategory: propMainCategory,
  subCategory: propSubCategory,
  subSubCategory: propSubSubCategory,
  fallbackView: FallbackView = OverviewView,
}: DashboardContentRouterProps) {
  // ✅ Sélecteur optimisé avec shallow
  const navigation = useDashboardCommandCenterStore(
    (state) => state.navigation,
    shallow
  );

  // ✅ Mémoriser la navigation finale
  const finalNavigation = useMemo(() => ({
    mainCategory: navigation.mainCategory || propMainCategory || 'overview',
    subCategory: navigation.subCategory || propSubCategory,
    subSubCategory: navigation.subSubCategory || propSubSubCategory,
  }), [
    navigation.mainCategory,
    navigation.subCategory,
    navigation.subSubCategory,
    propMainCategory,
    propSubCategory,
    propSubSubCategory,
  ]);

  // ✅ Mémoriser le composant à afficher
  const ViewComponent = useMemo(() => {
    const main = finalNavigation.mainCategory;
    if (!main || !ROUTE_MAPPING[main as DashboardMainCategory]) {
      return FallbackView;
    }
    return ROUTE_MAPPING[main as DashboardMainCategory];
  }, [finalNavigation.mainCategory, FallbackView]);

  return <ViewComponent {...finalNavigation} />;
}
```

---

## 🧪 Tests à Ajouter

### 1. Tests de performance

**Fichier**: `src/modules/dashboard/components/__tests__/DashboardContent.performance.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { DashboardContent } from '../../app/(portals)/maitre-ouvrage/dashboard/page';

describe('DashboardContent Performance', () => {
  it('should not cause excessive re-renders', () => {
    const renderCounts: number[] = [];
    
    const onRender = (id: string, phase: string, actualDuration: number) => {
      renderCounts.push(actualDuration);
    };
    
    const { rerender } = render(
      <Profiler id="DashboardContent" onRender={onRender}>
        <DashboardContent />
      </Profiler>
    );
    
    // Simuler plusieurs re-renders
    rerender(
      <Profiler id="DashboardContent" onRender={onRender}>
        <DashboardContent />
      </Profiler>
    );
    
    // Vérifier que les re-renders sont rapides (< 16ms pour 60fps)
    const averageRenderTime = renderCounts.reduce((a, b) => a + b, 0) / renderCounts.length;
    expect(averageRenderTime).toBeLessThan(16);
  });
});
```

### 2. Tests E2E pour vérifier l'absence de boucles

**Fichier**: `e2e/dashboard/rendering-loops.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should not cause rendering loops', async ({ page }) => {
  await page.goto('/maitre-ouvrage/dashboard');
  
  // Attendre que la page soit chargée
  await page.waitForSelector('[data-testid="dashboard-content"]');
  
  // Surveiller les erreurs de rendu
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Attendre un peu pour voir si des erreurs apparaissent
  await page.waitForTimeout(3000);
  
  // Vérifier qu'il n'y a pas d'erreur de boucle de rendu
  const loopErrors = errors.filter(e => 
    e.includes('Maximum update depth') || 
    e.includes('commitPassiveUnmountOnFiber') ||
    e.includes('recursivelyTraversePassiveUnmountEffects')
  );
  expect(loopErrors).toHaveLength(0);
});
```

---

## ✅ Checklist Validation

- [ ] `DashboardContent` découpé en composants plus petits
- [ ] Tous les callbacks mémorisés avec `useCallback`
- [ ] Toutes les valeurs calculées mémorisées avec `useMemo`
- [ ] Tous les composants enfants avec `React.memo`
- [ ] Tous les sélecteurs Zustand utilisent `shallow`
- [ ] Props stabilisées pour le router
- [ ] Aucune boucle de rendu détectée
- [ ] Tests de performance passent
- [ ] Tests E2E passent
- [ ] Vérifier que les fonctionnalités existantes fonctionnent toujours

---

## 📝 Notes

1. **Découpage**: Diviser `DashboardContent` en composants plus petits facilite la mémorisation
2. **shallow**: Utilisé pour comparer les objets de manière shallow
3. **useMemo/useCallback**: Mémoriser toutes les valeurs calculées et callbacks
4. **React.memo**: Utiliser sur tous les composants enfants pour éviter les re-renders inutiles
5. **Performance**: Mesurer avec React DevTools Profiler avant/après

---

## 🚀 Commandes pour Tester

```bash
# Tests unitaires
npm run test -- src/modules/dashboard/components/__tests__/DashboardContent.performance.test.tsx

# Tests E2E
npm run test:e2e -- e2e/dashboard/rendering-loops.spec.ts

# Build pour vérifier les erreurs TypeScript
npm run build

# Mesurer la performance avec React DevTools
# Ouvrir React DevTools > Profiler > Enregistrer une session
```
