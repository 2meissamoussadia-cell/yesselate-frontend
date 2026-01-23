# 🔍 AUDIT COMPLET ET SYSTÉMIQUE - Module Dashboard

**Date**: $(date)  
**Objectif**: Identifier TOUS les problèmes structurels, même profonds et non évidents

---

## 📊 1. ANALYSE GLOBALE DU PROJET

### 1.1 Stores Zustand Identifiés

#### ⚠️ **PROBLÈME CRITIQUE : TROIS STORES DE NAVIGATION POUR LE DASHBOARD**

1. **`dashboardNavigationStore.ts`** ✅ (Utilisé actuellement)
   - Location: `src/lib/stores/dashboardNavigationStore.ts`
   - État: `main`, `sub`, `leaf`
   - Actions: `setMain`, `setSub`, `setLeaf`
   - Persisté: Oui (localStorage: `dashboard-navigation-storage`)

2. **`navigationStore.ts`** ❌ **DOUBLON**
   - Location: `src/lib/stores/navigationStore.ts`
   - État: `main`, `sub`, `leaf` (IDENTIQUE)
   - Actions: `setMain`, `setSub`, `setLeaf`, `navigate`, `reset`
   - Persisté: Oui (localStorage: `dashboard-navigation-storage`) ⚠️ **MÊME CLÉ !**
   - **PROBLÈME**: Conflit de localStorage avec `dashboardNavigationStore`

3. **`dashboardCommandCenterStore.ts`** ❌ **UTILISÉ POUR LA NAVIGATION**
   - Location: `src/lib/stores/dashboardCommandCenterStore.ts`
   - État: `navigation: { mainCategory, subCategory, subSubCategory }`
   - Actions: `navigate()`, `setMainCategory()`, `setSubCategory()`, `setFilter()`
   - **PROBLÈME**: Utilisé par plusieurs composants pour la navigation

#### Autres Stores Identifiés (89 stores au total)
- Nombreux stores workspace, command center, etc.
- **Pas de problème** pour les autres modules

---

### 1.2 Hooks de Navigation Identifiés

#### ⚠️ **PROBLÈME CRITIQUE : TROIS HOOKS DE SYNCHRONISATION URL**

1. **`useDashboardNavigationSync.ts`** ✅ (Utilisé actuellement)
   - Location: `src/modules/dashboard/hooks/useDashboardNavigationSync.ts`
   - Store: `useDashboardNavigationStore`
   - Utilisé dans: `layout.tsx` via `DashboardSync`

2. **`useDashboardNavigationWithUrl.ts`** ❌ **DOUBLON**
   - Location: `src/lib/stores/hooks/useDashboardNavigationWithUrl.ts`
   - Store: `useDashboardNavigationStore`
   - **PROBLÈME**: Même fonctionnalité que `useDashboardNavigationSync`
   - **PROBLÈME**: Pas de protections contre les boucles infinies
   - **PROBLÈME**: Dépendances incorrectes (`searchParams` dans les dépendances)

3. **`DashboardUrlSync.tsx`** ❌ **UTILISE LE MAUVAIS STORE**
   - Location: `src/modules/dashboard/components/DashboardUrlSync.tsx`
   - Store: `useDashboardCommandCenterStore` ⚠️
   - Utilisé dans: `DashboardCommandCenterPage.tsx`
   - **PROBLÈME**: Synchronise `commandCenterStore` ↔ URL (conflit avec `useDashboardNavigationSync`)

---

### 1.3 Sidebars Identifiées

#### ⚠️ **PROBLÈME CRITIQUE : DEUX SIDEBARS POUR LE DASHBOARD**

1. **`DashboardSidebar.tsx`** ✅ (Utilisé actuellement)
   - Location: `src/modules/dashboard/navigation/DashboardSidebar.tsx`
   - Store: `useDashboardNavigationStore` ✅
   - Utilisé dans: `page.tsx` ligne 640

2. **`DynamicSidebar.tsx`** ⚠️ **EXISTE MAIS NON UTILISÉ**
   - Location: `src/modules/dashboard/components/DynamicSidebar.tsx`
   - Store: `useDashboardNavigationStore` ✅
   - **PROBLÈME**: Composant inutile, crée de la confusion

3. **`DashboardSidebar.tsx` (Command Center)** ❌ **UTILISE LE MAUVAIS STORE**
   - Location: `src/components/features/bmo/dashboard/command-center/DashboardSidebar.tsx`
   - Store: `useDashboardCommandCenterStore` ⚠️
   - **PROBLÈME**: Utilisé dans `DashboardCommandCenterPage.tsx` (non utilisé dans `page.tsx`)

