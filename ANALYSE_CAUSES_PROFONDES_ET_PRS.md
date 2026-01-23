# 🔍 Analyse des Causes Profondes et 3 PRs Prioritaires

**Date**: 23 Janvier 2026  
**Objectif**: Corriger les problèmes critiques identifiés (Zustand, DashboardViewRouter, boucles de rendu, images Next.js)

---

## 📊 Analyse des Causes Profondes

### 1. Erreur Zustand: "The result of getServerSnapshot should be cached"

**Cause identifiée**:
- Les stores Zustand avec `persist` middleware nécessitent un `getServerSnapshot` pour SSR
- Les sélecteurs retournent des objets non mémorisés, causant des re-renders infinis
- Les stores utilisent `useStore` global au lieu de sélecteurs spécifiques
- Absence de `shallow` pour comparer les objets

**Fichiers concernés**:
- `src/lib/stores/dashboardNavigationStore.ts`
- `src/lib/stores/dashboardCommandCenterStore.ts`
- `src/lib/stores/navigationStore.ts`
- Tous les stores utilisant `persist` middleware

**Impact**: Re-renders infinis, performance dégradée, erreurs console

---

### 2. Erreur: "ReferenceError: navigationConfig is not defined"

**Cause identifiée**:
- Dans `DashboardViewRouter.tsx`, `navigationConfig` est défini dans le `useEffect` (ligne 72)
- Il n'est pas mémorisé avec `useMemo`, donc recréé à chaque render
- Utilisé dans plusieurs endroits du code mais pas accessible en dehors du `useEffect`
- Le commentaire ligne 270 dit "navigationConfig mémorisé" mais ce n'est pas le cas

**Fichier concerné**:
- `src/modules/dashboard/components/DashboardViewRouter.tsx`

**Impact**: Erreurs runtime, routes non trouvées, UX dégradée

---

### 3. Boucles de Rendu (commitPassiveUnmountOnFiber, recursivelyTraversePassiveUnmountEffects)

**Causes identifiées**:
- `DashboardContent` utilise plusieurs stores Zustand avec des sélecteurs individuels
- Les objets passés au router ne sont pas stabilisés (créés à chaque render)
- Props instables causant des re-renders en cascade
- Absence de `React.memo` sur certains composants enfants
- `useMemo` et `useCallback` manquants pour stabiliser les callbacks

**Fichiers concernés**:
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (DashboardContent)
- `src/modules/dashboard/components/DashboardViewRouter.tsx`
- `src/modules/dashboard/components/DashboardContentRouter.tsx`

**Impact**: Performance dégradée, UI qui freeze, expérience utilisateur mauvaise

---

### 4. DashboardViewRouter: Mapping et Fallback

**Problèmes identifiés**:
- Mapping main/sub/leaf complexe et fragile
- Fallback routes insuffisants
- Pas de validation des routes avant chargement
- Deux sources de vérité: `navigation.config.json` et `dashboardNavigationConfig.ts`

**Impact**: Routes non trouvées, erreurs silencieuses, maintenance difficile

---

### 5. Images Next.js: fill sans sizes

**Statut**: ✅ **DÉJÀ CORRIGÉ** dans `Sidebar.tsx` (ligne 53: `sizes="36px"`)

**Action requise**: Vérifier s'il y a d'autres images avec `fill` sans `sizes` dans le projet

---

## 🎯 3 PRs Prioritaires

### PR #01: Corriger Zustand Stores (CRITIQUE)

**Branch**: `fix/zustand-stores-optimization`  
**Priorité**: 🔴 CRITIQUE  
**Estimation**: 16 J/H (2 jours)

#### Objectifs
1. Corriger l'erreur `getServerSnapshot should be cached`
2. Optimiser tous les sélecteurs Zustand
3. Ajouter `shallow` pour comparer les objets
4. Stabiliser les snapshots pour SSR

#### Fichiers à modifier
- `src/lib/stores/dashboardNavigationStore.ts`
- `src/lib/stores/dashboardCommandCenterStore.ts`
- `src/lib/stores/navigationStore.ts`
- Tous les stores avec `persist` middleware

#### Corrections à appliquer

