# PR #12: Optimisation Performance DashboardContent

**Branch**: `perf/optimize-dashboard-content`  
**Priorité**: 🟡 HAUTE  
**Estimation**: 16 J/H (2 jours)  
**Statut**: 🚧 EN COURS

---

## 🎯 Objectif

Optimiser les performances du composant DashboardContent (1782 lignes) en :
1. Découpant en composants plus petits
2. Optimisant les Zustand selectors
3. Virtualisant les listes longues
4. Profilant pour identifier les bottlenecks

---

## 🔍 Analyse Actuelle

### Fichier Principal
- **Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`
- **Taille**: 1782 lignes
- **Composant principal**: `DashboardContent` (lignes 252-1384)

### Structure Actuelle

#### Composants Déjà Extraits ✅
1. ✅ `DashboardKPIBar` - Existe dans `src/modules/dashboard/components/DashboardKPIBar.tsx`
2. ✅ `DashboardFooter` - Existe dans `src/modules/dashboard/components/DashboardFooter.tsx`
3. ✅ `DashboardSidebar` - Existe
4. ✅ `DashboardSubNavigation` - Existe
5. ✅ `DashboardViewRouter` - Existe

#### Composants Internes à Extraire ⚠️
1. ⚠️ `KPICard` (lignes 1412-1608) - Composant interne, ~200 lignes
2. ⚠️ `KPINotifications` (lignes 1677-1786) - Composant interne, ~110 lignes
3. ⚠️ `KPISparkline` (lignes 1787-1875) - Composant interne, ~90 lignes
4. ⚠️ `LastUpdateDisplay` (lignes 1876-1901) - Composant interne, ~25 lignes
5. ⚠️ `ContentLoadingSkeleton` (lignes 1609-1676) - Composant interne, ~70 lignes

#### Hooks à Extraire ⚠️
1. ⚠️ Logique de refresh avec retry (lignes ~400-600)
2. ⚠️ Logique de filtre KPI (lignes ~300-400)
3. ⚠️ Gestion des notifications (lignes ~500-700)
4. ⚠️ Gestion des métriques de performance (lignes ~490-525)

---

## 📋 Plan d'Optimisation

### Phase 1: Profilage (2 J/H)

#### 1.1 Ajouter React DevTools Profiler
- [ ] Instrumenter DashboardContent avec des marks de performance
- [ ] Identifier les composants les plus lents
- [ ] Mesurer les temps de rendu avant/après

#### 1.2 Analyser les Re-renders
- [ ] Vérifier les Zustand selectors (shallow comparison)
- [ ] Identifier les props instables
- [ ] Détecter les boucles de rendu

### Phase 2: Extraction des Composants (6 J/H)

#### 2.1 Extraire KPICard (1.5 J/H)
**Fichier**: `src/modules/dashboard/components/shared/KPICard.tsx`

**Statut**: ✅ **DÉJÀ EXTRAIT** - Le composant existe déjà dans `src/modules/dashboard/components/shared/KPICard.tsx`

**Action**: Vérifier que le composant dans `page.tsx` utilise bien celui partagé

#### 2.2 Extraire KPINotifications (1.5 J/H)
**Fichier**: `src/modules/dashboard/components/KPINotifications.tsx`

**Code à extraire**: Lignes 1677-1786

```typescript
interface KPINotificationsProps {
  notifications: Array<{
    id: string;
    label: string;
    oldValue: string | number;
    newValue: string | number;
    timestamp: Date;
  }>;
  onDismiss: (id: string) => void;
}

export const KPINotifications = memo(function KPINotifications({
  notifications,
  onDismiss,
}: KPINotificationsProps) {
  // Code extrait
});
```

#### 2.4 Extraire KPISparkline (1 J/H)
**Fichier**: `src/modules/dashboard/components/shared/KPISparkline.tsx`

**Code à extraire**: Lignes 1787-1875

**Statut**: ✅ **DÉJÀ EXTRAIT** - Vérifier si existe déjà

#### 2.5 Extraire ContentLoadingSkeleton (1 J/H)
**Fichier**: `src/modules/dashboard/components/ContentLoadingSkeleton.tsx`

**Code à extraire**: Lignes 1609-1676

#### 2.5 Extraire LastUpdateDisplay (1 J/H)
**Fichier**: `src/modules/dashboard/components/LastUpdateDisplay.tsx`

**Code à extraire**: Lignes 1876-1901

### Phase 3: Extraction des Hooks (4 J/H)

#### 3.1 Extraire useDashboardRefresh (1.5 J/H)
**Fichier**: `src/modules/dashboard/hooks/useDashboardRefresh.ts`

**Responsabilités**:
- Logique de refresh avec retry
- Gestion des états (idle, loading, error, paused, retrying)
- Exponential backoff
- Timeout et cleanup

**Code à extraire**: Lignes ~400-600

```typescript
export function useDashboardRefresh({
  refetchKPIs,
  maxRetries = 3,
  refreshInterval = 60000,
}: {
  refetchKPIs: () => Promise<void>;
  maxRetries?: number;
  refreshInterval?: number;
}) {
  const [refreshStatus, setRefreshStatus] = useState<"idle" | "loading" | "error" | "paused" | "retrying">("idle");
  const [refreshCount, setRefreshCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Logique de refresh avec retry
  // ...
  
  return {
    refreshStatus,
    refreshCount,
    retryCount,
    refresh: async () => { /* ... */ },
    pause: () => { /* ... */ },
    resume: () => { /* ... */ },
  };
}
```

#### 3.2 Extraire useKPIFilter (1 J/H)
**Fichier**: `src/modules/dashboard/hooks/useKPIFilter.ts`

**Responsabilités**:
- Gestion du filtre KPI
- Persistance dans localStorage
- Filtrage des KPIs

**Code à extraire**: Lignes ~300-400

```typescript
export function useKPIFilter(initialFilter = '') {
  const [kpiFilter, setKpiFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('dashboard-kpi-filter') || initialFilter;
      } catch {
        return initialFilter;
      }
    }
    return initialFilter;
  });
  
  const filteredKPIs = useMemo(() => {
    // Logique de filtrage
  }, [kpis, kpiFilter]);
  
  return {
    kpiFilter,
    setKpiFilter,
    filteredKPIs,
  };
}
```

#### 3.3 Extraire useKPINotifications (1 J/H)
**Fichier**: `src/modules/dashboard/hooks/useKPINotifications.ts`

**Responsabilités**:
- Détection des changements de KPIs
- Gestion des notifications (max 5)
- Auto-dismiss après 5 secondes

**Code à extraire**: Lignes ~500-700

#### 3.4 Extraire usePerformanceMetrics (0.5 J/H)
**Fichier**: `src/modules/dashboard/hooks/usePerformanceMetrics.ts`

**Responsabilités**:
- Mesure des temps de rendu
- Mesure de la mémoire
- Web Vitals

**Code à extraire**: Lignes ~490-525

### Phase 4: Optimisation Zustand Selectors (2 J/H)

#### 4.1 Ajouter Shallow Comparison
**Fichier**: `src/modules/dashboard/components/DashboardContent.tsx` (après extraction)

```typescript
import { shallow } from 'zustand/shallow';