---

### 1.4 SubNavigations Identifiées

#### ⚠️ **PROBLÈME CRITIQUE : DEUX SUBNAVIGATIONS**

1. **`DashboardSubNavigation.tsx`** ✅ (Utilisé actuellement)
   - Location: `src/modules/dashboard/navigation/DashboardSubNavigation.tsx`
   - Store: `useDashboardNavigationStore` ✅
   - Utilisé dans: `page.tsx` ligne 656

2. **`DynamicSubnav.tsx`** ⚠️ **EXISTE MAIS NON UTILISÉ**
   - Location: `src/modules/dashboard/components/DynamicSubnav.tsx`
   - Store: `useDashboardNavigationStore` ✅
   - **PROBLÈME**: Composant inutile

3. **`DashboardSubNavigation.tsx` (Command Center)** ❌ **UTILISE LE MAUVAIS STORE**
   - Location: `src/components/features/bmo/dashboard/command-center/DashboardSubNavigation.tsx`
   - Store: `useDashboardCommandCenterStore` ⚠️
   - **PROBLÈME**: Utilisé dans `DashboardCommandCenterPage.tsx` (non utilisé dans `page.tsx`)

---

### 1.5 Routers Identifiés

#### ⚠️ **PROBLÈME CRITIQUE : TROIS ROUTERS**

1. **`DashboardViewRouter.tsx`** ✅ (Utilisé actuellement)
   - Location: `src/modules/dashboard/components/DashboardViewRouter.tsx`
   - Store: `useDashboardNavigationStore` ✅
   - Utilisé dans: `page.tsx` ligne 930

2. **`DashboardContentRouter.tsx`** ❌ **UTILISE LE MAUVAIS STORE**
   - Location: `src/modules/dashboard/components/DashboardContentRouter.tsx`
   - Store: `useDashboardCommandCenterStore` ⚠️
   - **PROBLÈME**: Utilisé dans `DashboardCommandCenterPage.tsx` (non utilisé dans `page.tsx`)

3. **`DashboardContentSwitch.tsx`** ❌ **UTILISE LE MAUVAIS STORE**
   - Location: `src/modules/dashboard/components/DashboardContentSwitch.tsx`
   - Store: `useDashboardCommandCenterStore` ⚠️
   - **PROBLÈME**: Utilisé dans `DashboardCommandCenterPage.tsx` (non utilisé dans `page.tsx`)

4. **`DashboardContentRouter.tsx` (Command Center)** ❌ **UTILISE LE MAUVAIS STORE**
   - Location: `src/components/features/bmo/dashboard/command-center/DashboardContentRouter.tsx`
   - Store: `useDashboardCommandCenterStore` ⚠️
   - **PROBLÈME**: Utilisé dans `DashboardCommandCenterPage.tsx` (non utilisé dans `page.tsx`)

---

## 🔥 2. PROBLÈMES STRUCTURELS IDENTIFIÉS

### 2.1 Boucles Infinies

#### ⚠️ **PROBLÈME 1 : Conflit entre Stores de Navigation**

**Symptôme**: Boucle infinie URL ↔ store ↔ router

**Cause**:
1. `useDashboardNavigationSync` synchronise `navigationStore` ↔ URL
2. `DashboardUrlSync` synchronise `commandCenterStore` ↔ URL
3. `StoreBridge` synchronise `commandCenterStore` → `navigationStore`

**Flux de la boucle**:
```
commandCenterStore change
  → StoreBridge → navigationStore change
    → useDashboardNavigationSync → URL change
      → DashboardUrlSync → commandCenterStore change
        → (boucle infinie)
```

**Fichiers concernés**:
- `src/modules/dashboard/components/StoreBridge.tsx` (ligne 22-80)
- `src/modules/dashboard/components/DashboardUrlSync.tsx` (ligne 8-38)
- `src/modules/dashboard/hooks/useDashboardNavigationSync.ts` (ligne 7-104)

#### ⚠️ **PROBLÈME 2 : useDashboardNavigationWithUrl sans Protections**

**Fichier**: `src/lib/stores/hooks/useDashboardNavigationWithUrl.ts`

**Problèmes**:
- Ligne 42: `searchParams` dans les dépendances → re-render à chaque changement d'URL
- Ligne 30: Pas de vérification si l'URL est déjà correcte avant `router.replace`
- Ligne 45-60: Synchronisation URL → Store au montage sans protections
- **Risque**: Boucle infinie si utilisé en parallèle avec `useDashboardNavigationSync`

---