**1. Ajouter getServerSnapshot pour SSR**
```typescript
// ❌ AVANT
export const useDashboardNavigationStore = create<DashboardNavigationStore>()(
  persist(
    (set) => ({ ... }),
    { name: 'dashboard-navigation-storage' }
  )
);

// ✅ APRÈS
const getServerSnapshot = () => ({
  main: 'overview',
  sub: null,
  leaf: null,
  setMain: () => {},
  setSub: () => {},
  setLeaf: () => {},
});

export const useDashboardNavigationStore = create<DashboardNavigationStore>()(
  persist(
    (set) => ({ ... }),
    { 
      name: 'dashboard-navigation-storage',
      getServerSnapshot,
    }
  )
);
```

**2. Utiliser des sélecteurs spécifiques avec shallow**
```typescript
// ❌ AVANT
const navigation = useDashboardNavigationStore();

// ✅ APRÈS
import { shallow } from 'zustand/shallow';

const main = useDashboardNavigationStore((state) => state.main);
const sub = useDashboardNavigationStore((state) => state.sub);
const leaf = useDashboardNavigationStore((state) => state.leaf);

// OU pour un objet
const navigation = useDashboardNavigationStore(
  (state) => ({ main: state.main, sub: state.sub, leaf: state.leaf }),
  shallow
);
```

**3. Mémoriser les sélecteurs complexes**
```typescript
// ❌ AVANT
const navigation = useDashboardCommandCenterStore((state) => state.navigation);

// ✅ APRÈS
const navigation = useDashboardCommandCenterStore(
  (state) => state.navigation,
  (a, b) => 
    a.mainCategory === b.mainCategory &&
    a.subCategory === b.subCategory &&
    a.subSubCategory === b.subSubCategory
);
```

#### Tests à ajouter
- [ ] Tests unitaires pour chaque store
- [ ] Tests SSR avec `getServerSnapshot`
- [ ] Tests de non-régression pour les sélecteurs
- [ ] Tests E2E pour vérifier l'absence de re-renders infinis

---

### PR #02: Corriger DashboardViewRouter (CRITIQUE)

**Branch**: `fix/dashboard-view-router`  
**Priorité**: 🔴 CRITIQUE  
**Estimation**: 12 J/H (1.5 jours)

#### Objectifs
1. Corriger l'erreur `navigationConfig is not defined`
2. Mémoriser `navigationConfig` avec `useMemo`
3. Améliorer le mapping main/sub/leaf
4. Ajouter fallback routes robustes
5. Valider les routes avant chargement

#### Fichiers à modifier
- `src/modules/dashboard/components/DashboardViewRouter.tsx`
- `src/modules/dashboard/navigation/navigation.config.json` (vérification)

#### Corrections à appliquer

**1. Mémoriser navigationConfig**
```typescript
// ❌ AVANT (ligne 72 dans useEffect)
const navigationConfig = config as NavigationConfig;

// ✅ APRÈS (en dehors du useEffect, mémorisé)
export function DashboardViewRouter() {
  const navigation = useDashboardNavigation();
  const { main, sub, leaf } = navigation;
  
  // ✅ Mémoriser navigationConfig une seule fois
  const navigationConfig = useMemo(() => config as NavigationConfig, []);
  
  useEffect(() => {
    async function resolve() {
      // navigationConfig est maintenant accessible et stable
      const componentName = navigationConfig?.[main]?.sub?.[sub || '']?.leaf?.[leaf || '']?.component;
      // ...
    }
    resolve();
  }, [main, sub, leaf, navigationConfig]);
}
```

**2. Ajouter validation des routes**
```typescript
// ✅ NOUVEAU: Fonction de validation
function validateRoute(
  config: NavigationConfig,
  main: string,
  sub: string | null,
  leaf: string | null
): boolean {
  if (!config[main]) return false;
  if (sub && !config[main].sub?.[sub]) return false;
  if (leaf && !config[main].sub?.[sub || '']?.leaf?.[leaf]) return false;
  return true;
}
```

