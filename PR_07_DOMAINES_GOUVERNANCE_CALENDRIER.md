# PR #07: Refactor Architecture - Domaines Gouvernance & Calendrier

**Branch**: `refactor/domain-gouvernance-calendrier`  
**Priorité**: 🔴 **CRITIQUE**  
**Estimation**: 40 J/H (5 jours)  
**Statut**: 🚧 À implémenter

---

## 🎯 Contexte Métier

Extraction de toute la logique métier gouvernance et calendrier vers des domaines isolés, suivant le pattern établi avec `src/domain/demandes/`.

**Bénéfices métier**:
- Testabilité de la logique métier
- Réutilisabilité des services
- Support offline possible
- Maintenance facilitée
- Cohérence architecturale

---

## 📋 Plan Technique Détaillé

### Phase 1: Créer Structure Domain Gouvernance (12 J/H)

#### 1.1 Types (2 J/H)

**Fichiers à créer**:
```
src/domain/gouvernance/types/
  ├── gouvernance.types.ts      # Types principaux
  ├── projet.types.ts            # Types projets
  ├── budget.types.ts            # Types budget
  ├── jalon.types.ts            # Types jalons
  ├── risque.types.ts           # Types risques
  └── validation.types.ts       # Types validations
```

**Exemple** (`gouvernance.types.ts`):
```typescript
export interface GouvernanceOverview {
  projets_actifs: number;
  budget_consomme_pourcent: number;
  jalons_retard: number;
  risques_critiques: number;
  validations_en_attente: number;
}

export interface GouvernanceStats {
  total_projets: number;
  projets_en_retard: number;
  budget_total: number;
  budget_consomme: number;
  // ...
}

export interface TendanceMensuelle {
  mois: string;
  projets: number;
  budget: number;
  jalons: number;
  risques: number;
}
```

#### 1.2 Services (6 J/H)

**Fichiers à créer**:
```
src/domain/gouvernance/services/
  ├── gouvernance.service.ts    # Service principal
  ├── projet.service.ts          # Service projets
  ├── budget.service.ts          # Service budget
  ├── jalon.service.ts           # Service jalons
  ├── risque.service.ts          # Service risques
  └── validation.service.ts      # Service validations
```

**Exemple** (`gouvernance.service.ts`):
```typescript
import type { GouvernanceOverview, GouvernanceStats } from '../types/gouvernance.types';

export class GouvernanceService {
  /**
   * Calcule la vue d'ensemble de la gouvernance
   */
  static calculateOverview(data: {
    projets: Projet[];
    budgets: Budget[];
    jalons: Jalon[];
    risques: Risque[];
    validations: Validation[];
  }): GouvernanceOverview {
    return {
      projets_actifs: data.projets.filter(p => p.status === 'active').length,
      budget_consomme_pourcent: BudgetService.calculateConsumption(data.budgets),
      jalons_retard: data.jalons.filter(j => j.isOverdue).length,
      risques_critiques: data.risques.filter(r => r.severity === 'critical').length,
      validations_en_attente: data.validations.filter(v => v.status === 'pending').length,
    };
  }

  /**
   * Calcule les statistiques globales
   */
  static calculateStats(data: {
    projets: Projet[];
    budgets: Budget[];
    // ...
  }): GouvernanceStats {
    // Logique de calcul
  }
}
```

#### 1.3 Rules (2 J/H)

**Fichiers à créer**:
```
src/domain/gouvernance/rules/
  ├── validation.rules.ts        # Règles validation
  ├── budget.rules.ts            # Règles budget
  └── escalade.rules.ts           # Règles escalade
```

#### 1.4 Hook React (2 J/H)

**Fichier à créer**: `src/hooks/useGouvernanceService.ts`

```typescript
import { useMemo } from 'react';
import { GouvernanceService } from '@/domain/gouvernance/services/gouvernance.service';
import type { GouvernanceData } from '@/domain/gouvernance/types/gouvernance.types';

export function useGouvernanceService(data: GouvernanceData | null) {
  const overview = useMemo(() => {
    if (!data) return null;
    return GouvernanceService.calculateOverview(data);
  }, [data]);

  const stats = useMemo(() => {
    if (!data) return null;
    return GouvernanceService.calculateStats(data);
  }, [data]);

  // ...

  return {
    overview,
    stats,
    // ...
  };
}
```

