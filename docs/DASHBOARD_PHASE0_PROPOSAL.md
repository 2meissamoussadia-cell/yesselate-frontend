# 📋 Proposition Technique - Phase 0 : Modernisation Dashboard

## 🎯 Objectifs

1. **Unifier le routage** : Un seul routeur source de vérité
2. **Normaliser la configuration** : Éliminer les doublons et variantes
3. **Typiser le Registry** : Ajouter un hook data avec TTL
4. **Centraliser les helpers KPI** : Améliorer la réutilisabilité

---

## 1️⃣ Navigation : Unification des Routeurs

### 📊 État Actuel

- **DashboardViewRouter** (`src/modules/dashboard/components/DashboardViewRouter.tsx`)
  - ✅ Lazy loading des composants
  - ✅ Cache des composants chargés
  - ✅ Transitions animées (framer-motion)
  - ✅ Gestion des routes via `navigation.config.json`
  - ✅ Touch gestures pour mobile

- **DashboardContentRouter** (`src/modules/dashboard/components/DashboardContentRouter.tsx`)
  - ⚠️ Déprécié (marqué `@deprecated`)
  - ❌ Pas de lazy loading
  - ❌ Pas de cache
  - ❌ Pas de transitions

- **DashboardContentRouter (BMO)** (`src/components/features/bmo/dashboard/command-center/DashboardContentRouter.tsx`)
  - ⚠️ Version simplifiée sans lazy loading
  - ❌ Duplication de logique

### ✅ Solution Proposée

**Conserver uniquement `DashboardViewRouter` comme source de vérité**

#### Actions

1. **Migration des usages**
   ```typescript
   // ❌ AVANT
   import { DashboardContentRouter } from '@/modules/dashboard/components';
   
   // ✅ APRÈS
   import { DashboardViewRouter } from '@/modules/dashboard/components';
   ```

2. **Suppression des routeurs obsolètes**
   - Marquer `DashboardContentRouter` comme `@deprecated` avec message de migration
   - Supprimer après migration complète
   - Supprimer la version BMO si elle n'est plus utilisée

3. **Vérification des imports**
   ```bash
   # Rechercher tous les usages
   grep -r "DashboardContentRouter" src/
   ```

---

## 2️⃣ Config JSON : Normalisation Minimale

### 📊 État Actuel

**Fichier** : `src/modules/dashboard/navigation/navigation.config.json`

**Doublons identifiés** :

1. **`blocked` vs `blocages`**
   - Ligne 229 : `"blocages"` dans `actions`
   - Ligne 319 : `"blocages"` dans `risks`
   - → Risque : routes ambiguës

2. **`validation` vs `validations`**
   - Ligne 118 : `"validation"` (singulier) dans `performance`
   - → Incohérence avec le reste

3. **`highlights`**
   - Ligne 33 : `"highlights"` dans `overview/kpis`
   - → Déjà présent, pas de doublon mais vérifier la cohérence

### ✅ Solution Proposée

**Normalisation sans casser l'existant** (backward compatible)

#### Stratégie

1. **Alias de routes** : Créer un système d'alias pour maintenir la compatibilité
2. **Normalisation progressive** : Migrer vers une clé unique par concept

#### Implémentation

**Fichier** : `src/modules/dashboard/utils/routeAliases.ts`

```typescript
/**
 * Alias de routes pour compatibilité ascendante
 * Permet de normaliser les routes sans casser l'existant
 */
export const routeAliases: Record<string, string> = {
  // Normaliser "blocages" vers "blocked"
  'actions::blocages::*': 'actions::blocked::*',
  'risks::blocages::*': 'risks::blocked::*',
  
  // Normaliser "validation" vers "validations"
  'performance::validation::*': 'performance::validations::*',
};

/**
 * Normalise une route en résolvant les alias
 */
export function normalizeRouteWithAliases(
  main: string,
  sub: string | null,
  leaf: string | null
): { main: string; sub: string | null; leaf: string | null } {
  const routeKey = `${main}::${sub || ''}::${leaf || ''}`;
  
  // Chercher un alias exact
  for (const [alias, target] of Object.entries(routeAliases)) {
    if (routeKey.match(alias.replace('*', '.*'))) {
      const [tMain, tSub, tLeaf] = target.replace('::*', '').split('::');
      return {
        main: tMain,
        sub: tSub || null,
        leaf: tLeaf || null,
      };
    }
  }
  
  return { main, sub, leaf };
}
```

