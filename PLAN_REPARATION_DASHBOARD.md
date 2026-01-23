# 🔧 PLAN DE RÉPARATION DASHBOARD - Actions Concrètes

**Date**: 2026-01-23  
**Priorité**: 🔴 CRITIQUE  
**Estimation totale**: 7h

---

## 📋 CHECKLIST DE VÉRIFICATION

### ✅ Phase 1: Vérifications Immédiates (2h)

#### 1.1 Vérifier les Modals (30min)

**Actions**:
1. Ouvrir DevTools → React DevTools
2. Naviguer vers `/maitre-ouvrage/dashboard`
3. Vérifier dans l'arbre React:
   - [ ] `DashboardModals` est monté
   - [ ] `DashboardContent` est monté
   - [ ] Aucune erreur dans la console

4. Tester l'ouverture d'un modal:
   ```typescript
   // Dans la console DevTools
   const store = window.__ZUSTAND_STORE__; // Si exposé
   // Ou utiliser React DevTools pour inspecter le store
   ```

5. Vérifier le store `useDashboardCommandCenterStore`:
   - [ ] Le store existe
   - [ ] `modal.isOpen` change correctement
   - [ ] `openModal()` fonctionne

**Fichiers à vérifier**:
- `src/lib/stores/dashboardCommandCenterStore.ts`
- `src/components/features/bmo/dashboard/command-center/DashboardModals.tsx`
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (ligne 1096)

**Si problème détecté**:
```typescript
// ✅ Vérifier que DashboardModals est bien lazy-loaded
const DashboardModals = lazy(() => 
  import('@/components/features/bmo/dashboard/command-center/DashboardModals')
    .then(m => ({ default: m.DashboardModals }))
);

// ✅ Vérifier qu'il est monté dans le render
<Suspense fallback={null}>
  <DashboardModals />
</Suspense>
```

---

#### 1.2 Vérifier les API (30min)

**Actions**:
1. Démarrer le serveur de développement
2. Tester les endpoints:
   ```bash
   # Terminal 1: Démarrer le serveur
   npm run dev
   
   # Terminal 2: Tester les endpoints
   curl http://localhost:3000/api/gouvernance/stats
   curl http://localhost:3000/api/calendrier/overview
   curl http://localhost:3000/api/demandes/stats
   ```

3. Vérifier les réponses:
   - [ ] Status 200 OK
   - [ ] Données JSON valides
   - [ ] Pas d'erreur 404

**Fichiers à vérifier**:
- `app/api/gouvernance/stats/route.ts`
- `app/api/calendrier/overview/route.ts` (si existe)
- `app/api/demandes/stats/route.ts`

**Si endpoint manquant**:
```typescript
// ✅ Créer le fichier manquant
// app/api/calendrier/overview/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Logique pour récupérer les données
    const data = await getCalendrierOverview();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

#### 1.3 Chercher les Composants Pattern (1h)

**Actions**:
1. Chercher tous les composants "Pattern":
   ```bash
   # Dans le terminal
   grep -r "Pattern" src/ --include="*.tsx" --include="*.ts"
   grep -r "pattern" src/ --include="*.tsx" --include="*.ts" -i
   ```

2. Identifier les composants:
   - [ ] Liste tous les composants Pattern trouvés
   - [ ] Vérifier leur montage conditionnel
   - [ ] Vérifier les dépendances de données

3. Vérifier leur affichage:
   - [ ] Ouvrir DevTools → Elements
   - [ ] Chercher les éléments avec classe "pattern"
   - [ ] Vérifier qu'ils sont visibles (pas `display: none`)

**Si patterns non affichés**:
```typescript
// ✅ Vérifier le montage conditionnel
{showPatterns && (
  <PatternComponent data={patternData} />
)}

