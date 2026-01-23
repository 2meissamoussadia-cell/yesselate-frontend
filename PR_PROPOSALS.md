# 🎯 3 PRs Prioritaires - ERP BTP Front-End

**Date**: 2025-01-XX  
**Statut**: 📋 Prêts à être appliqués  
**Priorité**: 🔴 CRITIQUE → 🟠 HAUTE → 🟡 MOYENNE

---

## 📋 PR #01 : Extraction Domaine Demandes (Finalisation)

### Métadonnées
- **Titre PR**: `refactor/demandes-extract-domain-logic`
- **Type**: Refactoring
- **Priorité**: 🔴 CRITIQUE
- **Estimation**: 8 J/H (1 jour)
- **Impact**: ⭐⭐⭐⭐⭐ (Très élevé)
- **Risque**: Faible (services déjà créés et testés)

### Description Métier

**Contexte**: Le module Demandes a déjà 90% de sa logique extraite vers `src/domain/demandes/`. Il reste à finaliser le refactoring de `DemandView.tsx` pour utiliser exclusivement `useDemandeService`.

**Problème Métier**:
- `DemandView.tsx` utilise déjà `useDemandeService` mais peut contenir de la logique résiduelle
- Tests unitaires existent mais pas de tests E2E
- Pas de Storybook stories

**Solution Proposée**:
1. Vérifier et nettoyer `DemandView.tsx` pour utiliser uniquement `useDemandeService`
2. Ajouter tests E2E Playwright pour scénarios critiques
3. Créer Storybook stories pour composants modifiés

### Plan Technique

#### Étape 1 : Audit et Nettoyage DemandView.tsx (2J/H)
```typescript
// Vérifier que tous les calculs utilisent useDemandeService
const demandeService = useDemandeService(demandeForService);

// Remplacer toute logique résiduelle par les propriétés du service
// Avant: const budgetUsage = calculateBudget(...)
// Après: const budgetUsage = demandeService.budgetUsage
```

**Fichiers à modifier**:
- `src/components/features/bmo/workspace/views/DemandView.tsx`

#### Étape 2 : Tests E2E Playwright (3J/H)
**Fichier à créer**: `e2e/demandes/demand-view.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('DemandView', () => {
  test('should display demande details correctly', async ({ page }) => {
    await page.goto('/maitre-ouvrage/demandes');
    // Navigate to demand detail
    // Verify budget calculations
    // Verify risk scores
    // Verify validation status
  });

  test('should handle validation workflow', async ({ page }) => {
    // Test validation flow
  });
});
```

#### Étape 3 : Storybook Stories (2J/H)
**Fichier à créer**: `src/components/features/bmo/workspace/views/DemandView.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { DemandView } from './DemandView';

const meta: Meta<typeof DemandView> = {
  title: 'Workspace/DemandView',
  component: DemandView,
};

export default meta;
type Story = StoryObj<typeof DemandView>;

export const Default: Story = {
  args: {
    tab: { type: 'demand', id: 'demand-001' }
  }
};
```

#### Étape 4 : Validation et Mesures (1J/H)
- Exécuter tests unitaires existants
- Exécuter tests E2E
- Vérifier coverage >70%
- Mesurer temps de rendu avant/après

### Fichiers Modifiés Attendus
- `src/components/features/bmo/workspace/views/DemandView.tsx` (nettoyage)
- `e2e/demandes/demand-view.spec.ts` (nouveau)
- `src/components/features/bmo/workspace/views/DemandView.stories.tsx` (nouveau)

### Tests Requis
- ✅ Tests unitaires existants (6 fichiers, ~70% coverage)
- ❌ Tests E2E Playwright (à créer)
- ❌ Storybook stories (à créer)

### Checklist QA
- [ ] Tous les calculs utilisent `useDemandeService`
- [ ] Pas de logique métier dans le composant
- [ ] Tests unitaires passent (100%)
- [ ] Tests E2E passent
- [ ] Storybook build réussit
- [ ] Coverage >70%
- [ ] Pas de régression visuelle

### Rollback Plan
1. Revenir à la branche `pre-cursor-refactor`
2. Les services domain existent déjà, pas de risque de perte de logique
3. Rollback simple : revert commit sur `DemandView.tsx`

---

## 📋 PR #02 : Virtualisation Listes + Server Pagination

