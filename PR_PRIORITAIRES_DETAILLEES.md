# 🚀 PRs Prioritaires - Plan d'Exécution Complet

**Date**: 2026-01-23  
**Branch Snapshot**: `wip/cursor-scan-2026-01-23`  
**Tag**: `pre-cursor-refactor`  
**Statut**: ✅ Scan projet complété

---

## 📊 Résultats du Scan

### Inventaire Général
- **Pages Next.js**: 113+ pages
- **Composants**: ~1200 composants
- **Services**: 61 services
- **Stores Zustand**: 66 stores
- **Tests Unitaires**: 225 fichiers de tests identifiés
- **Couverture Domain**: ~5% (estimé)

### Dettes Techniques Identifiées

#### 🔴 CRITIQUE (Score Métier: 9-10/10)
1. **Logique métier dans composants UI** - 8 domaines affectés
2. **Absence de virtualisation** - Listes >100 items non virtualisées
3. **Couverture tests domain <10%** - Risque régression élevé

#### 🟠 HAUTE (Score Métier: 7-8/10)
4. **Pas de support offline structuré** - Blocage usage terrain
5. **Instrumentation manquante** - Pas de tracking actions métier
6. **OpenAPI specs incomplètes** - Services non typés

#### 🟡 MOYENNE (Score Métier: 5-6/10)
7. **Duplication code** - Logique métier répétée
8. **Performance non optimisée** - Re-renders inutiles

---

## 📋 PR #01 : Refactor - Extraction Logique Métier Demandes

### Métadonnées
- **Titre PR**: `refactor/demandes-extract-domain-logic`
- **Type**: Refactoring
- **Priorité**: 🔴 CRITIQUE
- **Score Métier**: 10/10
- **Estimation**: 32 J/H (4 jours)
- **Impact**: ⭐⭐⭐⭐⭐ (Très Élevé)
- **Risque**: Moyen (refactoring structurel)

### Description Métier (Pour PO)