// ✅ Vérifier les styles
.pattern {
  display: block; /* Pas display: none */
  visibility: visible; /* Pas visibility: hidden */
}
```

---

### ✅ Phase 2: Corrections Critiques (4h)

#### 2.1 Migrer les Images vers AppImage (1h)

**Actions**:
1. Chercher toutes les images avec `fill`:
   ```bash
   grep -r "fill" src/ --include="*.tsx" | grep -i "image"
   grep -r "Image.*fill" app/ --include="*.tsx"
   ```

2. Pour chaque image trouvée:
   - [ ] Vérifier si `sizes` est présent
   - [ ] Si absent, remplacer par `AppImage`

**Exemple de migration**:
```typescript
// ❌ AVANT
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo" 
  fill 
  className="..."
/>

// ✅ APRÈS
import { AppImage } from '@/components/ui/AppImage';

<AppImage 
  src="/logo.png" 
  alt="Logo" 
  fill 
  className="..."
  // sizes ajouté automatiquement
/>
```

**Fichiers à modifier**:
- Chercher dans `src/components/`
- Chercher dans `app/`
- Chercher dans `src/modules/`

---

#### 2.2 Ajouter des Fallbacks pour les API (1h)

**Actions**:
1. Modifier `useDashboardKPIs` pour ajouter des fallbacks:
   ```typescript
   // src/lib/hooks/useDashboardKPIs.ts
   export function useDashboardKPIs(period: string) {
     const { data, error, isLoading } = useQuery({
       queryKey: ['dashboard-kpis', period],
       queryFn: () => fetchDashboardKPIs(period),
       // ✅ Ajouter fallback
       retry: 3,
       retryDelay: 1000,
     });
     
     // ✅ Si erreur, utiliser données mockées
     const safeData = error ? mockKPIs : data;
     
     return {
       kpis: safeData,
       error,
       isLoading,
     };
   }
   ```

2. Créer des données mockées:
   ```typescript
   // src/lib/mocks/dashboardKPIMock.ts
   export const mockKPIs = [
     { label: 'Demandes', value: 247, delta: '+12', tone: 'ok', trend: 'up' },
     // ...
   ];
   ```

**Fichiers à modifier**:
- `src/lib/hooks/useDashboardKPIs.ts`
- Créer `src/lib/mocks/dashboardKPIMock.ts`

---

#### 2.3 Vérifier et Optimiser Fast Refresh (2h)

**Actions**:
1. Vérifier les exports:
   ```bash
   # Chercher les exports par défaut instables
   grep -r "export default" src/modules/dashboard/ --include="*.tsx"
   ```

2. Convertir les exports par défaut en exports nommés:
   ```typescript
   // ❌ AVANT
   export default function DashboardKPIBar() { ... }
   
   // ✅ APRÈS
   export const DashboardKPIBar = memo(function DashboardKPIBar() { ... });
   ```

3. Vérifier les `memo()`:
   - [ ] Tous les composants exportés sont mémorisés
   - [ ] Les props sont stables (useMemo/useCallback)

**Fichiers à vérifier**:
- `src/modules/dashboard/components/*.tsx`
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

---

### ✅ Phase 3: Optimisations (1h)

#### 3.1 Optimiser les Re-renders (30min)

**Actions**:
1. Vérifier tous les `useMemo` et `useCallback`:
   - [ ] Toutes les valeurs calculées sont mémorisées
   - [ ] Tous les handlers sont mémorisés
   - [ ] Les dépendances sont correctes

2. Utiliser des sélecteurs Zustand individuels:
   ```typescript
   // ❌ AVANT
   const { main, sub, leaf } = useDashboardNavigationStore();
   
   // ✅ APRÈS
   const main = useDashboardNavigationStore((state) => state.main);
   const sub = useDashboardNavigationStore((state) => state.sub);
   const leaf = useDashboardNavigationStore((state) => state.leaf);
   ```

**Fichiers à vérifier**:
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx`
- `src/modules/dashboard/components/DashboardKPIBar.tsx`

---

#### 3.2 Ajouter des Error Boundaries (30min)

**Actions**:
1. Vérifier que tous les composants critiques sont dans des ErrorBoundary:
   ```typescript
   // ✅ Vérifier dans page.tsx
   <ErrorBoundary>
     <DashboardViewRouter />
   </ErrorBoundary>
   
   <ErrorBoundary>
     <DashboardKPIBar kpis={allKpis} />
   </ErrorBoundary>
   ```

2. Ajouter des fallbacks UI:
   ```typescript
   // ✅ Dans ErrorBoundary
   <ErrorBoundary
     fallback={
       <div className="p-4 text-red-400">
         Erreur de chargement. Veuillez rafraîchir la page.
       </div>
     }
   >
     <Component />
   </ErrorBoundary>
   ```

**Fichiers à vérifier**:
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx`
- `src/components/shared/ErrorBoundary.tsx`

---

## 🧪 TESTS DE VALIDATION

### Test 1: Modals
```typescript
// ✅ Test manuel
1. Ouvrir le dashboard
2. Cliquer sur un KPI
3. Vérifier que le modal s'ouvre
4. Vérifier que le modal s'affiche correctement
5. Fermer le modal
6. Vérifier que le modal se ferme
```

### Test 2: API
```typescript
// ✅ Test avec curl
curl http://localhost:3000/api/gouvernance/stats
# Vérifier: Status 200, JSON valide

curl http://localhost:3000/api/demandes/stats
# Vérifier: Status 200, JSON valide
```

### Test 3: KPIs
```typescript
// ✅ Test visuel
1. Ouvrir le dashboard
2. Vérifier que les KPIs s'affichent
3. Vérifier que les valeurs sont correctes
4. Vérifier que les icônes s'affichent
5. Vérifier que les tendances s'affichent
```

### Test 4: Routing
```typescript
// ✅ Test de navigation
1. Cliquer sur "Overview" dans la sidebar
2. Vérifier que la vue change
3. Cliquer sur "Performance"
4. Vérifier que la vue change
5. Vérifier l'URL dans la barre d'adresse
```

---

## 📊 CHECKLIST FINALE

### Avant de considérer comme terminé:

- [ ] Tous les modals s'ouvrent correctement
- [ ] Toutes les API répondent (200 OK)
- [ ] Tous les KPIs s'affichent avec des valeurs
- [ ] Toutes les icônes s'affichent
- [ ] Le routing fonctionne (navigation sidebar/subnav)
- [ ] Pas d'erreurs dans la console
- [ ] Pas de warnings React
- [ ] Pas de boucles infinies
- [ ] Fast Refresh fonctionne sans rebuild en boucle
- [ ] Les images s'affichent correctement
- [ ] Les patterns s'affichent (si identifiés)

---

## 🚨 PROBLÈMES CRITIQUES RESTANTS

Si après toutes ces vérifications, des problèmes persistent:

1. **Modals ne s'ouvrent pas**:
   - Vérifier le store `useDashboardCommandCenterStore`
   - Vérifier que `openModal()` est appelé
   - Vérifier que `modal.isOpen` change

2. **KPIs vides**:
   - Vérifier les API (endpoints + données)
   - Vérifier les fallbacks
   - Vérifier les logs d'erreur

3. **Routing cassé**:
   - Vérifier `DashboardViewRouter`
   - Vérifier `routeValidation`
   - Vérifier la config JSON

4. **Boucles infinies**:
   - Vérifier tous les `useEffect`
   - Vérifier les dépendances
   - Vérifier les refs

---

## 📝 NOTES

1. **La majorité des problèmes sont résolus** ✅
2. **Les actions restantes sont principalement des vérifications** ⚠️
3. **Suivre la checklist dans l'ordre** pour être efficace
4. **Documenter les problèmes trouvés** pour référence future

---

**Document généré le**: 2026-01-23  
**Dernière mise à jour**: 2026-01-23
