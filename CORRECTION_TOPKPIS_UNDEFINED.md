# Correction : `topKpis` undefined dans DashboardKPIBar

## Problème identifié

Erreur TypeScript : `Cannot read properties of undefined (reading 'map')` dans `DashboardKPIBar.tsx` ligne 374.

**Cause** : Le hook `useKPIFilter` ne retournait pas `filteredItems` car il ne supportait pas les options `items` et `filterFn`. Le composant `DashboardKPIBar` utilisait ces options mais le hook ne les gérait pas, ce qui faisait que `topKpis` était `undefined`.

## Solution appliquée

### 1. Extension du hook `useKPIFilter`

**Fichier** : `src/modules/dashboard/hooks/useKPIFilter.ts`

**Changements** :
- Ajout du support pour `items` et `filterFn` dans les options
- Retour de `filteredItems`, `filteredCount`, et `totalCount`
- Compatibilité avec l'ancienne API (retourne aussi `kpiFilter` et `debouncedKpiFilter`)
- Gestion des cas où `items` est `undefined` ou vide

**Avant** :
```typescript
interface UseKPIFilterOptions {
  initialFilter?: string;
  debounceMs?: number;
  storageKey?: string;
}

interface UseKPIFilterReturn {
  kpiFilter: string;
  setKpiFilter: (filter: string) => void;
  debouncedKpiFilter: string;
  clearFilter: () => void;
}
```

**Après** :
```typescript
interface UseKPIFilterOptions<T = any> {
  initialFilter?: string;
  debounceMs?: number;
  storageKey?: string;
  items?: T[];
  filterFn?: (item: T, filter: string) => boolean;
}

interface UseKPIFilterReturn<T = any> {
  filter: string;
  setKpiFilter: (filter: string) => void;
  debouncedFilter: string;
  updateFilter: (filter: string) => void;
  clearFilter: () => void;
  filteredItems?: T[];
  filteredCount?: number;
  totalCount?: number;
  // Compatibilité avec l'ancienne API
  kpiFilter: string;
  debouncedKpiFilter: string;
}
```

### 2. Protection dans `DashboardKPIBar`

**Fichier** : `src/modules/dashboard/components/DashboardKPIBar.tsx`

**Changements** :
- Ajout d'une valeur par défaut `[]` pour la prop `kpis`
- Création de `safeKpis` pour garantir un tableau non-null
- Utilisation de `filteredKpis ?? safeKpis` pour `topKpis` avec fallback

**Avant** :
```typescript
interface DashboardKPIBarProps {
  kpis: KPIData[];
  // ...
}

export const DashboardKPIBar = memo(function DashboardKPIBar({
  kpis,
  // ...
}: DashboardKPIBarProps) {
  const {
    filteredItems: topKpis,
    // ...
  } = useKPIFilter({
    items: kpis,
    filterFn: (kpi, filter) => {
      // ...
    },
  });
  
  const kpisForAlerts = useMemo(() => {
    return topKpis.map(kpi => ({ // ❌ topKpis peut être undefined
      // ...
    }));
  }, [topKpis]);
```

**Après** :
```typescript
interface DashboardKPIBarProps {
  kpis?: KPIData[]; // ✅ Optionnel avec valeur par défaut
  // ...
}

export const DashboardKPIBar = memo(function DashboardKPIBar({
  kpis = [], // ✅ Valeur par défaut
  // ...
}: DashboardKPIBarProps) {
  // ✅ Valeur par défaut pour kpis pour éviter les erreurs
  const safeKpis = kpis ?? [];

  const {
    filteredItems: filteredKpis,
    // ...
  } = useKPIFilter({
    items: safeKpis,
    filterFn: (kpi, filter) => {
      // ...
    },
  });

  // ✅ Valeur par défaut pour topKpis pour éviter les erreurs
  const topKpis = filteredKpis ?? safeKpis;
  
  const kpisForAlerts = useMemo(() => {
    return topKpis.map(kpi => ({ // ✅ topKpis est toujours un tableau
      // ...
    }));
  }, [topKpis]);
```

## Résultat

- ✅ Le hook `useKPIFilter` supporte maintenant le filtrage d'items
- ✅ `topKpis` est toujours un tableau (jamais `undefined`)
- ✅ Compatibilité maintenue avec l'ancienne API du hook
- ✅ Protection contre les erreurs si `kpis` est `undefined` ou vide
- ✅ Toutes les utilisations de `topKpis.map()` sont sécurisées

## Vérification

Tous les usages de `topKpis` dans `DashboardKPIBar` sont maintenant sécurisés :
- Ligne 374 : `kpisForAlerts` - ✅ `topKpis.map()` sécurisé
- Ligne 385 : `kpisWithProps` - ✅ `topKpis.map()` sécurisé
- Ligne 402 : `kpiClickHandlers` - ✅ `topKpis.map()` sécurisé
- Ligne 407 : `shouldVirtualize` - ✅ `topKpis.length` sécurisé
- Ligne 447 : `rowsCount` - ✅ `topKpis.length` sécurisé
- Ligne 476 : Affichage conditionnel - ✅ `topKpis.length` sécurisé
- Ligne 750 : Affichage conditionnel - ✅ `topKpis.length` sécurisé

## Notes

- Le hook `useKPIFilter` est maintenant plus flexible et peut être utilisé avec ou sans filtrage d'items
- La compatibilité avec l'ancienne API est maintenue pour éviter les breaking changes
- Les valeurs par défaut garantissent que le composant fonctionne même si les props sont `undefined`