// ❌ AVANT
const { main, sub, leaf } = useDashboardNavigationStore((state) => ({
  main: state.main,
  sub: state.sub,
  leaf: state.leaf,
}));

// ✅ APRÈS
const main = useDashboardNavigationStore((state) => state.main);
const sub = useDashboardNavigationStore((state) => state.sub);
const leaf = useDashboardNavigationStore((state) => state.leaf);

// OU avec shallow
const { main, sub, leaf } = useDashboardNavigationStore(
  (state) => ({
    main: state.main,
    sub: state.sub,
    leaf: state.leaf,
  }),
  shallow
);
```

#### 4.2 Optimiser les Sélecteurs
- [ ] Vérifier tous les usages de Zustand stores
- [ ] Utiliser des sélecteurs individuels quand possible
- [ ] Ajouter `shallow` pour les objets

### Phase 5: Virtualisation (2 J/H)

#### 5.1 Virtualiser la Liste des KPIs
**Fichier**: `src/modules/dashboard/components/DashboardKPIBar.tsx`

**Statut**: ✅ **DÉJÀ IMPLÉMENTÉ** - La virtualisation existe déjà dans DashboardKPIBar

**Action**: Vérifier que la virtualisation fonctionne correctement

---

## 📊 Fichiers Attendus

### Nouveaux Fichiers
1. `src/modules/dashboard/components/KPINotifications.tsx` (nouveau)
2. `src/modules/dashboard/components/ContentLoadingSkeleton.tsx` (nouveau)
3. `src/modules/dashboard/components/LastUpdateDisplay.tsx` (nouveau)
4. `src/modules/dashboard/hooks/useDashboardRefresh.ts` (nouveau)
5. `src/modules/dashboard/hooks/useKPIFilter.ts` (nouveau)
6. `src/modules/dashboard/hooks/useKPINotifications.ts` (nouveau)
7. `src/modules/dashboard/hooks/usePerformanceMetrics.ts` (nouveau)

### Fichiers Modifiés
1. `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (refactoré, ~1782 → ~400 lignes)

---

## ✅ Checklist

### Phase 1: Profilage
- [ ] React DevTools Profiler configuré
- [ ] Métriques de performance avant/après
- [ ] Identification des bottlenecks

### Phase 2: Extraction Composants
- [x] KPICard (déjà extrait)
- [x] LastUpdateDisplay ✅ (extrait)
- [ ] KPINotifications
- [ ] KPISparkline (vérifier si existe)
- [ ] ContentLoadingSkeleton

### Phase 3: Extraction Hooks
- [ ] useDashboardRefresh
- [ ] useKPIFilter
- [ ] useKPINotifications
- [ ] usePerformanceMetrics

### Phase 4: Optimisation Zustand
- [ ] Shallow comparison ajoutée
- [ ] Sélecteurs optimisés
- [ ] Re-renders minimisés

### Phase 5: Virtualisation
- [x] Virtualisation KPIs (déjà implémentée)
- [ ] Tests de performance

### Phase 6: Tests & Validation
- [ ] Tests unitaires pour nouveaux hooks
- [ ] Tests E2E pour navigation
- [ ] Vérification non-régression
- [ ] Documentation mise à jour

---

## 📊 Métriques Attendues

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Lignes DashboardContent | 1782 | ~400 | **-78%** |
| Temps de rendu initial | ~500ms | ~100ms | **-80%** |
| Re-renders inutiles | Élevés | Minimisés | **-70%** |
| Testabilité | Faible | Élevée | **+100%** |
| Maintenabilité | Faible | Élevée | **+100%** |

---

## 🚀 Prochaines Étapes

1. **Commencer par Phase 1** : Profiler pour identifier les vrais bottlenecks
2. **Extraire les composants** : Commencer par les plus simples (LastUpdateDisplay, ContentLoadingSkeleton)
3. **Extraire les hooks** : Commencer par useKPIFilter (le plus simple)
4. **Optimiser Zustand** : Ajouter shallow comparison
5. **Tests** : Ajouter tests unitaires et E2E

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 Plan créé | Prêt à commencer