### 2.2 Effets useEffect en Cascade

#### ⚠️ **PROBLÈME 3 : 16 useEffect dans page.tsx**

**Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**useEffect identifiés**:
1. Ligne 154: Log de navigation (dépend de `main`, `sub`, `leaf`)
2. Ligne 298: Mise à jour `lastUpdate` (dépend de `apiLastUpdate`)
3. Ligne 305: Persistance filtre (dépend de `kpiFilter`)
4. Ligne 338: Mesure performances (dépend de `main`, `sub`, `leaf`)
5. Ligne 355: Détection changements KPIs (dépend de `allKpis`)
6. Ligne 403: Synchronisation `refreshStatusRef` (dépend de `refreshStatus`)
7. Ligne 499: Cleanup timeouts (dépend de rien)
8. Ligne 502: Cleanup retry timeouts (dépend de rien)
9. Ligne 563: Refresh initial (dépend de `refreshKPIsInternal`)
10. Ligne 576: Refresh périodique (dépend de rien)
11. Ligne 585: Raccourcis clavier (dépend de plusieurs états)
12. Ligne 1100: Animation KPI (dépend de `kpi.value`, `kpi.delta`)
13. Ligne 1537: Format time ago (dépend de `lastUpdate`)

**Problèmes**:
- Ligne 563: `refreshKPIsInternal` dans les dépendances → peut créer une boucle
- Ligne 338: Dépend de `main`, `sub`, `leaf` → se déclenche à chaque navigation
- Ligne 355: Dépend de `allKpis` → peut se déclencher en boucle si KPIs changent

---

### 2.3 Stores qui se Mettent à Jour Mutuellement

#### ⚠️ **PROBLÈME 4 : StoreBridge crée une Boucle**

**Fichier**: `src/modules/dashboard/components/StoreBridge.tsx`

**Problème**:
- Synchronise `commandCenterStore` → `navigationStore`
- Mais `commandCenterStore` est encore utilisé par certains composants
- Si un composant met à jour `commandCenterStore`, `StoreBridge` met à jour `navigationStore`
- Si un composant met à jour `navigationStore`, pas de synchronisation inverse
- **Résultat**: Désynchronisation possible

---

### 2.4 Composants qui se Démontent / Remontent en Boucle

#### ⚠️ **PROBLÈME 5 : DashboardViewRouter se Recharge à Chaque Changement**

**Fichier**: `src/modules/dashboard/components/DashboardViewRouter.tsx`

**Problème**:
- Ligne 41-104: `useEffect` qui recharge le composant à chaque changement de `main`, `sub`, `leaf`
- Pas de cache des composants chargés
- **Résultat**: Rechargement inutile même si le composant est identique

---

### 2.5 Timeouts / Intervals sans Cleanup

#### ⚠️ **PROBLÈME 6 : Timeouts dans page.tsx**

**Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Timeouts identifiés**:
1. Ligne 389: Timeout pour auto-dismiss notifications (5s) ✅ Cleanup ligne 394
2. Ligne 469: Timeout pour retry (exponential backoff) ✅ Cleanup ligne 510
3. Ligne 490: Timeout pour auto-dismiss erreur (10s) ✅ Cleanup ligne 502
4. Ligne 564: Timeout pour refresh initial (5s) ✅ Cleanup ligne 570
5. Ligne 1100: Timeout pour animation (600ms) ✅ Cleanup ligne 1101

**Intervals identifiés**:
1. Ligne 577: Interval pour refresh périodique (5 min) ✅ Cleanup ligne 581
2. Ligne 1537: Interval pour format time ago (1 min) ✅ Cleanup ligne 1541

**✅ BON**: Tous les timeouts/intervals ont un cleanup

**⚠️ PROBLÈME POTENTIEL**:
- Ligne 563-573: Le cleanup nettoie `timeoutsRef.current` mais `refreshKPIsInternal` peut créer de nouveaux timeouts après le cleanup
- Ligne 469: Les retry timeouts sont ajoutés à `retryTimeoutsRef.current` mais le cleanup ligne 510 peut ne pas les attraper si le composant se démonte pendant un retry

---

### 2.6 Retries qui Continuent après Changement de Page

#### ⚠️ **PROBLÈME 7 : Retries sans Annulation**

**Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Problème**:
- Ligne 469: Retry avec `setTimeout` qui appelle `refreshKPIsInternal`
- Si le composant se démonte, le timeout continue
- Le cleanup ligne 510 nettoie `retryTimeoutsRef.current`, mais seulement au démontage
- **Risque**: Retry qui continue après navigation

---

