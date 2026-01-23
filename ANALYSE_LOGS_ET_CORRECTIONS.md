# 🔍 Analyse Logs & Corrections - 3 PRs Prioritaires

**Date**: 2026-01-23  
**Statut**: 🚧 En cours d'implémentation

---

## 📊 Résumé Exécutif

### Problèmes Identifiés

1. **Erreurs Runtime** ⚠️
   - `useDashboardNavigation must be used inside DashboardNavigationProvider`
   - Provider présent dans layout mais certains composants l'utilisent hors contexte
   - DashboardViewRouter avec try-catch mais peut être amélioré

2. **Erreurs API 404** ⚠️
   - `/api/gouvernance/tendances` - ❌ N'existe pas
   - `/api/gouvernance/overview` - ❌ N'existe pas
   - `/api/gouvernance/stats` - ❌ N'existe pas
   - `/api/calendrier/overview` - ❌ N'existe pas (mais `/api/calendar/*` existe)
   - `/api/calendrier/sync-status` - ❌ N'existe pas
   - `/api/demandes/stats` - ⚠️ Vérifier (existe `/api/demands/stats`)

3. **Problèmes Performance** ⚠️
   - Rendu lent dans DashboardContent
   - Boucles de rendu potentielles
   - Zustand selectors non optimisés

4. **Routing Interne** ⚠️
   - DashboardViewRouter trouve parfois pas les routes
   - Mapping main/sub/leaf complexe

5. **Next.js Image** ✅
   - Aucun problème détecté (pas de `Image fill` sans `sizes`)

---

## 🎯 PR #04: Fix DashboardNavigation Runtime Errors & Performance

**Branch**: `fix/dashboard-navigation-runtime`  
**Priorité**: 🔴 CRITIQUE  
**Estimation**: 16 J/H (2 jours)

### Problèmes à Corriger

1. **Provider Guards**
   - ✅ Déjà amélioré dans `DashboardNavigationContext.tsx` (fallback production)
   - ⚠️ Vérifier tous les usages de `useDashboardNavigation`
   - ⚠️ Ajouter guards dans composants critiques

2. **Routing Interne**
   - ⚠️ DashboardViewRouter peut échouer silencieusement
   - ⚠️ Améliorer fallbacks et logging
   - ⚠️ Ajouter tests de routing

3. **Performance**
   - ⚠️ Optimiser Zustand selectors (shallow comparison)
   - ⚠️ Memoization composants DashboardContent
   - ⚠️ Virtualiser listes longues

### Plan Technique

#### 1. Améliorer Provider Guards (2 J/H)

**Fichiers**:
- `src/modules/dashboard/context/DashboardNavigationContext.tsx` ✅ (déjà fait)
- `src/modules/dashboard/components/DashboardViewRouter.tsx` ⚠️ (améliorer)

**Actions**:
```typescript
// DashboardViewRouter.tsx - Améliorer le guard
export function DashboardViewRouter() {
  const navigation = useDashboardNavigationSafe(); // Hook avec fallback
  
  // ... reste du code
}

// Nouveau hook avec fallback
function useDashboardNavigationSafe() {
  try {
    return useDashboardNavigation();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[useDashboardNavigationSafe] Provider manquant, utilisation de fallback');
    }
    return {
      main: 'overview',
      sub: null,
      leaf: null,
      setMain: () => {},
      setSub: () => {},
      setLeaf: () => {},
    };
  }
}
```

#### 2. Optimiser Routing (4 J/H)

**Fichiers**:
- `src/modules/dashboard/components/DashboardViewRouter.tsx`
- `src/modules/dashboard/navigation/dashboardNavigationConfig.ts`

**Actions**:
- Ajouter route validation avant chargement
- Améliorer fallbacks avec composants par défaut
- Ajouter tests unitaires routing

#### 3. Optimiser Performance (8 J/H)

**Fichiers**:
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (DashboardContent)
- `src/lib/stores/dashboardNavigationStore.ts`
- `src/modules/dashboard/components/views/*.tsx`

**Actions**:
- Memoization avec `React.memo` et `useMemo`
- Zustand selectors avec shallow comparison
- Virtualisation listes >50 items
- Code splitting lazy loading

#### 4. Tests (2 J/H)

**Fichiers**:
- `src/modules/dashboard/__tests__/DashboardViewRouter.test.tsx`
- `e2e/dashboard/navigation.spec.ts`

**Scénarios**:
- Navigation avec/sans provider
- Routes valides/invalides
- Performance rendering

### Checklist QA

- [ ] Tous les usages `useDashboardNavigation` vérifiés
- [ ] Provider guards fonctionnels
- [ ] Routing fonctionne pour toutes les routes
- [ ] Performance améliorée (Lighthouse +10 points)
- [ ] Tests unitaires passent
- [ ] Tests E2E navigation passent
- [ ] Pas de régression visuelle

---

## 🎯 PR #05: Implémenter Routes API Manquantes

**Branch**: `feat/api-routes-gouvernance-calendrier`  
**Priorité**: 🟡 HAUTE  
**Estimation**: 20 J/H (2.5 jours)

### Routes à Créer

#### 1. `/api/gouvernance/*` (12 J/H)

**Routes**:
- `GET /api/gouvernance/overview` - Vue d'ensemble
- `GET /api/gouvernance/stats` - Statistiques KPI
- `GET /api/gouvernance/tendances` - Tendances mensuelles

**Fichiers**:
```
app/api/gouvernance/
  ├── overview/route.ts
  ├── stats/route.ts
  └── tendances/route.ts
```

