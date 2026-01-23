# Correction des Routes Manquantes dans le Dashboard

## 🔴 Problèmes Identifiés

### 1. Routes non trouvées dans `navigation.config.json`
Les logs montraient de nombreux warnings "Route non trouvée" pour des routes qui existent dans `dashboardNavigationConfig.ts` mais pas dans `navigation.config.json` :

- `performance/validation/` (sans leaf)
- `performance/budget/` (sans leaf)
- `performance/budget/consommation`
- `performance/budget/restant`
- `performance/delays/` (sans leaf)
- `performance/delays/critiques`
- `performance/delays/moyens`
- `performance/comparison/` (sans leaf)
- `performance/comparison/bureaux`
- `performance/comparison/projets`
- `actions/all/` (sans leaf)
- `actions/completed/` (sans leaf)
- `risks/critical/` (sans leaf)
- `risks/warnings/` (sans leaf)
- `risks/blocked/blocages`
- `risks/blocked/escalades`
- `risks/blocages/` (sans leaf)
- `risks/blocages/actifs`
- `risks/blocages/resolus`
- `risks/payments/` (sans leaf)
- `risks/contracts/` (sans leaf)
- `decisions/pending/` (sans leaf)
- `decisions/pending/urgentes`
- `decisions/pending/normales`
- `decisions/executed/` (sans leaf)
- `decisions/executed/recentes`
- `decisions/executed/anciennes`
- `decisions/timeline/` (sans leaf)
- `decisions/timeline/par-type`
- `decisions/timeline/chronologique`
- `decisions/audit/` (sans leaf)
- `decisions/audit/traces`
- `decisions/audit/rapports`
- `realtime/live/` (sans leaf)
- `realtime/alerts/` (sans leaf)
- `realtime/alerts/actives`
- `realtime/alerts/resolues`
- `realtime/notifications/` (sans leaf)
- `realtime/notifications/non-lues`

### 2. Warnings répétés
- `normalizeRoute` générait un warning à chaque normalisation vers la route par défaut
- `DashboardViewRouter` générait un warning à chaque tentative de résolution d'une route invalide

## ✅ Corrections Apportées

### 1. Ajout des routes manquantes dans `navigation.config.json`

**Routes `performance` ajoutées :**
- `performance/validation/` → `ValidationsGlobalPage` (avec leafs: `global`, `en-attente`, `validees`, `rejetees`)
- `performance/budget/` → `BudgetKpiPage` (avec leafs: `consommation`, `restant`)
- `performance/delays/` → `SummaryDashboardPage` (avec leafs: `critiques`, `moyens`)
- `performance/comparison/` → `BureauxPage` / `ProjetKpiPage` (avec leafs: `bureaux`, `projets`)

**Routes `actions` ajoutées :**
- `actions/all/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `urgentes`, `normales`)
- `actions/urgent/` → `SummaryDashboardPage` (avec leafs: `critiques`, `importantes`)
- `actions/blocked/` → `SummaryDashboardPage` (avec leafs: `blocages`, `escalades`)
- `actions/pending/` → `SummaryDashboardPage` (avec leafs: `all`, `urgentes`, `normales`)
- `actions/completed/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `recentes`, `anciennes`)

**Routes `risks` ajoutées :**
- `risks/critical/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `risques`, `alertes`)
- `risks/warnings/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `moyens`, `faibles`)
- `risks/blocages/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `actifs`, `resolus`)
- `risks/blocked/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `blocages`, `escalades`)
- `risks/payments/` → `SummaryDashboardPage` (avec leaf: `dashboard`)
- `risks/contracts/` → `SummaryDashboardPage` (avec leaf: `dashboard`)

**Routes `decisions` ajoutées :**
- `decisions/pending/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `urgentes`, `normales`)
- `decisions/executed/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `recentes`, `anciennes`)
- `decisions/timeline/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `chronologique`, `par-type`)
- `decisions/audit/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `traces`, `rapports`)