**Contexte**: Le module Demandes RH contient ~15 composants qui mélangent logique métier (règles de validation, calculs de priorité, règles d'approbation) avec la présentation UI. Cela rend le code difficile à tester, maintenir et réutiliser.

**Problème Métier**:
- **Maintenance coûteuse** : Changement de règle métier nécessite modification de plusieurs composants
- **Risque d'erreurs** : Logique dupliquée dans plusieurs endroits
- **Tests difficiles** : Impossible de tester règles métier isolément
- **Réutilisabilité faible** : Logique métier non réutilisable dans autres contextes

**Solution Proposée**:
Extraire toute la logique métier dans un module `src/domain/demandes/` avec :
- Services métier (validation, priorité, approbation, budget)
- Règles métier (business rules)
- Types domain (entities, value objects)
- Tests unitaires complets

**Bénéfices Métier**:
- ✅ **Maintenabilité** : Changements règles métier centralisés
- ✅ **Qualité** : Tests unitaires possibles
- ✅ **Réutilisabilité** : Logique réutilisable partout
- ✅ **Documentation** : Code auto-documenté

### Plan Technique Pas à Pas

#### Étape 1 : Créer Structure Domain (2J/H)
**Fichiers à créer**:
```
src/domain/demandes/
├── entities/
│   ├── Demande.entity.ts
│   ├── DemandeStatus.entity.ts
│   └── DemandePriority.entity.ts
├── services/
│   ├── DemandeValidation.service.ts
│   ├── DemandePriority.service.ts
│   ├── DemandeApproval.service.ts
│   ├── DemandeBudget.service.ts
│   └── DemandeRisk.service.ts
├── rules/
│   ├── validation.rules.ts
│   ├── approval.rules.ts
│   └── priority.rules.ts
├── types/
│   └── demande.types.ts
└── __tests__/
    ├── validation.rules.test.ts
    ├── approval.rules.test.ts
    └── priority.rules.test.ts
```

**Actions**:
1. Créer structure de dossiers
2. Définir interfaces/types de base
3. Extraire types depuis composants existants

#### Étape 2 : Extraire Services Validation (6J/H)
**Fichiers sources à analyser**:
- `src/components/features/bmo/demandes/command-center/views/DemandesPendingView.tsx`
- `src/components/features/bmo/demandes/command-center/views/DemandesUrgentView.tsx`
- `src/components/features/bmo/demandes/command-center/views/DemandesValidatedView.tsx`
- `src/components/features/bmo/workspace/views/DemandView.tsx`

**Fichier cible**: `src/domain/demandes/services/DemandeValidation.service.ts`

**Logique à extraire**:
```typescript
// Exemple de logique à extraire
function validateDemande(demande: Demande): ValidationResult {
  // Règles de validation actuellement dans les composants
  // - Vérification montant vs budget
  // - Vérification délais SLA
  // - Vérification documents requis
  // - Vérification approbateurs
}
```

**Actions**:
1. Identifier toutes les règles de validation dans les composants
2. Extraire dans service avec tests
3. Remplacer dans composants par appels au service

#### Étape 3 : Extraire Services Priorité (4J/H)
**Fichier cible**: `src/domain/demandes/services/DemandePriority.service.ts`

**Logique à extraire**:
```typescript
function calculatePriority(demande: Demande, context: PriorityContext): Priority {
  // Calcul de priorité basé sur:
  // - Délai SLA
  // - Montant
  // - Type de demande
  // - Bureau concerné
  // - Impact métier
}
```

#### Étape 4 : Extraire Services Approbation (6J/H)
**Fichier cible**: `src/domain/demandes/services/DemandeApproval.service.ts`

**Logique à extraire**:
- Règles d'approbation (qui peut approuver)
- Workflow d'approbation
- Délégation d'approbation
- Escalade automatique

#### Étape 5 : Extraire Services Budget (4J/H)
**Fichier cible**: `src/domain/demandes/services/DemandeBudget.service.ts`

**Logique à extraire**:
- Vérification budget disponible
- Calcul impact budget
- Alertes budget

#### Étape 6 : Extraire Services Risque (4J/H)
**Fichier cible**: `src/domain/demandes/services/DemandeRisk.service.ts`

**Logique à extraire**:
- Calcul niveau de risque
- Détection risques critiques
- Recommandations mitigation

#### Étape 7 : Refactoriser Composants (6J/H)
**Fichiers à modifier**:
- Tous les composants dans `src/components/features/bmo/demandes/`
- Remplacer logique inline par appels aux services domain

**Pattern à appliquer**:
```typescript
// Avant
const filteredDemandes = useMemo(() => {
  // Logique métier inline
  return demandes.filter(d => {
    if (d.amount > budget) return false;
    if (d.delay > 5) return true;
    // ...
  });
}, [demandes]);

// Après
const { validateDemande, calculatePriority } = useDemandeDomain();
const filteredDemandes = useMemo(() => {
  return demandes
    .filter(d => validateDemande(d).isValid)
    .map(d => ({ ...d, priority: calculatePriority(d) }));
}, [demandes, validateDemande, calculatePriority]);
```

### Fichiers Modifiés Attendus

**Nouveaux fichiers** (15 fichiers):
- `src/domain/demandes/entities/*.ts` (3 fichiers)
- `src/domain/demandes/services/*.service.ts` (5 fichiers)
- `src/domain/demandes/rules/*.rules.ts` (3 fichiers)
- `src/domain/demandes/types/demande.types.ts` (1 fichier)
- `src/domain/demandes/__tests__/*.test.ts` (3 fichiers)

**Fichiers modifiés** (12 fichiers):
- `src/components/features/bmo/demandes/command-center/views/DemandesPendingView.tsx`
- `src/components/features/bmo/demandes/command-center/views/DemandesUrgentView.tsx`
- `src/components/features/bmo/demandes/command-center/views/DemandesValidatedView.tsx`
- `src/components/features/bmo/demandes/command-center/views/DemandesOverdueView.tsx`
- `src/components/features/bmo/demandes/command-center/views/DemandesRejectedView.tsx`
- `src/components/features/bmo/workspace/views/DemandView.tsx`
- `src/components/features/bmo/demandes/DemandDetailsModal.tsx`
- `src/modules/demandes/pages/overview/DemandesOverviewView.tsx`
- `src/modules/demandes/components/DemandesContentRouter.tsx`
- `src/lib/services/demandesApiService.ts` (adapter pour utiliser domain)
- `src/lib/stores/demandesCommandCenterStore.ts` (adapter pour utiliser domain)
- `src/hooks/useDemandes.ts` (adapter pour utiliser domain)

### Tests Unitaires

**Fichiers de tests à créer** (8 fichiers):
```typescript
// src/domain/demandes/__tests__/validation.rules.test.ts
describe('DemandeValidation', () => {
  it('should validate demande with valid data', () => {});
  it('should reject demande exceeding budget', () => {});
  it('should reject demande missing required documents', () => {});
  it('should validate demande within SLA', () => {});
});

// src/domain/demandes/__tests__/approval.rules.test.ts
describe('DemandeApproval', () => {
  it('should determine correct approvers based on amount', () => {});
  it('should escalate if approver unavailable', () => {});
  it('should handle delegation correctly', () => {});
});

// src/domain/demandes/__tests__/priority.service.test.ts
describe('DemandePriority', () => {
  it('should calculate high priority for overdue demandes', () => {});
  it('should calculate medium priority for normal demandes', () => {});
  it('should consider amount in priority calculation', () => {});
});
```

**Couverture cible**: ≥70% pour services domain

### Tests E2E

**Fichier**: `e2e/demandes/domain-logic.spec.ts`

```typescript
test('demandes validation workflow', async ({ page }) => {
  // 1. Créer demande valide → doit passer validation
  // 2. Créer demande dépassant budget → doit être rejetée
  // 3. Vérifier priorité calculée correctement
  // 4. Vérifier approbateurs déterminés correctement
});
```

### Storybook Stories

**Fichier**: `src/domain/demandes/__stories__/DemandeServices.stories.tsx`

```typescript
export default {
  title: 'Domain/Demandes/Services',
  component: DemandeValidationService,
};

export const ValidationRules = () => {
  // Story montrant les différentes règles de validation
};

export const PriorityCalculation = () => {
  // Story montrant le calcul de priorité
};
```

### Estimation Effort

| Tâche | J/H | Dépendances |
|-------|-----|-------------|
| Structure domain | 2 | - |
| Service Validation | 6 | Structure |
| Service Priorité | 4 | Structure |
| Service Approbation | 6 | Structure, Validation |
| Service Budget | 4 | Structure |
| Service Risque | 4 | Structure |
| Refactor Composants | 6 | Tous services |
| **TOTAL** | **32** | |

### Checklist QA

- [ ] ✅ Lint/Typecheck OK (`npm run lint && npm run typecheck`)
- [ ] ✅ Tests unitaires passent (`npm test -- domain/demandes`)
- [ ] ✅ Couverture domain ≥70% (`npm test -- --coverage`)
- [ ] ✅ Tests E2E passent (`npm run test:e2e -- demandes`)
- [ ] ✅ Storybook build OK (`npm run build-storybook`)
- [ ] ✅ Performance non dégradée (Lighthouse score ≥90)
- [ ] ✅ Aucune régression fonctionnelle
- [ ] ✅ Code review approuvé

### Rollback Plan

**Si problème critique**:
1. Revert commit PR: `git revert <commit-hash>`
2. Restaurer depuis tag: `git checkout pre-cursor-refactor`
3. Re-créer branche depuis main si nécessaire

**Fichiers critiques à sauvegarder avant merge**:
- `src/components/features/bmo/demandes/**/*.tsx` (backup complet)
- `src/lib/services/demandesApiService.ts`

---

## 📋 PR #02 : Feat - Virtualisation Tables/Listes

### Métadonnées
- **Titre PR**: `feat/table-virtualization`
- **Type**: Feature (Performance)
- **Priorité**: 🔴 CRITIQUE
- **Score Métier**: 9/10
- **Estimation**: 28 J/H (3.5 jours)
- **Impact**: ⭐⭐⭐⭐⭐ (Très Élevé)
- **Risque**: Faible (amélioration progressive)

### Description Métier (Pour PO)

**Contexte**: Les listes de demandes, chantiers, alertes, etc. peuvent contenir 1000+ éléments. Actuellement, tous les éléments sont rendus en même temps, causant des problèmes de performance majeurs.

**Problème Métier**:
- **Lenteur inacceptable** : Listes >100 items très lentes au chargement
- **Inutilisable sur mobile/tablette** : Blocage usage terrain
- **Consommation mémoire excessive** : Tous les éléments en mémoire
- **Expérience utilisateur dégradée** : Lag lors du scroll, freeze UI

**Solution Proposée**:
Virtualiser toutes les listes >50 items avec `@tanstack/react-virtual` (déjà dans dépendances) :
- Rendu uniquement des items visibles (~20 items)
- Scroll fluide même avec 10K+ items
- Réduction mémoire de ~80%

**Bénéfices Métier**:
- ✅ **Performance** : Rendu instantané même avec 1000+ items
- ✅ **Mobile** : Utilisable sur tablette terrain
- ✅ **UX** : Scroll fluide, pas de lag
- ✅ **Mémoire** : Consommation réduite de 80%

### Plan Technique Pas à Pas

#### Étape 1 : Créer Composant TableVirtual Réutilisable (8J/H)
**Fichier à créer**: `src/components/ui/TableVirtual.tsx`

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';

interface TableVirtualProps<T> {
  queryKey: string[];
  queryFn: (page: number, filters: Record<string, any>) => Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  columns: ColumnDef<T>[];
  filters?: Record<string, any>;
  estimateRowHeight?: number;
  containerHeight?: number;
}

export const TableVirtual = memo(function TableVirtual<T>({
  queryKey,
  queryFn,
  columns,
  filters = {},
  estimateRowHeight = 60,
  containerHeight = 600,
}: TableVirtualProps<T>) {
  // Virtual scrolling + server pagination
  // Debounced filters
  // Loading states
  // Empty states
});
```

**Fonctionnalités**:
- Virtual scrolling avec `@tanstack/react-virtual`
- Server-side pagination
- Debounce sur filtres (300ms)
- Loading skeletons
- Empty states
- Keyboard navigation
- Accessibility (ARIA)

#### Étape 2 : Adapter Pages Listes Demandes (8J/H)
**Fichiers à modifier**:
1. `src/components/features/bmo/demandes/command-center/views/DemandesPendingView.tsx`
2. `src/components/features/bmo/demandes/command-center/views/DemandesUrgentView.tsx`
3. `src/components/features/bmo/demandes/command-center/views/DemandesValidatedView.tsx`
4. `src/components/features/bmo/demandes/command-center/views/DemandesOverdueView.tsx`
5. `src/components/features/bmo/demandes/command-center/views/DemandesRejectedView.tsx`

**Pattern à appliquer**:
```typescript
// Avant
{filteredDemandes.map(demande => (
  <DemandeCard key={demande.id} demande={demande} />
))}

// Après
<TableVirtual
  queryKey={['demandes', 'pending', filters]}
  queryFn={(page, filters) => fetchDemandes({ page, filters })}
  columns={demandeColumns}
  filters={filters}
  estimateRowHeight={120}
  containerHeight={600}
/>
```

#### Étape 3 : Adapter Pages Listes Chantiers (4J/H)
**Fichiers à modifier**:
- `src/components/features/bmo/chantiers/views/ChantiersListView.tsx`
- `src/modules/projets/pages/overview/ProjetsOverviewView.tsx`

#### Étape 4 : Adapter Pages Listes Alertes (4J/H)
**Fichiers à modifier**:
- `src/modules/centre-alertes/pages/overview/AlertesOverviewView.tsx`
- `src/components/features/bmo/governance/workspace/views/AlertsInboxView.tsx`

#### Étape 5 : Adapter Pages Listes Blocked (4J/H)
**Fichiers à modifier**:
- `src/modules/blocked/pages/overview/BlockedOverviewView.tsx`
- `src/components/features/bmo/workspace/blocked/command-center/BlockedContentRouter.tsx`

### Fichiers Modifiés Attendus

**Nouveaux fichiers** (3 fichiers):
- `src/components/ui/TableVirtual.tsx`
- `src/components/ui/TableVirtual.test.tsx`
- `src/components/ui/TableVirtual.stories.tsx`

**Fichiers modifiés** (12 fichiers):
- Toutes les vues de listes dans `src/components/features/bmo/demandes/`
- Vues chantiers
- Vues alertes
- Vues blocked

### Tests Unitaires

**Fichier**: `src/components/ui/__tests__/TableVirtual.test.tsx`

```typescript
describe('TableVirtual', () => {
  it('should render only visible rows', () => {});
  it('should handle server pagination', () => {});
  it('should debounce filter changes', () => {});
  it('should handle empty state', () => {});
  it('should handle loading state', () => {});
  it('should support keyboard navigation', () => {});
});
```

### Tests E2E

**Fichier**: `e2e/performance/virtualization.spec.ts`

```typescript
test('virtualized list performance with 1000 items', async ({ page }) => {
  // 1. Charger liste avec 1000 items
  // 2. Vérifier que seulement ~20 items sont rendus
  // 3. Vérifier scroll fluide
  // 4. Mesurer mémoire utilisée
  // 5. Vérifier temps de rendu <100ms
});
```

### Storybook Stories

**Fichier**: `src/components/ui/__stories__/TableVirtual.stories.tsx`

```typescript
export default {
  title: 'UI/TableVirtual',
  component: TableVirtual,
};

export const With1000Items = () => {
  // Story avec 1000 items
};

export const WithServerPagination = () => {
  // Story avec pagination serveur
};

export const WithFilters = () => {
  // Story avec filtres
};
```

### Estimation Effort

| Tâche | J/H | Dépendances |
|-------|-----|-------------|
| Composant TableVirtual | 8 | - |
| Adapter Demandes | 8 | TableVirtual |
| Adapter Chantiers | 4 | TableVirtual |
| Adapter Alertes | 4 | TableVirtual |
| Adapter Blocked | 4 | TableVirtual |
| **TOTAL** | **28** | |

### Checklist QA

- [ ] ✅ Lint/Typecheck OK
- [ ] ✅ Tests unitaires passent
- [ ] ✅ Tests E2E performance passent
- [ ] ✅ Storybook build OK
- [ ] ✅ Performance améliorée (Lighthouse +20 points)
- [ ] ✅ Mémoire réduite de ≥70%
- [ ] ✅ Scroll fluide avec 1000+ items
- [ ] ✅ Mobile responsive OK

### Rollback Plan

**Si problème**:
1. Revert commit PR
2. Les composants existants fonctionnent toujours (pas de breaking change)

---

## 📋 PR #03 : Test - Couverture Domain ≥70%

### Métadonnées
- **Titre PR**: `test/domain-coverage`
- **Type**: Test
- **Priorité**: 🔴 CRITIQUE
- **Score Métier**: 8/10
- **Estimation**: 24 J/H (3 jours)
- **Impact**: ⭐⭐⭐⭐ (Élevé)
- **Risque**: Faible (ajout de tests uniquement)

### Description Métier (Pour PO)

**Contexte**: La couverture de tests pour la logique métier est actuellement <10%. Cela représente un risque élevé de régression lors de changements futurs.

**Problème Métier**:
- **Risque de bugs** : Changements peuvent casser fonctionnalités existantes
- **Confiance faible** : Impossible de refactorer sereinement
- **Dette technique** : Accumulation de code non testé
- **Coût maintenance** : Bugs découverts en production

**Solution Proposée**:
Augmenter couverture tests domain à ≥70% en créant tests unitaires pour :
- Services domain (validation, priorité, approbation, budget, risque)
- Règles métier (business rules)
- Utilitaires domain

**Bénéfices Métier**:
- ✅ **Confiance** : Refactoring possible sans crainte
- ✅ **Qualité** : Bugs détectés avant production
- ✅ **Documentation** : Tests servent de documentation
- ✅ **Vélocité** : Développement plus rapide (moins de bugs)

### Plan Technique Pas à Pas

#### Étape 1 : Tests Services Demandes (8J/H)
**Fichiers à créer**:
- `src/domain/demandes/__tests__/validation.service.test.ts`
- `src/domain/demandes/__tests__/priority.service.test.ts`
- `src/domain/demandes/__tests__/approval.service.test.ts`
- `src/domain/demandes/__tests__/budget.service.test.ts`
- `src/domain/demandes/__tests__/risk.service.test.ts`

**Couverture cible**: ≥80% par service

#### Étape 2 : Tests Services Chantiers (6J/H)
**Fichiers à créer**:
- `src/domain/chantiers/__tests__/chantier.service.test.ts`
- `src/domain/chantiers/__tests__/lot.service.test.ts`
- `src/domain/chantiers/__tests__/avancement.service.test.ts`

#### Étape 3 : Tests Services Validation-BC (6J/H)
**Fichiers à créer**:
- `src/domain/validation-bc/__tests__/validation.service.test.ts`
- `src/domain/validation-bc/__tests__/anomalies.service.test.ts`

#### Étape 4 : Tests E2E Domain (4J/H)
**Fichiers à créer**:
- `e2e/domain/demandes-workflow.spec.ts`
- `e2e/domain/chantiers-workflow.spec.ts`

### Fichiers Modifiés Attendus

**Nouveaux fichiers** (15 fichiers de tests):
- Tests unitaires domain (12 fichiers)
- Tests E2E domain (3 fichiers)

**Fichiers modifiés** (2 fichiers):
- `jest.config.js` (ajouter coverage thresholds)
- `package.json` (scripts coverage)

### Tests Unitaires

**Structure des tests**:
```typescript
describe('DemandeValidationService', () => {
  describe('validateDemande', () => {
    it('should validate demande with valid data', () => {});
    it('should reject demande exceeding budget', () => {});
    it('should reject demande missing documents', () => {});
    it('should validate demande within SLA', () => {});
    it('should handle edge cases', () => {});
  });
  
  describe('validateDocuments', () => {
    it('should validate required documents present', () => {});
    it('should validate document formats', () => {});
  });
});
```

**Couverture cible**: ≥70% global, ≥80% pour services critiques

### Tests E2E

**Fichiers**:
- `e2e/domain/demandes-workflow.spec.ts`
- `e2e/domain/chantiers-workflow.spec.ts`
- `e2e/domain/validation-bc-workflow.spec.ts`

**Scénarios**:
- Workflow complet création → validation → approbation
- Règles métier appliquées correctement
- Edge cases et erreurs

### Estimation Effort

| Tâche | J/H | Dépendances |
|-------|-----|-------------|
| Tests Demandes | 8 | PR #01 (si disponible) |
| Tests Chantiers | 6 | - |
| Tests Validation-BC | 6 | - |
| Tests E2E | 4 | - |
| **TOTAL** | **24** | |

### Checklist QA

- [ ] ✅ Lint/Typecheck OK
- [ ] ✅ Tous tests passent (`npm test`)
- [ ] ✅ Couverture domain ≥70% (`npm test -- --coverage`)
- [ ] ✅ Tests E2E passent
- [ ] ✅ CI passe avec nouveaux tests
- [ ] ✅ Pas de régression

### Rollback Plan

**Si problème**:
- Tests peuvent être désactivés temporairement
- Pas d'impact sur code de production

---

## 🎯 Ordre d'Exécution Recommandé

1. **PR #01** (Refactor Domain) - Base pour les autres
2. **PR #03** (Tests) - Peut être fait en parallèle de PR #01
3. **PR #02** (Virtualization) - Indépendant, peut être fait en parallèle

---

## 📊 Métriques de Succès

### Avant Refactoring
- Couverture domain: ~5%
- Logique métier: Dans composants UI
- Performance listes: Lag avec >100 items
- Tests unitaires domain: 0

### Après Refactoring (Cible)
- Couverture domain: ≥70%
- Logique métier: Dans `src/domain/`
- Performance listes: Fluide avec 10K+ items
- Tests unitaires domain: ≥15 fichiers

---

## 🚀 Commandes Git

### Créer Branches et PRs

```bash
# PR #01
git checkout -b refactor/demandes-extract-domain-logic
# ... faire modifications ...
git add .
git commit -m "refactor(demandes): extract domain logic to src/domain/demandes"
git push origin refactor/demandes-extract-domain-logic
# Créer PR via GitHub CLI ou interface

# PR #02
git checkout -b feat/table-virtualization
# ... faire modifications ...
git add .
git commit -m "feat(ui): add TableVirtual component with server pagination"
git push origin feat/table-virtualization

# PR #03
git checkout -b test/domain-coverage
# ... faire modifications ...
git add .
git commit -m "test(domain): increase coverage to ≥70%"
git push origin test/domain-coverage
```

---

**Date de création**: 2026-01-23  
**Auteur**: Cursor AI Assistant  
**Statut**: ✅ Prêt pour exécution