**3. Améliorer fallback routes**
```typescript
// ✅ NOUVEAU: Fonction de résolution avec fallbacks
async function resolveRoute(
  config: NavigationConfig,
  main: string,
  sub: string | null,
  leaf: string | null
): Promise<ComponentType | null> {
  // 1. Essayer route exacte
  const exactRoute = config?.[main]?.sub?.[sub || '']?.leaf?.[leaf || '']?.component;
  if (exactRoute) {
    return await loadComponent(exactRoute);
  }
  
  // 2. Fallback: main seul -> OverviewPage
  if (!sub && !leaf) {
    return await loadComponent('OverviewPage');
  }
  
  // 3. Fallback: main + sub -> SummaryPage ou KpiOverviewPage
  if (sub && !leaf) {
    if (sub === 'summary') return await loadComponent('SummaryPage');
    if (sub === 'kpis') return await loadComponent('KpiOverviewPage');
  }
  
  // 4. Fallback: route par défaut
  return await loadComponent('OverviewPage');
}
```

**4. Ajouter route d'erreur avec logging**
```typescript
// ✅ NOUVEAU: Composant d'erreur avec informations
function RouteErrorComponent({ main, sub, leaf, config }: RouteErrorProps) {
  const availableRoutes = useMemo(() => {
    if (!config[main]) return [];
    return Object.keys(config[main].sub || {});
  }, [config, main]);
  
  return (
    <div className="p-6 text-red-400 space-y-2">
      <p className="font-bold">Route non trouvée</p>
      <p className="text-sm">
        Route demandée: <code>{main}/{sub || ''}/{leaf || ''}</code>
      </p>
      {availableRoutes.length > 0 && (
        <div>
          <p className="text-sm text-yellow-300">Routes disponibles:</p>
          <ul className="list-disc list-inside ml-4">
            {availableRoutes.map(route => (
              <li key={route}>{route}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

#### Tests à ajouter
- [ ] Tests unitaires pour `validateRoute`
- [ ] Tests unitaires pour `resolveRoute`
- [ ] Tests E2E pour navigation entre routes
- [ ] Tests de non-régression pour les fallbacks

---

### PR #03: Optimiser DashboardContent et Boucles de Rendu

**Branch**: `fix/dashboard-content-optimization`  
**Priorité**: 🟡 HAUTE  
**Estimation**: 20 J/H (2.5 jours)

#### Objectifs
1. Stabiliser les props passées au router
2. Découper `DashboardContent` en composants plus petits
3. Ajouter `React.memo`, `useMemo`, `useCallback` partout
4. Réduire les dépendances Zustand
5. Optimiser les re-renders

#### Fichiers à modifier
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (DashboardContent)
- `src/modules/dashboard/components/DashboardContentRouter.tsx`
- Créer nouveaux composants découpés

#### Corrections à appliquer

**1. Stabiliser les objets passés au router**
```typescript
// ❌ AVANT
<DashboardViewRouter />

// ✅ APRÈS
const routerProps = useMemo(
  () => ({
    mainCategory: main,
    subCategory: sub,
    subSubCategory: leaf,
  }),
  [main, sub, leaf]
);

<DashboardViewRouter {...routerProps} />
```

**2. Découper DashboardContent**
```typescript
// ✅ NOUVEAU: Composants séparés
const DashboardKPIBar = memo(function DashboardKPIBar({ ... }) { ... });
const DashboardFilters = memo(function DashboardFilters({ ... }) { ... });
const DashboardNotifications = memo(function DashboardNotifications({ ... }) { ... });
const DashboardExportMenu = memo(function DashboardExportMenu({ ... }) { ... });
```

**3. Optimiser les sélecteurs Zustand**
```typescript
// ❌ AVANT
const navigation = useDashboardCommandCenterStore((state) => state.navigation);
const sidebarCollapsed = useDashboardCommandCenterStore((state) => state.sidebarCollapsed);

// ✅ APRÈS
import { shallow } from 'zustand/shallow';

const { navigation, sidebarCollapsed } = useDashboardCommandCenterStore(
  (state) => ({
    navigation: state.navigation,
    sidebarCollapsed: state.sidebarCollapsed,
  }),
  shallow
);
```

**4. Mémoriser tous les callbacks**
```typescript
// ❌ AVANT
const handleKPIClick = (kpi: KPIData) => { ... };