**Mise à jour** : `src/modules/dashboard/utils/routeValidation.ts`

```typescript
import { normalizeRouteWithAliases } from './routeAliases';

export function normalizeRoute(
  main: string,
  sub?: string | null,
  leaf?: string | null
) {
  // Appliquer les alias AVANT la normalisation
  const normalized = normalizeRouteWithAliases(main, sub || null, leaf || null);
  
  // ... reste de la logique existante
}
```

#### Documentation

Ajouter dans `navigation.config.json` :

```json
{
  "_meta": {
    "version": "2.0",
    "aliases": {
      "blocages": "blocked",
      "validation": "validations"
    },
    "deprecated": {
      "blocages": "Utiliser 'blocked' à la place"
    }
  },
  "overview": { ... }
}
```

---

## 3️⃣ Registry : Typisation et Hook Data avec TTL

### 📊 État Actuel

**Fichier** : `src/modules/dashboard/registry/dashboardRegistry.tsx`

**Points forts** :
- ✅ Structure avec TTL
- ✅ Loaders typés
- ✅ Render par entrée

**Points à améliorer** :
- ⚠️ Types partiels (`DashboardViewData` générique)
- ⚠️ Pas de hook pour accéder aux données avec cache TTL
- ⚠️ Loaders encore mockés

### ✅ Solution Proposée

#### 3.1 Typisation Complète

**Fichier** : `src/modules/dashboard/types/dashboardRegistryTypes.ts`

```typescript
import type { NavKey } from '../types/dashboard';
import type { DashboardViewData } from '../types/dashboardDataTypes';

/**
 * Résultat d'un loader avec métadonnées
 */
export interface LoaderResult<T extends DashboardViewData = DashboardViewData> {
  key: string;
  data: T;
  fetchedAt: number;
}

/**
 * Fonction loader typée
 */
export type TypedLoaderFn<T extends DashboardViewData = DashboardViewData> = (
  nav: NavKey
) => Promise<LoaderResult<T>>;

/**
 * Entrée du registry avec types stricts
 */
export interface ViewEntry<T extends DashboardViewData = DashboardViewData> {
  id: string;
  title: string;
  render: (args: { nav: NavKey; data: T | null }) => React.ReactElement;
  loader?: TypedLoaderFn<T>;
  ttl?: number; // en millisecondes
}

/**
 * Registry typé
 */
export type DashboardRegistry = Record<string, ViewEntry<DashboardViewData>>;
```

#### 3.2 Hook Data avec TTL

**Fichier** : `src/modules/dashboard/hooks/useDashboardData.ts`

```typescript
import { useState, useEffect, useRef } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardRegistry } from '../registry/dashboardRegistry';
import { navToKey } from '../types/dashboard';
import type { DashboardViewData } from '../types/dashboardDataTypes';

interface UseDashboardDataOptions {
  /**
   * Force le rechargement même si les données sont en cache
   */
  forceRefresh?: boolean;
  
  /**
   * Callback appelé lors du chargement
   */
  onLoad?: (data: DashboardViewData | null) => void;
  
  /**
   * Callback appelé en cas d'erreur
   */
  onError?: (error: Error) => void;
}

interface UseDashboardDataResult<T extends DashboardViewData = DashboardViewData> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean; // true si les données sont expirées (TTL dépassé)
}

/**
 * Hook pour charger les données d'une vue dashboard avec cache TTL
 * 
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useDashboardData();
 * 
 * if (isLoading) return <Loading />;
 * if (!data) return <Empty />;
 * 
 * return <MyComponent data={data} />;
 * ```
 */