### 2.7 Conflits entre Stores

#### ⚠️ **PROBLÈME 8 : Deux Stores Utilisés pour la Navigation**

**Stores**:
1. `useDashboardNavigationStore` (utilisé par les composants corrigés)
2. `useDashboardCommandCenterStore` (encore utilisé par certains composants)

**Composants utilisant `commandCenterStore` pour la navigation**:
- `src/modules/dashboard/components/DashboardContentSwitch.tsx` (ligne 20)
- `src/modules/dashboard/components/DashboardContentRouter.tsx` (ligne 60)
- `src/components/features/bmo/dashboard/command-center/DashboardSidebar.tsx` (ligne 22)
- `src/components/features/bmo/dashboard/command-center/DashboardSubNavigation.tsx` (ligne 11)
- `src/components/features/bmo/dashboard/command-center/DashboardContentRouter.tsx` (ligne 18)

**Problème**: Ces composants ne sont pas utilisés dans `page.tsx`, mais ils existent et peuvent créer de la confusion.

---

### 2.8 Handlers de Navigation au Survol

#### ✅ **BON**: Pas de `onMouseEnter` qui déclenche la navigation

**Vérification**: Aucun `onMouseEnter` ou `onMouseOver` trouvé dans les fichiers de navigation.

---

### 2.9 Props Inutiles qui Créent des Re-renders

#### ⚠️ **PROBLÈME 9 : Props Inutiles dans DashboardSidebar**

**Fichier**: `src/modules/dashboard/navigation/DashboardSidebar.tsx`