**Plan**:
1. Créer structure de dossiers (1 J/H)
2. Implémenter routes avec données mockées (6 J/H)
3. Aligner avec backend (si disponible) (4 J/H)
4. Tests et documentation (1 J/H)

#### 2. `/api/calendrier/*` → `/api/calendar/*` (6 J/H)

**Problème**: Le front appelle `/api/calendrier/*` mais les routes existent sous `/api/calendar/*`

**Solution**: 
- Option A: Créer routes `/api/calendrier/*` qui redirigent vers `/api/calendar/*`
- Option B: Modifier front pour utiliser `/api/calendar/*` ✅ (recommandé)

**Fichiers**:
- `src/modules/calendrier/api/calendrierApi.ts` (modifier baseURL)

#### 3. `/api/demandes/stats` (2 J/H)

**Vérifier**: Existe `/api/demands/stats`, peut-être besoin d'alias `/api/demandes/stats`

**Solution**: Créer route proxy ou modifier front

### Plan Technique

#### 1. Routes Gouvernance (12 J/H)

```typescript
// app/api/gouvernance/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockOverview } from '@/modules/gouvernance/api/gouvernanceApiMock';

export async function GET(request: NextRequest) {
  try {
    // TODO: Remplacer par vrai appel backend
    const overview = mockOverview;
    
    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Error fetching governance overview:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

#### 2. Aligner Calendrier API (2 J/H)

```typescript
// src/modules/calendrier/api/calendrierApi.ts
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/calendar`, // ✅ Changé de 'calendrier' à 'calendar'
  // ...
});
```

#### 3. Tests API (4 J/H)

**Fichiers**:
- `app/api/gouvernance/__tests__/overview.test.ts`
- `app/api/gouvernance/__tests__/stats.test.ts`
- `app/api/gouvernance/__tests__/tendances.test.ts`

### Checklist QA

- [ ] Routes `/api/gouvernance/*` créées et fonctionnelles
- [ ] Routes `/api/calendrier/*` alignées avec `/api/calendar/*`
- [ ] Tests API passent
- [ ] Documentation OpenAPI mise à jour
- [ ] Pas d'erreurs 404 dans les logs
- [ ] Fallback données mockées fonctionnel

---

## 🎯 PR #06: Optimiser Performance Dashboard

**Branch**: `perf/dashboard-optimization`  
**Priorité**: 🟡 HAUTE  
**Estimation**: 24 J/H (3 jours)

### Problèmes à Corriger

1. **Rendu Lent DashboardContent**
   - Trop de re-renders
   - Calculs non mémorisés
   - Listes non virtualisées

2. **Zustand Selectors**
   - Pas de shallow comparison
   - Sélections trop larges

3. **Code Splitting**
   - Composants chargés même si non utilisés
   - Pas de lazy loading

### Plan Technique

#### 1. Memoization DashboardContent (8 J/H)

**Fichiers**:
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Actions**:
```typescript
// Memoization des calculs
const topKpis = useMemo(() => {
  return allKpis
    .filter(kpi => !debouncedKpiFilter || /* ... */)
    .slice(0, 5);
}, [allKpis, debouncedKpiFilter]);

// Memoization composants
const MemoizedDashboardSidebar = memo(DashboardSidebar);
const MemoizedDashboardSubNavigation = memo(DashboardSubNavigation);
```

#### 2. Optimiser Zustand Selectors (6 J/H)

**Fichiers**:
- `src/lib/stores/dashboardNavigationStore.ts`
- Tous les usages du store

**Actions**:
```typescript
// Avant
const { main, sub, leaf } = useDashboardNavigationStore();

// Après - avec shallow comparison
const main = useDashboardNavigationStore(state => state.main);
const sub = useDashboardNavigationStore(state => state.sub);
const leaf = useDashboardNavigationStore(state => state.leaf);
```

#### 3. Virtualisation Listes (6 J/H)

**Fichiers**:
- `src/modules/dashboard/components/views/*.tsx`

**Actions**:
- Utiliser `@tanstack/react-virtual` pour listes >50 items
- Lazy loading composants lourds

#### 4. Profiling & Tests (4 J/H)

**Actions**:
- Profiler avec React DevTools
- Mesurer avant/après (Lighthouse)
- Tests performance

### Checklist QA

- [ ] Lighthouse Performance +15 points
- [ ] Temps de rendu initial -30%
- [ ] Pas de régression fonctionnelle
- [ ] Tests performance passent
- [ ] Profiling validé

---

## 📋 Plan d'Exécution Global

### Ordre d'Implémentation

1. **PR #04** (2 jours) - 🔴 CRITIQUE
   - Corriger erreurs runtime immédiatement
   - Améliorer provider guards
   - Optimiser routing

2. **PR #05** (2.5 jours) - 🟡 HAUTE
   - Créer routes API manquantes
   - Éliminer erreurs 404

3. **PR #06** (3 jours) - 🟡 HAUTE
   - Optimiser performance
   - Améliorer UX

**Total**: ~7.5 jours (60 J/H)

---

## 🧪 Tests Requis

### PR #04
- [ ] Tests unitaires `DashboardViewRouter`
- [ ] Tests E2E navigation complète
- [ ] Tests provider guards

### PR #05
- [ ] Tests API routes gouvernance
- [ ] Tests intégration front/back
- [ ] Tests fallback données mockées

### PR #06
- [ ] Tests performance (Lighthouse)
- [ ] Tests rendering (React DevTools)
- [ ] Tests non-régression

---

## 📚 Documentation

Pour chaque PR:
- [ ] Changelog mis à jour
- [ ] README mis à jour
- [ ] OpenAPI spec (si API)
- [ ] Guide migration (si breaking changes)

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 Prêt pour implémentation