export function useDashboardData<T extends DashboardViewData = DashboardViewData>(
  options: UseDashboardDataOptions = {}
): UseDashboardDataResult<T> {
  const { forceRefresh = false, onLoad, onError } = options;
  
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);
  const routeKey = navToKey({
    main: navigation.mainCategory || 'overview',
    sub: navigation.subCategory || null,
    leaf: navigation.subSubCategory || null,
  });
  
  const entry = dashboardRegistry[routeKey];
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  
  // Cache en mémoire (Map statique partagée)
  const dataCache = useRef(new Map<string, { data: DashboardViewData; fetchedAt: number }>());
  
  const isStale = useMemo(() => {
    if (!fetchedAt || !entry?.ttl) return false;
    return Date.now() - fetchedAt > entry.ttl;
  }, [fetchedAt, entry?.ttl]);
  
  const loadData = useCallback(async () => {
    if (!entry?.loader) {
      setIsLoading(false);
      return;
    }
    
    // Vérifier le cache
    const cached = dataCache.current.get(routeKey);
    const now = Date.now();
    
    if (!forceRefresh && cached) {
      const age = now - cached.fetchedAt;
      if (entry.ttl && age < entry.ttl) {
        // Cache valide
        setData(cached.data as T);
        setFetchedAt(cached.fetchedAt);
        setIsLoading(false);
        onLoad?.(cached.data as T);
        return;
      }
    }
    
    // Charger les données
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await entry.loader({
        main: navigation.mainCategory || 'overview',
        sub: navigation.subCategory || null,
        leaf: navigation.subSubCategory || null,
      });
      
      // Mettre en cache
      dataCache.current.set(routeKey, {
        data: result.data,
        fetchedAt: result.fetchedAt,
      });
      
      setData(result.data as T);
      setFetchedAt(result.fetchedAt);
      onLoad?.(result.data as T);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur de chargement');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [entry, routeKey, navigation, forceRefresh, onLoad, onError]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  return {
    data,
    isLoading,
    error,
    refetch: loadData,
    isStale,
  };
}
```

#### 3.3 Mise à jour du Registry

**Mise à jour** : `src/modules/dashboard/registry/dashboardRegistry.tsx`

```typescript
import type { ViewEntry, TypedLoaderFn } from '../types/dashboardRegistryTypes';
// ... autres imports

// ✅ Types explicites pour chaque loader
const loadOverviewSummaryDashboard: TypedLoaderFn<OverviewSummaryDashboardData> = async (nav) => {
  // ... implémentation
};

// ✅ Registry typé
export const dashboardRegistry: Record<string, ViewEntry<DashboardViewData>> = {
  'overview::summary::dashboard': {
    id: 'overview-summary-dashboard',
    title: 'Dashboard principal',
    ttl: 60_000, // 1 minute
    loader: loadOverviewSummaryDashboard,
    render: ({ nav, data }) => <DashboardAdvancedView data={data || {}} />,
  },
  // ... autres entrées
};
```

---

## 4️⃣ KPIs : Centralisation des Helpers

### 📊 État Actuel

**Fichier existant** : `src/modules/dashboard/utils/colorMapping.ts`

**Helpers déjà centralisés** :
- ✅ `parseTrendPercent()` - Parse les trends
- ✅ `mapColorToTone()` - Mapping couleurs → tons
- ✅ `getTrendDirection()` - Direction de tendance
- ✅ `formatMoneyXOF()`, `formatMoneyEUR()`, `formatMoneyCompact()` - Formatage monétaire

**Fichier** : `src/modules/dashboard/components/shared/getTrendIcon.ts`

**Helpers** :
- ✅ `getTrendIcon()` - Icône de tendance
- ✅ `getTrendColor()` - Couleur de tendance

### ✅ Solution Proposée

**Consolider dans un seul fichier** pour éviter la duplication

#### 4.1 Fusion des Helpers

**Fichier** : `src/modules/dashboard/utils/kpiHelpers.ts` (nouveau fichier consolidé)

```typescript
/**
 * Helpers centralisés pour les KPIs
 * Source de vérité unique pour le formatage et le mapping des KPIs
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { 
  parseTrendPercent as parseTrendPercentBase,
  mapColorToTone,
  getTrendDirection,
  formatMoneyXOF,
  formatMoneyEUR,
  formatMoneyCompact,
  type TrendDirection,
  type KPICardColor,
  type KpiStatCardTone,
} from './colorMapping';

// Ré-exporter les helpers existants
export {
  parseTrendPercentBase as parseTrendPercent,
  mapColorToTone,
  getTrendDirection,
  formatMoneyXOF,
  formatMoneyEUR,
  formatMoneyCompact,
  type TrendDirection,
  type KPICardColor,
  type KpiStatCardTone,
};

export type TrendType = 'up' | 'down' | 'neutral';

/**
 * Obtient l'icône de tendance appropriée
 */