**Props actuelles**:
- `collapsed` ✅ (nécessaire)
- `stats` ⚠️ (peut créer des re-renders si l'objet change)
- `onToggleCollapse` ✅ (nécessaire)
- `onOpenCommandPalette` ✅ (nécessaire)

**Problème potentiel**:
- `stats` est un objet qui peut changer à chaque render
- Si passé directement, peut créer des re-renders inutiles

---

### 2.10 Layouts qui Montent Plusieurs Sidebars

#### ✅ **BON**: Une seule sidebar montée dans `page.tsx`

**Vérification**: 
- `DashboardSidebar` montée ligne 640
- Pas d'autre sidebar montée

---

## 🔥 3. DOUBLONS IDENTIFIÉS

### 3.1 Stores Dupliqués

1. **`navigationStore.ts`** vs **`dashboardNavigationStore.ts`**
   - Même structure
   - Même clé localStorage ⚠️
   - **Action**: Supprimer `navigationStore.ts`

### 3.2 Hooks Dupliqués

1. **`useDashboardNavigationWithUrl.ts`** vs **`useDashboardNavigationSync.ts`**
   - Même fonctionnalité
   - **Action**: Supprimer `useDashboardNavigationWithUrl.ts`

### 3.3 Composants Dupliqués

1. **`DynamicSidebar.tsx`** vs **`DashboardSidebar.tsx`**
   - `DynamicSidebar` non utilisé
   - **Action**: Supprimer `DynamicSidebar.tsx`

2. **`DynamicSubnav.tsx`** vs **`DashboardSubNavigation.tsx`**
   - `DynamicSubnav` non utilisé
   - **Action**: Supprimer `DynamicSubnav.tsx`

### 3.4 Routers Dupliqués

1. **`DashboardContentRouter.tsx`** (module) vs **`DashboardContentRouter.tsx`** (command-center)
   - Même nom, emplacements différents
   - Utilisent des stores différents
   - **Action**: Renommer ou supprimer les non utilisés

---

## 🎯 4. ARCHITECTURE CIBLE

### 4.1 Store Unique

```
useDashboardNavigationStore (UN SEUL)
  ├─ État: main, sub, leaf
  ├─ Actions: setMain, setSub, setLeaf
  └─ Persisté: localStorage (clé unique)
```

### 4.2 Hook de Synchronisation Unique

```
useDashboardNavigationSync (UN SEUL)
  ├─ URL → Store (avec protections)
  ├─ Store → URL (avec protections)
  └─ Utilisé uniquement dans layout.tsx
```

### 4.3 Sidebar Unique

```
DashboardSidebar (UN SEUL)
  ├─ Store: useDashboardNavigationStore
  ├─ Actions: setMain, setSub, setLeaf
  └─ Montée uniquement dans page.tsx
```

### 4.4 SubNavigation Unique

```
DashboardSubNavigation (UN SEUL)
  ├─ Store: useDashboardNavigationStore
  ├─ Actions: setSub, setLeaf
  └─ Montée uniquement dans page.tsx
```

### 4.5 Router Unique

```
DashboardViewRouter (UN SEUL)
  ├─ Store: useDashboardNavigationStore
  ├─ Charge dynamiquement les composants
  └─ Cache les composants chargés
```

### 4.6 Gestion des KPIs

```
useDashboardKPIs
  ├─ Cleanup des timeouts au démontage
  ├─ Annulation des retries au démontage
  └─ Limite des retries (maxRetries)
```

---

## 🔧 5. PLAN DE REFACTORISATION

### Phase 1: Nettoyage des Doublons

1. ✅ Supprimer `src/lib/stores/navigationStore.ts`
2. ✅ Supprimer `src/lib/stores/hooks/useDashboardNavigationWithUrl.ts`
3. ✅ Supprimer `src/modules/dashboard/components/DynamicSidebar.tsx`
4. ✅ Supprimer `src/modules/dashboard/components/DynamicSubnav.tsx`
5. ✅ Supprimer ou renommer les composants non utilisés dans `command-center`

### Phase 2: Suppression des Conflits

1. ✅ Supprimer `src/modules/dashboard/components/StoreBridge.tsx`
2. ✅ Supprimer `src/modules/dashboard/components/DashboardUrlSync.tsx`
3. ✅ Supprimer `src/modules/dashboard/components/DashboardCommandCenterPage.tsx`

### Phase 3: Amélioration des Protections

1. ✅ Améliorer `useDashboardNavigationSync` avec `lastUrlRef`
2. ✅ Ajouter cache dans `DashboardViewRouter`
3. ✅ Améliorer cleanup des retries dans `page.tsx`

### Phase 4: Optimisation

1. ✅ Mémoriser `stats` dans `page.tsx`
2. ✅ Optimiser les dépendances des `useEffect`
3. ✅ Ajouter cache pour les composants chargés

---

## 📋 6. FICHIERS À MODIFIER / SUPPRIMER

### À Supprimer

1. `src/lib/stores/navigationStore.ts` ❌
2. `src/lib/stores/hooks/useDashboardNavigationWithUrl.ts` ❌
3. `src/modules/dashboard/components/DynamicSidebar.tsx` ❌
4. `src/modules/dashboard/components/DynamicSubnav.tsx` ❌
5. `src/modules/dashboard/components/StoreBridge.tsx` ❌
6. `src/modules/dashboard/components/DashboardUrlSync.tsx` ❌
7. `src/modules/dashboard/components/DashboardCommandCenterPage.tsx` ❌

### À Modifier

1. `src/modules/dashboard/hooks/useDashboardNavigationSync.ts` ✅ (déjà corrigé)
2. `src/modules/dashboard/components/DashboardViewRouter.tsx` ⚠️ (ajouter cache)
3. `app/(portals)/maitre-ouvrage/dashboard/page.tsx` ⚠️ (optimiser useEffect)
4. `src/modules/dashboard/components/index.ts` ⚠️ (retirer exports supprimés)

---

## ✅ 7. RÉSULTAT ATTENDU

Après refactorisation :

- ✅ **Un seul store** : `useDashboardNavigationStore`
- ✅ **Un seul hook de sync** : `useDashboardNavigationSync`
- ✅ **Une seule sidebar** : `DashboardSidebar`
- ✅ **Une seule subnav** : `DashboardSubNavigation`
- ✅ **Un seul router** : `DashboardViewRouter`
- ✅ **Pas de boucle infinie** : Protections en place
- ✅ **KPIs propres** : Cleanup complet
- ✅ **Retries propres** : Annulation au démontage
- ✅ **Navigation stable** : Pas de clignotement
- ✅ **Architecture claire** : Responsabilités séparées

---

## 🚨 PROBLÈMES CRITIQUES À CORRIGER EN PRIORITÉ

1. **🔥 CRITIQUE**: Supprimer `navigationStore.ts` (conflit localStorage)
2. **🔥 CRITIQUE**: Supprimer `StoreBridge.tsx` (crée des boucles)
3. **🔥 CRITIQUE**: Supprimer `DashboardUrlSync.tsx` (utilise mauvais store)
4. **🔥 CRITIQUE**: Supprimer `useDashboardNavigationWithUrl.ts` (doublon)
5. **⚠️ IMPORTANT**: Ajouter cache dans `DashboardViewRouter`
6. **⚠️ IMPORTANT**: Optimiser cleanup des retries dans `page.tsx`
7. **⚠️ IMPORTANT**: Mémoriser `stats` dans `page.tsx`

---

**Prochaines étapes**: Générer les versions corrigées de tous les fichiers.