### Métadonnées
- **Titre PR**: `perf/virtualize-lists-server-pagination`
- **Type**: Performance
- **Priorité**: 🟠 HAUTE
- **Estimation**: 24 J/H (3 jours)
- **Impact**: ⭐⭐⭐⭐ (Élevé)
- **Risque**: Moyen (changements UI)

### Description Métier

**Contexte**: Les listes de demandes, chantiers, alertes, etc. chargent toutes les données en mémoire et rendent tous les éléments, même ceux non visibles. Cela cause des problèmes de performance avec de grandes listes.

**Problème Métier**:
- **Lenteur** : Listes de 1000+ éléments très lentes
- **Consommation mémoire** : Tous les éléments en mémoire
- **Expérience utilisateur** : Lag lors du scroll

**Solution Proposée**:
1. Virtualiser les listes avec `@tanstack/react-virtual`
2. Implémenter pagination serveur
3. Ajouter debounce sur les filtres

### Plan Technique

#### Étape 1 : Créer Composant TableVirtual Réutilisable (6J/H)
**Fichier à créer**: `src/components/ui/TableVirtual.tsx`

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery } from '@tanstack/react-query';

interface TableVirtualProps<T> {
  queryKey: string[];
  queryFn: (page: number, filters: Filters) => Promise<ApiResponse<T>>;
  columns: ColumnDef<T>[];
  filters?: Filters;
}

export function TableVirtual<T>({ queryKey, queryFn, columns, filters }: TableVirtualProps<T>) {
  // Virtual scrolling + server pagination
  // Debounced filters
  // Loading states
}
```

#### Étape 2 : Adapter Pages Listes (12J/H)
**Fichiers à modifier**:
1. `src/modules/demandes/pages/overview/DemandesOverviewView.tsx`
2. `src/components/features/bmo/chantiers/views/ChantiersListView.tsx`
3. `src/modules/centre-alertes/pages/overview/AlertesOverviewView.tsx`
4. `src/modules/blocked/pages/overview/BlockedOverviewView.tsx`

**Pattern à appliquer**:
```typescript
// Avant
const { data } = useQuery({
  queryKey: ['demandes'],
  queryFn: () => fetchAllDemandes()
});

// Après
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['demandes', filters],
  queryFn: ({ pageParam = 0 }) => fetchDemandes({ page: pageParam, filters }),
  getNextPageParam: (lastPage) => lastPage.nextPage
});

<TableVirtual
  queryKey={['demandes', filters]}
  queryFn={fetchDemandes}
  columns={columns}
  filters={filters}