export function getTrendIcon(
  trendType?: TrendType,
  trend?: number | string
): React.ComponentType<{ className?: string }> | null {
  const trendValue = typeof trend === 'string' 
    ? parseTrendPercentBase(trend) 
    : trend ?? 0;
  
  const direction = getTrendDirection(trendValue);
  
  if (direction === 'up' || trendType === 'up') {
    return ArrowUpRight;
  }
  if (direction === 'down' || trendType === 'down') {
    return ArrowDownRight;
  }
  return Minus;
}

/**
 * Obtient la classe CSS de couleur pour une tendance
 */
export function getTrendColor(
  trendType?: TrendType,
  trend?: number | string
): string {
  const trendValue = typeof trend === 'string' 
    ? parseTrendPercentBase(trend) 
    : trend ?? 0;
  
  const direction = getTrendDirection(trendValue);
  
  if (direction === 'up' || trendType === 'up') {
    return 'text-emerald-400';
  }
  if (direction === 'down' || trendType === 'down') {
    return 'text-red-400';
  }
  return 'text-slate-400';
}

/**
 * Helper complet pour obtenir les propriétés de tendance
 */
export interface TrendProps {
  icon: React.ComponentType<{ className?: string }> | null;
  color: string;
  value: number;
  direction: TrendDirection;
}

export function getTrendProps(
  trendType?: TrendType,
  trend?: number | string
): TrendProps {
  const value = typeof trend === 'string' 
    ? parseTrendPercentBase(trend) 
    : trend ?? 0;
  
  return {
    icon: getTrendIcon(trendType, value),
    color: getTrendColor(trendType, value),
    value,
    direction: getTrendDirection(value),
  };
}
```

#### 4.2 Migration Progressive

**Étape 1** : Créer le nouveau fichier consolidé
**Étape 2** : Mettre à jour les imports progressivement
**Étape 3** : Marquer les anciens fichiers comme `@deprecated`
**Étape 4** : Supprimer après migration complète

---

## 📦 Plan d'Implémentation (Phase 0)

### ✅ Checklist

#### 1. Navigation
- [ ] Auditer tous les usages de `DashboardContentRouter`
- [ ] Migrer vers `DashboardViewRouter`
- [ ] Supprimer les routeurs obsolètes
- [ ] Tester toutes les routes

#### 2. Config JSON
- [ ] Créer `routeAliases.ts`
- [ ] Intégrer dans `routeValidation.ts`
- [ ] Ajouter `_meta` dans `navigation.config.json`
- [ ] Documenter les alias

#### 3. Registry
- [ ] Créer `dashboardRegistryTypes.ts`
- [ ] Typiser complètement `dashboardRegistry.tsx`
- [ ] Créer `useDashboardData.ts`
- [ ] Tester le hook avec cache TTL
- [ ] Documenter l'usage

#### 4. KPIs
- [ ] Créer `kpiHelpers.ts` consolidé
- [ ] Migrer les imports progressivement
- [ ] Marquer les anciens fichiers comme `@deprecated`
- [ ] Supprimer après migration

### 🎯 Livrables Phase 0

1. ✅ Un seul routeur (`DashboardViewRouter`)
2. ✅ Système d'alias pour routes (backward compatible)
3. ✅ Registry typé avec hook `useDashboardData`
4. ✅ Helpers KPI consolidés dans un seul fichier

### 📝 Documentation

- Guide de migration pour les routeurs
- Documentation des alias de routes
- Guide d'utilisation de `useDashboardData`
- Référence des helpers KPI

---

## 🔄 Compatibilité Ascendante

Toutes les modifications sont **backward compatible** :
- ✅ Les routes existantes continuent de fonctionner via les alias
- ✅ Les anciens imports fonctionnent encore (avec warnings)
- ✅ Pas de breaking changes pour les composants existants

---

## 📊 Métriques de Succès

- ✅ 0 routeur dupliqué
- ✅ 0 doublon dans la config JSON
- ✅ 100% des routes typées
- ✅ Cache TTL fonctionnel
- ✅ Helpers KPI centralisés
