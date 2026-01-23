# PR #09: Optimiser Performance Dashboard

**Branch**: `perf/dashboard-optimization`  
**Priorité**: 🟡 **HAUTE**  
**Estimation**: 32 J/H (4 jours)  
**Statut**: 🚧 À implémenter

---

## 🎯 Contexte Métier

Optimiser les performances du dashboard principal en découpant le composant monolithique (1917 lignes) et en appliquant les meilleures pratiques React.

**Bénéfices métier**:
- Temps de chargement réduit
- Expérience utilisateur améliorée
- Moins de re-renders inutiles
- Maintenance facilitée

---

## 📊 Analyse Actuelle

### Problèmes Identifiés

1. **Composant Monolithique**
   - `dashboard/page.tsx`: **1917 lignes** ⚠️
   - Trop de responsabilités
   - Difficile à maintenir

2. **Performance**
   - Beaucoup de `useEffect` (16+)
   - Calculs non mémorisés
   - Pas de virtualisation pour listes
   - Zustand selectors non optimisés

3. **Re-renders**
   - Composants enfants re-rendent inutilement
   - Pas de memoization appropriée

---

## 📋 Plan Technique Détaillé

### Phase 1: Découper Composant (8 J/H)

#### 1.1 Extraire Composants KPI (2 J/H)

**Créer**:
- `src/modules/dashboard/components/kpi/KPIStrip.tsx`
- `src/modules/dashboard/components/kpi/KPICard.tsx`
- `src/modules/dashboard/components/kpi/KPIFilter.tsx`

**Extraire depuis `page.tsx`**:
- Logique affichage KPIs (lignes ~1332-1500)
- Filtre recherche KPI (lignes ~1372-1391)
- Calcul `topKpis` (lignes ~1200-1300)

#### 1.2 Extraire Composants Modals (2 J/H)

**Créer**:
- `src/modules/dashboard/components/modals/KPIDetailModal.tsx`
- `src/modules/dashboard/components/modals/ExportMenu.tsx`

**Extraire depuis `page.tsx`**:
- Modal détail KPI (lignes ~1500-1700)
- Menu export (lignes ~1700-1800)

#### 1.3 Extraire Hooks Personnalisés (2 J/H)

**Créer**:
- `src/modules/dashboard/hooks/useDashboardKPIs.ts`
- `src/modules/dashboard/hooks/useDashboardFilters.ts`
- `src/modules/dashboard/hooks/useDashboardExport.ts`

**Extraire depuis `page.tsx`**:
- Logique KPIs (lignes ~300-600)
- Logique filtres (lignes ~600-800)
- Logique export (lignes ~800-1000)

#### 1.4 Extraire Composants Notifications (2 J/H)

**Créer**:
- `src/modules/dashboard/components/notifications/DashboardNotifications.tsx`

**Extraire depuis `page.tsx`**:
- Système notifications (lignes ~1800-1917)

### Phase 2: Memoization (8 J/H)

#### 2.1 Memoization Calculs (4 J/H)

**Optimiser**:
```typescript
// ❌ Avant
const topKpis = allKpis
  .filter(kpi => !debouncedKpiFilter || kpi.label.toLowerCase().includes(debouncedKpiFilter.toLowerCase()))
  .slice(0, 5);

// ✅ Après
const topKpis = useMemo(() => {
  if (!debouncedKpiFilter) {
    return allKpis.slice(0, 5);
  }
  const filterLower = debouncedKpiFilter.toLowerCase();
  return allKpis
    .filter(kpi => kpi.label.toLowerCase().includes(filterLower))
    .slice(0, 5);
}, [allKpis, debouncedKpiFilter]);
```

**Calculs à mémoriser**:
- `topKpis`
- `filteredKpis`
- `stats` (si calculé)
- Transformations de données

#### 2.2 Memoization Composants (4 J/H)

**Mémoriser**:
```typescript
// ✅ Composants mémorisés
const MemoizedDashboardSidebar = memo(DashboardSidebar);
const MemoizedDashboardSubNavigation = memo(DashboardSubNavigation);
const MemoizedKPIStrip = memo(KPIStrip);
const MemoizedKPICard = memo(KPICard, (prev, next) => {
  return prev.kpi.id === next.kpi.id &&
         prev.kpi.value === next.kpi.value &&
         prev.kpi.delta === next.kpi.delta;
});
```

**Callbacks stables**:
```typescript
// ✅ Callbacks mémorisés
const handleKpiClick = useCallback((kpi: KPIData) => {
  setSelectedKpi(kpi);
  setIsKpiModalOpen(true);
}, []);

const handleExport = useCallback((format: 'csv' | 'json') => {
  // Logique export
}, [data]);
```

### Phase 3: Optimiser Zustand Selectors (4 J/H)