// ✅ APRÈS
const handleKPIClick = useCallback((kpi: KPIData) => {
  const mapping = getKPIMappingByLabel(kpi.label);
  if (mapping) {
    openModal('kpi-drilldown', { kpi, kpiId: mapping.metadata.id });
  } else {
    openModal('kpi-drilldown', { kpi });
  }
}, [openModal]);
```

**5. Mémoriser les valeurs calculées**
```typescript
// ❌ AVANT
const filteredKPIs = kpis.filter(kpi => kpiFilter === '' || kpi.label.includes(kpiFilter));

// ✅ APRÈS
const filteredKPIs = useMemo(
  () => kpis.filter(kpi => kpiFilter === '' || kpi.label.includes(kpiFilter)),
  [kpis, kpiFilter]
);
```

#### Structure proposée pour découpage
```
DashboardContent (composant principal)
├── DashboardHeader (titre, stats)
├── DashboardKPIBar (barre KPI avec filtres)
├── DashboardFilters (filtres avancés)
├── DashboardViewRouter (router optimisé)
├── DashboardNotifications (notifications)
└── DashboardExportMenu (menu export)
```

#### Tests à ajouter
- [ ] Tests unitaires pour chaque composant découpé
- [ ] Tests de performance (mesurer les re-renders)
- [ ] Tests E2E pour vérifier l'absence de boucles
- [ ] Tests de non-régression

---

## 📋 Plan d'Exécution Global

### Phase 1: PR #01 (Zustand) - 2 jours
1. Analyser tous les stores avec `persist`
2. Ajouter `getServerSnapshot` partout
3. Optimiser tous les sélecteurs
4. Ajouter `shallow` où nécessaire
5. Tests unitaires et E2E

### Phase 2: PR #02 (DashboardViewRouter) - 1.5 jours
1. Mémoriser `navigationConfig`
2. Ajouter validation des routes
3. Améliorer fallbacks
4. Tests unitaires et E2E

### Phase 3: PR #03 (DashboardContent) - 2.5 jours
1. Découper `DashboardContent`
2. Stabiliser toutes les props
3. Ajouter mémorisation partout
4. Optimiser sélecteurs Zustand
5. Tests de performance et E2E

---

## ✅ Checklist Validation

### PR #01
- [ ] Tous les stores avec `persist` ont `getServerSnapshot`
- [ ] Tous les sélecteurs utilisent `shallow` ou comparateurs personnalisés
- [ ] Aucune erreur console "getServerSnapshot should be cached"
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Performance améliorée (mesurer avec React DevTools)

### PR #02
- [ ] `navigationConfig` est mémorisé avec `useMemo`
- [ ] Validation des routes avant chargement
- [ ] Fallbacks robustes pour toutes les routes
- [ ] Aucune erreur "navigationConfig is not defined"
- [ ] Tests unitaires passent
- [ ] Tests E2E passent

### PR #03
- [ ] `DashboardContent` découpé en composants plus petits
- [ ] Tous les callbacks mémorisés avec `useCallback`
- [ ] Toutes les valeurs calculées mémorisées avec `useMemo`
- [ ] Tous les composants enfants avec `React.memo`
- [ ] Aucune boucle de rendu détectée
- [ ] Tests de performance passent
- [ ] Tests E2E passent

---

## 📝 Notes Importantes

1. **Ordre d'exécution**: PR #01 doit être fait en premier car il corrige les problèmes de base qui affectent les autres PRs
2. **Tests**: Chaque PR doit avoir ses propres tests unitaires et E2E
3. **Non-régression**: Vérifier que les fonctionnalités existantes fonctionnent toujours après chaque PR
4. **Performance**: Mesurer avec React DevTools avant/après chaque PR
5. **Documentation**: Documenter les changements dans chaque PR

---

## 🚀 Prochaines Étapes

1. Créer les branches pour chaque PR
2. Implémenter les corrections dans l'ordre (PR #01 → #02 → #03)
3. Ajouter les tests pour chaque PR
4. Valider avec QA
5. Merger dans l'ordre
