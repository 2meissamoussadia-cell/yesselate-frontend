# 🔧 CORRECTIONS ET REFACTORISATION COMPLÈTE

## 📋 Résumé de l'Audit

**Problèmes critiques identifiés**:
1. ✅ **3 stores de navigation** (2 doublons)
2. ✅ **3 hooks de synchronisation URL** (2 doublons)
3. ✅ **2 sidebars** (1 doublon)
4. ✅ **2 subnavigations** (1 doublon)
5. ✅ **4 routers** (3 doublons)
6. ✅ **Boucles infinies** (StoreBridge, DashboardUrlSync)
7. ✅ **Timeouts/Intervals** (bien gérés mais à optimiser)
8. ✅ **Retries** (cleanup à améliorer)

---

## 🎯 PLAN D'ACTION

### Phase 1: Suppression des Doublons Critiques

#### 1.1 Supprimer `navigationStore.ts` ⚠️ ATTENTION
**Fichier**: `src/lib/stores/navigationStore.ts`

**Problème**: Conflit localStorage avec `dashboardNavigationStore`

**Fichiers utilisant `useNavigationStore`**:
- `src/hooks/usePageNavigation.ts` (utilisé pour navigation générale, pas dashboard)
- `src/hooks/useAutoSync.ts` (utilisé pour auto-sync général)
- `src/components/shared/AutoSyncProvider.tsx` (utilisé pour auto-sync général)
- `src/hooks/useModalManager.ts` (utilisé pour modals)
- `src/components/features/bmo/Sidebar.tsx` (utilisé pour sidebar générale)
- `src/hooks/usePageInteractions.ts` (utilisé pour interactions générales)

**⚠️ DÉCISION**: `navigationStore.ts` est utilisé pour la navigation GÉNÉRALE (pas dashboard). 
- **Option A**: Renommer la clé localStorage pour éviter le conflit
- **Option B**: Garder les deux stores mais avec des clés différentes
- **Option C**: Unifier en un seul store (complexe, nécessite refactor de tous les modules)

**✅ RECOMMANDATION**: Option A - Renommer la clé localStorage de `navigationStore.ts` en `general-navigation-storage`

#### 1.2 Supprimer `useDashboardNavigationWithUrl.ts`
**Fichier**: `src/lib/stores/hooks/useDashboardNavigationWithUrl.ts`

**Action**: Supprimer (doublon de `useDashboardNavigationSync`)

#### 1.3 Supprimer `DynamicSidebar.tsx` et `DynamicSubnav.tsx`
**Fichiers**: 
- `src/modules/dashboard/components/DynamicSidebar.tsx`
- `src/modules/dashboard/components/DynamicSubnav.tsx`

**Action**: Supprimer (non utilisés)

#### 1.4 Supprimer `StoreBridge.tsx` et `DashboardUrlSync.tsx`
**Fichiers**:
- `src/modules/dashboard/components/StoreBridge.tsx`
- `src/modules/dashboard/components/DashboardUrlSync.tsx`

**Action**: Supprimer (créent des boucles infinies)

---

### Phase 2: Amélioration des Composants

#### 2.1 Améliorer `DashboardViewRouter.tsx`
**Problème**: Recharge le composant à chaque changement même si identique

**Solution**: Ajouter un cache des composants chargés

#### 2.2 Optimiser `page.tsx`
**Problèmes**:
- `stats` peut créer des re-renders
- `refreshKPIsInternal` dans dépendances peut créer des boucles
- Cleanup des retries à améliorer

**Solutions**:
- Mémoriser `stats` (déjà fait ligne 325)
- Utiliser `useRef` pour `refreshKPIsInternal` dans dépendances
- Améliorer cleanup des retries

---

## 🔧 CORRECTIONS À APPLIQUER

### Correction 1: Renommer clé localStorage de navigationStore

**Fichier**: `src/lib/stores/navigationStore.ts`

**Changement**: Ligne 55
```typescript
// AVANT
name: 'dashboard-navigation-storage',

// APRÈS
name: 'general-navigation-storage',
```

### Correction 2: Améliorer DashboardViewRouter avec cache

**Fichier**: `src/modules/dashboard/components/DashboardViewRouter.tsx`

**Ajouter**: Cache des composants chargés pour éviter les rechargements inutiles

### Correction 3: Optimiser page.tsx

**Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Changements**:
1. Utiliser `useRef` pour `refreshKPIsInternal` dans dépendances
2. Améliorer cleanup des retries avec `AbortController`

---

## 📝 PROCHAINES ÉTAPES

1. ✅ Appliquer Correction 1 (renommer clé localStorage)
2. ✅ Supprimer les fichiers doublons
3. ✅ Améliorer DashboardViewRouter
4. ✅ Optimiser page.tsx
5. ✅ Tester la navigation