### Phase 2: Créer Structure Domain Calendrier (12 J/H)

**Même structure que gouvernance**:
- Types (2 J/H)
- Services (6 J/H) - SLA, conflits, récurrence, permissions
- Rules (2 J/H)
- Hook (2 J/H)

### Phase 3: Refactorer Composants UI (12 J/H)

#### 3.1 Refactorer `governance/page.tsx` (6 J/H)

**Avant**: 726 lignes avec logique métier  
**Après**: Composant UI pur utilisant `useGouvernanceService`

**Changements**:
- Extraire calculs vers services
- Utiliser hook `useGouvernanceService`
- Nettoyer composant (objectif: <300 lignes)

#### 3.2 Refactorer `calendrier/page.tsx` (6 J/H)

**Avant**: 4361 lignes avec logique métier  
**Après**: Composant UI pur utilisant `useCalendrierService`

**Changements**:
- Extraire calculs SLA vers service
- Extraire détection conflits vers service
- Extraire logique récurrence vers service
- Utiliser hook `useCalendrierService`
- Découper en sous-composants (objectif: <500 lignes par composant)

### Phase 4: Tests Unitaires (4 J/H)

**Fichiers à créer**:
```
src/domain/gouvernance/__tests__/
  ├── gouvernance.service.test.ts
  ├── projet.service.test.ts
  ├── budget.service.test.ts
  └── ...

src/domain/calendrier/__tests__/
  ├── calendrier.service.test.ts
  ├── sla.service.test.ts
  ├── conflit.service.test.ts
  └── ...
```

**Objectif**: Coverage 70%+ pour domaines

---

## 📁 Fichiers Créés/Modifiés

### Créés (~25 fichiers)

**Domain Gouvernance**:
- `src/domain/gouvernance/types/*.ts` (6 fichiers)
- `src/domain/gouvernance/services/*.ts` (6 fichiers)
- `src/domain/gouvernance/rules/*.ts` (3 fichiers)
- `src/domain/gouvernance/__tests__/*.test.ts` (6 fichiers)

**Domain Calendrier**:
- `src/domain/calendrier/types/*.ts` (4 fichiers)
- `src/domain/calendrier/services/*.ts` (5 fichiers)
- `src/domain/calendrier/rules/*.ts` (2 fichiers)
- `src/domain/calendrier/__tests__/*.test.ts` (5 fichiers)

**Hooks**:
- `src/hooks/useGouvernanceService.ts`
- `src/hooks/useCalendrierService.ts`

### Modifiés

- `app/(portals)/maitre-ouvrage/governance/page.tsx`
- `app/(portals)/maitre-ouvrage/calendrier/page.tsx`

---

## 🧪 Tests Requis

### Tests Unitaires

- [ ] `GouvernanceService.calculateOverview` - 5 tests
- [ ] `GouvernanceService.calculateStats` - 5 tests
- [ ] `ProjetService.*` - 10 tests
- [ ] `BudgetService.*` - 10 tests
- [ ] `CalendrierService.*` - 10 tests
- [ ] `SLAService.*` - 10 tests
- [ ] `ConflitService.*` - 10 tests

**Total**: ~60 tests unitaires

### Tests E2E

- [ ] Workflow gouvernance complète
- [ ] Workflow calendrier complète

---

## ✅ Checklist QA

### Fonctionnel
- [ ] Services créés et fonctionnels
- [ ] Hooks créés et fonctionnels
- [ ] Composants refactorés
- [ ] UI identique (pas de régression visuelle)
- [ ] Calculs identiques à avant

### Technique
- [ ] Tous les tests unitaires passent
- [ ] Coverage domain ≥70%
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint
- [ ] Performance identique ou meilleure

### Métier
- [ ] Règles métier respectées
- [ ] Calculs exacts
- [ ] Gestion des erreurs conforme

---

## 📊 Métriques Avant/Après

| Métrique | Avant | Après (Cible) |
|----------|-------|---------------|
| Lignes logique métier dans UI | ~2000 | <100 |
| Services réutilisables | 4 | 15+ |
| Domaines isolés | 2/5 | 5/5 |
| Coverage domain | ~70% | 80% |
| Complexité cyclomatique | ~25 | <15 |

---

## 🚀 Plan de Rollback

Si problèmes critiques:
1. Revert commit PR
2. Restaurer composants depuis backup
3. Vérifier non-régression

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 Prêt pour implémentation