**Routes `realtime` ajoutées :**
- `realtime/live/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `monitoring`, `metriques`)
- `realtime/alerts/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `actives`, `resolues`)
- `realtime/notifications/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `non-lues`, `toutes`)
- `realtime/sync/` → `SummaryDashboardPage` (avec leafs: `dashboard`, `etat`, `historique`)

### 2. Amélioration de `normalizeRoute` dans `routeValidation.ts`

**Avant :**
```typescript
if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
  log.warn('Route invalide, utilisation de la route par défaut', { main, sub, leaf });
  return defaultRoute;
}
```

**Après :**
```typescript
if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
  // ✅ Ne logger un warning que si la route demandée est différente de la route par défaut
  const isDefaultRoute = 
    (!main || main === defaultRoute.main) &&
    (!sub || sub === defaultRoute.sub) &&
    (!leaf || leaf === defaultRoute.leaf);
  
  if (!isDefaultRoute && process.env.NODE_ENV === 'development') {
    log.warn('Route invalide, utilisation de la route par défaut', { main, sub, leaf });
  }
  return defaultRoute;
}
```

**Impact :** Évite les warnings répétés lors de la normalisation vers la route par défaut.

### 3. Amélioration de `DashboardViewRouter.tsx`

**Ajout d'un Set pour tracker les routes déjà loggées :**
```typescript
// ✅ Set pour tracker les routes déjà loggées comme "non trouvées" (évite le spam de warnings)
const warnedRoutes = new Set<string>();
```

**Modification du warning :**
```typescript
// ✅ Ne logger un warning qu'une seule fois par route unique pour éviter le spam
if (!warnedRoutes.has(routeKey)) {
  warnedRoutes.add(routeKey);
  log.warn(`Route non trouvée: ${routeString}`, {
    main: routeMain,
    sub: routeSub,
    leaf: routeLeaf,
    routeKey,
  });
}
```

**Impact :** Chaque route invalide ne génère qu'un seul warning, même si elle est résolue plusieurs fois.

### 4. Amélioration de `getDefaultLeafForSub`

**Avant :**
```typescript
// Prioriser 'dashboard' ou 'highlights', sinon premier disponible
if (leaves.includes('dashboard')) return 'dashboard';
if (leaves.includes('highlights')) return 'highlights';
return leaves[0];
```

**Après :**
```typescript
// ✅ Prioriser certains leafs selon le contexte
if (leaves.includes('dashboard')) return 'dashboard';
if (leaves.includes('global')) return 'global';
if (leaves.includes('all')) return 'all';
if (leaves.includes('highlights')) return 'highlights';
return leaves[0];
```

**Impact :** Meilleure résolution des leafs par défaut pour les routes `performance` et `actions`.

### 5. Amélioration de `getRouteComponent`

**Ajout d'un fallback si aucun leaf par défaut n'est trouvé :**
```typescript
// Cas 2: main + sub (sans leaf) - utiliser leaf par défaut
if (main && sub && !leaf) {
  const defaultLeaf = getDefaultLeafForSub(main, sub);
  if (defaultLeaf) {
    const component = navConfig[main]?.sub?.[sub]?.leaf?.[defaultLeaf]?.component;
    if (component) {
      return component;
    }
  }
  // ✅ Si aucun leaf par défaut trouvé, chercher dans le premier leaf disponible
  const subConfig = navConfig[main]?.sub?.[sub];
  if (subConfig?.leaf) {
    const firstLeaf = Object.keys(subConfig.leaf)[0];
    if (firstLeaf) {
      return subConfig.leaf[firstLeaf]?.component || null;
    }
  }
}
```

**Impact :** Garantit qu'une route avec `sub` mais sans `leaf` trouve toujours un composant si des leafs existent.

## 📋 Fichiers Modifiés

1. **`src/modules/dashboard/navigation/navigation.config.json`**
   - Ajout de toutes les routes `performance` manquantes
   - Ajout de toutes les routes `actions` manquantes
   - Ajout de toutes les routes `risks` manquantes
   - Ajout de toutes les routes `decisions` manquantes
   - Ajout de toutes les routes `realtime` manquantes
   - Ajout de leafs par défaut (`dashboard`, `global`, `all`) pour les subs sans leaf explicite

2. **`src/modules/dashboard/utils/routeValidation.ts`**
   - Amélioration de `normalizeRoute` pour éviter les warnings répétés
   - Amélioration de `getDefaultLeafForSub` pour prioriser `global` et `all`
   - Amélioration de `getRouteComponent` pour mieux gérer les routes sans leaf

3. **`src/modules/dashboard/components/DashboardViewRouter.tsx`**
   - Ajout d'un Set `warnedRoutes` pour tracker les routes déjà loggées
   - Modification du warning pour ne logger qu'une seule fois par route

## 🎯 Résultat Attendu

- ✅ Plus de warnings "Route non trouvée" pour les routes définies dans `dashboardNavigationConfig.ts`
- ✅ Warnings réduits : un seul warning par route invalide unique
- ✅ Meilleure résolution des routes avec `sub` mais sans `leaf`
- ✅ Cohérence entre `dashboardNavigationConfig.ts` (UI) et `navigation.config.json` (routing)

## 🔍 Vérification

Pour vérifier que les corrections fonctionnent :

1. Naviguer vers `/maitre-ouvrage/dashboard?main=performance&sub=validation`
2. Naviguer vers `/maitre-ouvrage/dashboard?main=performance&sub=budget&leaf=consommation`
3. Naviguer vers `/maitre-ouvrage/dashboard?main=actions&sub=all`
4. Vérifier qu'il n'y a plus de warnings répétés dans la console

## 📝 Notes

- Les composants utilisés pour les nouvelles routes sont des composants existants (`SummaryDashboardPage`, `BudgetKpiPage`, `ValidationsGlobalPage`, etc.)
- Si des composants spécifiques doivent être créés pour certaines routes, ils devront être ajoutés dans `loadComponent.ts` et dans `navigation.config.json`
- La stratégie de fallback garantit qu'une route invalide affiche toujours quelque chose (composant d'erreur ou composant par défaut) plutôt que de planter