/>
```

#### Étape 3 : Tests Performance (4J/H)
**Fichier à créer**: `e2e/performance/lists-virtualization.spec.ts`

```typescript
test('should handle 1000+ items smoothly', async ({ page }) => {
  // Measure LCP, TBT, render time
  // Verify virtualization works
});
```

#### Étape 4 : Storybook Stories (2J/H)
**Fichiers à créer**:
- `src/components/ui/TableVirtual.stories.tsx`
- Stories pour chaque liste virtualisée

### Fichiers Modifiés Attendus
- `src/components/ui/TableVirtual.tsx` (nouveau)
- `src/modules/demandes/pages/overview/DemandesOverviewView.tsx`
- `src/components/features/bmo/chantiers/views/ChantiersListView.tsx`
- `src/modules/centre-alertes/pages/overview/AlertesOverviewView.tsx`
- `src/modules/blocked/pages/overview/BlockedOverviewView.tsx`
- `e2e/performance/lists-virtualization.spec.ts` (nouveau)

### Tests Requis
- Tests E2E performance
- Storybook stories
- Tests unitaires pour TableVirtual

### Métriques Before/After
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Temps rendu 1000 items | ~2000ms | <200ms | ? |
| Mémoire utilisée | ~50MB | <5MB | ? |
| LCP | ~3s | <1.5s | ? |
| TBT | ~500ms | <200ms | ? |

### Checklist QA
- [ ] Virtualisation fonctionne (seulement items visibles rendus)
- [ ] Pagination serveur fonctionne
- [ ] Filtres debounced (300ms)
- [ ] Performance améliorée (mesures)
- [ ] Pas de régression visuelle
- [ ] Tests E2E passent

### Rollback Plan
1. Revenir à composants précédents
2. Les API routes supportent déjà pagination
3. Rollback simple : revert commits

---

## 📋 PR #03 : Tests Domain Services + Coverage 70%+

### Métadonnées
- **Titre PR**: `test/domain-services-coverage-70`
- **Type**: Tests
- **Priorité**: 🟡 MOYENNE
- **Estimation**: 16 J/H (2 jours)
- **Impact**: ⭐⭐⭐ (Moyen)
- **Risque**: Faible

### Description Métier

**Contexte**: Les services domain `demandes` ont déjà des tests (~70% coverage). Il faut étendre cette couverture et ajouter des tests pour les autres domaines.

**Problème Métier**:
- Services non testés = risque de bugs
- Pas de garantie de non-régression
- Difficulté à refactorer sans tests

**Solution Proposée**:
1. Compléter tests `demandes` à 80%+
2. Ajouter tests pour `analytics` domain
3. Ajouter tests pour services critiques (validation-bc, delegations)

### Plan Technique

#### Étape 1 : Compléter Tests Demandes (4J/H)
**Fichiers à modifier**:
- `src/domain/demandes/__tests__/demande.service.test.ts` (ajouter edge cases)
- `src/domain/demandes/__tests__/budget.service.test.ts` (ajouter edge cases)

**Coverage cible**: 80%+

#### Étape 2 : Tests Analytics Domain (6J/H)
**Fichiers à créer**:
- `src/domain/analytics/services/__tests__/TrendAnalysisService.test.ts` (existe, à compléter)
- Tests pour autres services analytics

#### Étape 3 : Tests Services Critiques (4J/H)
**Fichiers à créer**:
- `src/lib/services/__tests__/validation-bc-anomalies.service.test.ts`
- `src/lib/services/__tests__/delegationsApiService.test.ts`

#### Étape 4 : CI Coverage Gating (2J/H)
**Fichier à modifier**: `jest.config.js`

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  },
  './src/domain/': {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Fichiers Modifiés Attendus
- `src/domain/demandes/__tests__/*.test.ts` (compléter)
- `src/domain/analytics/services/__tests__/*.test.ts` (nouveau/compléter)
- `src/lib/services/__tests__/validation-bc-anomalies.service.test.ts` (nouveau)
- `src/lib/services/__tests__/delegationsApiService.test.ts` (nouveau)
- `jest.config.js` (modifier)

### Tests Requis
- Tests unitaires pour tous les services domain
- Coverage >70% global, >80% domain/

### Métriques Before/After
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Coverage global | ~5% | >70% | ? |
| Coverage domain/ | ~70% | >80% | ? |
| Tests unitaires | 18 | 50+ | ? |

### Checklist QA
- [ ] Coverage >70% global
- [ ] Coverage >80% domain/
- [ ] Tous les tests passent
- [ ] CI gating activé
- [ ] Pas de régression

### Rollback Plan
1. Désactiver coverage gating dans CI
2. Rollback simple : revert commits tests

---

## 📊 Comparaison PRs

| PR | Priorité | Effort | Impact | Risque | ROI |
|----|----------|--------|--------|--------|-----|
| #01 | 🔴 CRITIQUE | 8J/H | ⭐⭐⭐⭐⭐ | Faible | ⭐⭐⭐⭐⭐ |
| #02 | 🟠 HAUTE | 24J/H | ⭐⭐⭐⭐ | Moyen | ⭐⭐⭐⭐ |
| #03 | 🟡 MOYENNE | 16J/H | ⭐⭐⭐ | Faible | ⭐⭐⭐ |

**Recommandation**: Appliquer dans l'ordre #01 → #02 → #03

---

## 🚀 Plan d'Exécution Global

### Phase 1 : PR #01 (1 jour)
1. Créer branche `refactor/demandes-extract-domain-logic-final`
2. Nettoyer `DemandView.tsx`
3. Ajouter tests E2E
4. Ajouter Storybook stories
5. Valider et merger

### Phase 2 : PR #02 (3 jours)
1. Créer branche `perf/virtualize-lists-server-pagination`
2. Créer `TableVirtual` component
3. Adapter 4 pages listes
4. Tests performance
5. Valider et merger

### Phase 3 : PR #03 (2 jours)
1. Créer branche `test/domain-services-coverage-70`
2. Compléter tests demandes
3. Ajouter tests analytics
4. Ajouter tests services critiques
5. Activer CI gating
6. Valider et merger

**Total**: 6 jours (48 J/H)