#### 3.1 Selectors Granulaires (2 J/H)

**Avant**:
```typescript
// ❌ Re-render si n'importe quelle partie du store change
const { main, sub, leaf } = useDashboardNavigationStore();
```

**Après**:
```typescript
// ✅ Re-render uniquement si main/sub/leaf changent
const main = useDashboardNavigationStore(state => state.main);
const sub = useDashboardNavigationStore(state => state.sub);
const leaf = useDashboardNavigationStore(state => state.leaf);
```

#### 3.2 Shallow Comparison (2 J/H)

**Pour objets complexes**:
```typescript
import { shallow } from 'zustand/shallow';

// ✅ Shallow comparison pour éviter re-renders
const { stats, filters } = useDashboardCommandCenterStore(
  state => ({ stats: state.stats, filters: state.filters }),
  shallow
);
```

### Phase 4: Virtualisation Listes (6 J/H)

#### 4.1 Virtualiser Liste KPIs (3 J/H)

**Si >50 KPIs**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedKPIList({ kpis }: { kpis: KPIData[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: kpis.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Hauteur estimée KPI card
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <KPICard kpi={kpis[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4.2 Virtualiser Autres Listes (3 J/H)

- Liste notifications (si >20)
- Liste filtres (si >10)

### Phase 5: Consolider useEffect (4 J/H)

#### 5.1 Analyser useEffect (2 J/H)

**Identifier**:
- useEffect redondants
- Dépendances manquantes
- Effets en cascade

#### 5.2 Consolider (2 J/H)

**Exemple**:
```typescript
// ❌ Avant - 3 useEffect séparés
useEffect(() => {
  // Logique A
}, [depA]);

useEffect(() => {
  // Logique B
}, [depB]);

useEffect(() => {
  // Logique C
}, [depC]);

// ✅ Après - 1 useEffect consolidé (si logique liée)
useEffect(() => {
  // Logique A
  // Logique B
  // Logique C
}, [depA, depB, depC]);
```

### Phase 6: Tests Performance (2 J/H)

#### 6.1 Profiling (1 J/H)

- Profiler avec React DevTools
- Identifier composants lents
- Mesurer re-renders

#### 6.2 Tests (1 J/H)

- Tests Lighthouse (avant/après)
- Tests rendering (React DevTools)
- Tests non-régression

---

## 📁 Fichiers Créés/Modifiés

### Créés (~15 fichiers)

**Composants**:
- `src/modules/dashboard/components/kpi/KPIStrip.tsx`
- `src/modules/dashboard/components/kpi/KPICard.tsx`
- `src/modules/dashboard/components/kpi/KPIFilter.tsx`
- `src/modules/dashboard/components/modals/KPIDetailModal.tsx`
- `src/modules/dashboard/components/modals/ExportMenu.tsx`
- `src/modules/dashboard/components/notifications/DashboardNotifications.tsx`

**Hooks**:
- `src/modules/dashboard/hooks/useDashboardKPIs.ts`
- `src/modules/dashboard/hooks/useDashboardFilters.ts`
- `src/modules/dashboard/hooks/useDashboardExport.ts`

### Modifiés

- `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (1917 → ~400 lignes)

---

## 🧪 Tests Requis

### Tests Performance

- [ ] Lighthouse Performance: +20 points
- [ ] Temps de rendu initial: -40%
- [ ] Re-renders par interaction: -60%

### Tests Non-Régression

- [ ] UI identique
- [ ] Fonctionnalités identiques
- [ ] Pas de régression visuelle

---

## ✅ Checklist QA

### Performance
- [ ] Lighthouse Performance ≥85
- [ ] Temps rendu initial <300ms
- [ ] Re-renders réduits de 60%+
- [ ] Virtualisation listes >50 items

### Technique
- [ ] Composants découpés (<200 lignes)
- [ ] Memoization appliquée
- [ ] Zustand optimisé
- [ ] useEffect consolidés
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint

### Fonctionnel
- [ ] UI identique
- [ ] Fonctionnalités identiques
- [ ] Pas de régression

---

## 📊 Métriques Avant/Après

| Métrique | Avant | Après (Cible) |
|----------|-------|---------------|
| Lignes `page.tsx` | 1917 | ~400 |
| Composants extraits | 0 | 6+ |
| Hooks extraits | 0 | 3 |
| Lighthouse Performance | ~60 | ~85 |
| Temps rendu initial | ~800ms | ~300ms |
| Re-renders par interaction | ~150 | ~30 |
| useEffect | 16+ | <10 |

---

## 🚀 Plan de Rollback

Si problèmes:
1. Revert commit PR
2. Restaurer `page.tsx` depuis backup
3. Vérifier non-régression

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 Prêt pour implémentation
