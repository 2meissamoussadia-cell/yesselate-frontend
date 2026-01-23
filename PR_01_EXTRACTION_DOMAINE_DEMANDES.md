# PR #01 : Extraction Domaine Demandes - Séparation UI/Domain

## 📋 Métadonnées

- **Titre PR**: `refactor/demandes-extract-domain-logic`
- **Type**: Refactoring
- **Priorité**: 🔴 CRITIQUE
- **Estimation**: 40 J/H (5 jours)
- **Impact**: ⭐⭐⭐⭐⭐ (Très élevé)
- **Risque**: Moyen (avec tests)

---

## 🎯 Description Métier (Pour PO)

### Contexte
Le module **Demandes** contient actuellement toute la logique métier (calculs de budget, risques, priorités, actions) directement dans les composants React. Cela rend le code difficile à tester, réutiliser et maintenir.

### Problème Métier
- **Impossibilité de tester** les règles métier sans renderer des composants
- **Duplication** de logique entre composants similaires
- **Risque de bugs** lors de modifications (pas de tests unitaires)
- **Difficulté d'évolution** : ajout de nouvelles règles métier complexe

### Solution Proposée
Extraire toute la logique métier vers une couche `domain/demandes/` avec :
- **Services** pour les opérations métier (calculs, validations)
- **Rules** pour les règles métier (priorités, seuils)
- **Types** pour les entités métier
- **Tests unitaires** pour garantir la non-régression

### Bénéfices Métier
- ✅ **Fiabilité** : Tests automatisés des règles métier
- ✅ **Maintenabilité** : Logique centralisée, facile à modifier
- ✅ **Réutilisabilité** : Services utilisables dans plusieurs composants
- ✅ **Traçabilité** : Historique des règles métier versionnées

---

## 🔧 Plan Technique Étape par Étape

### Étape 1 : Créer la structure du domaine (2J/H)

```typescript
src/domain/demandes/
  ├── types/
  │   ├── demande.types.ts          # Types métier
  │   ├── budget.types.ts          # Types budget
  │   └── risk.types.ts            # Types risques
  ├── services/
  │   ├── demande.service.ts       # Service principal
  │   ├── budget.service.ts       # Calculs budget
  │   ├── risk.service.ts          # Calculs risques
  │   └── priority.service.ts      # Calculs priorités
  ├── rules/
  │   ├── validation.rules.ts      # Règles de validation
  │   ├── approval.rules.ts        # Règles d'approbation
  │   └── escalation.rules.ts      # Règles d'escalade
  └── __tests__/
      ├── demande.service.test.ts
      ├── budget.service.test.ts
      └── risk.service.test.ts
```

**Fichiers créés**:
- `src/domain/demandes/types/demande.types.ts`
- `src/domain/demandes/types/budget.types.ts`
- `src/domain/demandes/types/risk.types.ts`
- `src/domain/demandes/services/demande.service.ts`
- `src/domain/demandes/services/budget.service.ts`
- `src/domain/demandes/services/risk.service.ts`
- `src/domain/demandes/services/priority.service.ts`
- `src/domain/demandes/rules/validation.rules.ts`
- `src/domain/demandes/rules/approval.rules.ts`
- `src/domain/demandes/rules/escalation.rules.ts`

### Étape 2 : Extraire les types métier (1J/H)

**Fichier source**: `src/components/features/bmo/workspace/views/DemandView.tsx`

**Extraction**:
```typescript
// src/domain/demandes/types/demande.types.ts
import { z } from 'zod';

export const DemandeStatusSchema = z.enum([
  'pending',
  'in_progress',
  'validated',
  'rejected',
  'cancelled'
]);

export const DemandePrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'urgent',
  'critical'
]);

export type DemandeStatus = z.infer<typeof DemandeStatusSchema>;
export type DemandePriority = z.infer<typeof DemandePrioritySchema>;

export interface Demande {
  id: string;
  title: string;
  description: string;
  amount: number;
  priority: DemandePriority;
  status: DemandeStatus;
  budget?: BudgetInfo;
  risks?: Risk[];
  // ... autres champs
}

export interface BudgetInfo {
  available: number;
  consumed: number;
  allocated: number;
}

export interface Risk {
  id: string;
  type: 'budget' | 'delay' | 'quality' | 'compliance';
  score: number; // 0-100
  description: string;
  mitigation?: string;
}
```

### Étape 3 : Extraire les services (10J/H)

#### 3.1 Service Budget (2J/H)

```typescript
// src/domain/demandes/services/budget.service.ts
import type { Demande, BudgetInfo } from '../types/demande.types';

export class BudgetService {
  /**
   * Calcule le pourcentage d'utilisation du budget
   */
  static calculateBudgetUsage(
    demande: Demande,
    budget: BudgetInfo
  ): number {
    if (!budget.available || budget.available === 0) return 0;
    return Math.round((demande.amount / budget.available) * 100);
  }

  /**
   * Vérifie si le budget est dépassé
   */
  static isBudgetExceeded(
    demande: Demande,
    budget: BudgetInfo
  ): boolean {
    return this.calculateBudgetUsage(demande, budget) > 100;
  }

  /**
   * Calcule le budget restant après allocation
   */
  static calculateRemainingBudget(
    budget: BudgetInfo,
    amount: number
  ): number {
    return budget.available - (budget.consumed + amount);
  }
}
```

**Tests**:
```typescript
// src/domain/demandes/__tests__/budget.service.test.ts
import { BudgetService } from '../services/budget.service';
import type { Demande, BudgetInfo } from '../types/demande.types';

describe('BudgetService', () => {
  describe('calculateBudgetUsage', () => {
    it('should return 0 if budget is 0', () => {
      const demande: Demande = { amount: 1000, ... };
      const budget: BudgetInfo = { available: 0, consumed: 0, allocated: 0 };
      expect(BudgetService.calculateBudgetUsage(demande, budget)).toBe(0);
    });

    it('should calculate correct percentage', () => {
      const demande: Demande = { amount: 50000, ... };
      const budget: BudgetInfo = { available: 100000, consumed: 0, allocated: 0 };
      expect(BudgetService.calculateBudgetUsage(demande, budget)).toBe(50);
    });
  });
});
```

#### 3.2 Service Risques (3J/H)

```typescript
// src/domain/demandes/services/risk.service.ts
import type { Demande, Risk } from '../types/demande.types';

export class RiskService {
  /**
   * Calcule le score de risque global
   */
  static calculateGlobalRiskScore(risks: Risk[]): number {
    if (!risks || risks.length === 0) return 0;
    return Math.max(...risks.map(r => r.score));
  }

  /**
   * Évalue les risques d'une demande
   */
  static evaluateRisks(demande: Demande): Risk[] {
    const risks: Risk[] = [];
    
    // Risque budget
    if (demande.budget) {
      const usage = BudgetService.calculateBudgetUsage(demande, demande.budget);
      if (usage > 90) {
        risks.push({
          id: 'budget-high',
          type: 'budget',
          score: 80,
          description: 'Budget presque épuisé',
          mitigation: 'Réviser le budget ou reporter la demande'
        });
      }
    }

    // Risque délai
    if (demande.deadline) {
      const daysUntilDeadline = this.calculateDaysUntil(demande.deadline);
      if (daysUntilDeadline < 7) {
        risks.push({
          id: 'delay-critical',
          type: 'delay',
          score: 90,
          description: 'Délai très court',
          mitigation: 'Accélérer le processus ou négocier un délai'
        });
      }
    }

    return risks;
  }

  private static calculateDaysUntil(deadline: Date): number {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
```

#### 3.3 Service Priorité (2J/H)

```typescript
// src/domain/demandes/services/priority.service.ts
import type { Demande, DemandePriority } from '../types/demande.types';
import { RiskService } from './risk.service';
import { BudgetService } from './budget.service';

export class PriorityService {
  /**
   * Calcule la priorité automatique d'une demande
   */
  static calculateAutoPriority(demande: Demande): DemandePriority {
    const risks = RiskService.evaluateRisks(demande);
    const globalRisk = RiskService.calculateGlobalRiskScore(risks);
    
    // Règles de priorité
    if (globalRisk >= 80) return 'critical';
    if (globalRisk >= 60) return 'urgent';
    if (demande.amount > 1000000) return 'high'; // > 1M FCFA
    if (demande.amount > 500000) return 'normal'; // > 500K FCFA
    return 'low';
  }

  /**
   * Vérifie si la priorité doit être escaladée
   */
  static shouldEscalate(demande: Demande): boolean {
    const risks = RiskService.evaluateRisks(demande);
    const globalRisk = RiskService.calculateGlobalRiskScore(risks);
    return globalRisk >= 70 || demande.amount > 5000000; // > 5M FCFA
  }
}
```

#### 3.4 Service Principal (3J/H)

```typescript
// src/domain/demandes/services/demande.service.ts
import type { Demande } from '../types/demande.types';
import { BudgetService } from './budget.service';
import { RiskService } from './risk.service';
import { PriorityService } from './priority.service';
import { ValidationRules } from '../rules/validation.rules';
import { ApprovalRules } from '../rules/approval.rules';

export class DemandeService {
  /**
   * Valide une demande selon les règles métier
   */
  static validate(demande: Demande): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation règles
    if (!ValidationRules.isTitleValid(demande.title)) {
      errors.push('Le titre est requis et doit faire au moins 10 caractères');
    }

    if (!ValidationRules.isAmountValid(demande.amount)) {
      errors.push('Le montant doit être positif');
    }

    // Warnings
    if (demande.budget) {
      const usage = BudgetService.calculateBudgetUsage(demande, demande.budget);
      if (usage > 80) {
        warnings.push('Budget presque épuisé');
      }
    }

    const risks = RiskService.evaluateRisks(demande);
    if (risks.length > 0) {
      warnings.push(`${risks.length} risque(s) détecté(s)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Détermine qui peut approuver la demande
   */
  static getApprover(demande: Demande): {
    level: 'auto' | 'manager' | 'direction' | 'comex';
    reason: string;
  } {
    return ApprovalRules.getApproverLevel(demande);
  }

  /**
   * Prépare une demande pour l'action
   */
  static prepareForAction(demande: Demande): Demande {
    // Évaluer les risques
    const risks = RiskService.evaluateRisks(demande);
    
    // Calculer la priorité auto si non définie
    const priority = demande.priority || 
      PriorityService.calculateAutoPriority(demande);

    return {
      ...demande,
      risks,
      priority
    };
  }
}
```

### Étape 4 : Extraire les règles métier (5J/H)

```typescript
// src/domain/demandes/rules/validation.rules.ts
import type { Demande } from '../types/demande.types';

export class ValidationRules {
  static isTitleValid(title: string): boolean {
    return title && title.trim().length >= 10;
  }

  static isAmountValid(amount: number): boolean {
    return amount > 0 && amount <= 100000000; // Max 100M FCFA
  }

  static isDescriptionValid(description: string): boolean {
    return description && description.trim().length >= 20;
  }
}
```

```typescript
// src/domain/demandes/rules/approval.rules.ts
import type { Demande } from '../types/demande.types';

export class ApprovalRules {
  private static readonly SEUIL_MANAGER = 500000; // 500K FCFA
  private static readonly SEUIL_DIRECTION = 5000000; // 5M FCFA
  private static readonly SEUIL_COMEX = 50000000; // 50M FCFA

  static getApproverLevel(demande: Demande): {
    level: 'auto' | 'manager' | 'direction' | 'comex';
    reason: string;
  } {
    const amount = demande.amount;

    if (amount < this.SEUIL_MANAGER) {
      return {
        level: 'auto',
        reason: `Montant < ${this.SEUIL_MANAGER.toLocaleString()} FCFA`
      };
    }

    if (amount < this.SEUIL_DIRECTION) {
      return {
        level: 'manager',
        reason: `Montant entre ${this.SEUIL_MANAGER.toLocaleString()} et ${this.SEUIL_DIRECTION.toLocaleString()} FCFA`
      };
    }

    if (amount < this.SEUIL_COMEX) {
      return {
        level: 'direction',
        reason: `Montant entre ${this.SEUIL_DIRECTION.toLocaleString()} et ${this.SEUIL_COMEX.toLocaleString()} FCFA`
      };
    }

    return {
      level: 'comex',
      reason: `Montant ≥ ${this.SEUIL_COMEX.toLocaleString()} FCFA`
    };
  }
}
```

### Étape 5 : Créer le hook `useDemandeService` (3J/H)

```typescript
// src/hooks/useDemandeService.ts
import { useMemo } from 'react';
import { DemandeService } from '@/domain/demandes/services/demande.service';
import type { Demande } from '@/domain/demandes/types/demande.types';

export function useDemandeService(demande: Demande | null) {
  const validation = useMemo(() => {
    if (!demande) return null;
    return DemandeService.validate(demande);
  }, [demande]);

  const approver = useMemo(() => {
    if (!demande) return null;
    return DemandeService.getApprover(demande);
  }, [demande]);

  const preparedDemande = useMemo(() => {
    if (!demande) return null;
    return DemandeService.prepareForAction(demande);
  }, [demande]);

  return {
    validation,
    approver,
    preparedDemande,
    // Actions
    validate: (d: Demande) => DemandeService.validate(d),
    getApprover: (d: Demande) => DemandeService.getApprover(d),
    prepareForAction: (d: Demande) => DemandeService.prepareForAction(d)
  };
}
```

### Étape 6 : Refactoriser `DemandView.tsx` (15J/H)

**Avant** (extrait):
```typescript
// ❌ AVANT - Logique dans composant
export function DemandView({ tab }: { tab: WorkspaceTab }) {
  const [data, setData] = useState<Demand | null>(null);
  
  // Calcul budget dans composant
  const budgetUsage = data?.budget?.available && data?.amount
    ? Math.round((data.amount / data.budget.available) * 100)
    : null;

  // Calcul risque dans composant
  const maxRiskScore = data?.risks?.length 
    ? Math.max(...data.risks.map(r => r.score))
    : 0;

  // Actions dans composant
  const handleAssign = async () => {
    // Logique métier ici...
  };
}
```

**Après** (extrait):
```typescript
// ✅ APRÈS - Logique extraite
import { useDemandeService } from '@/hooks/useDemandeService';
import { DemandeService } from '@/domain/demandes/services/demande.service';

export function DemandView({ tab }: { tab: WorkspaceTab }) {
  const [data, setData] = useState<Demande | null>(null);
  
  // Utiliser le service
  const demandeService = useDemandeService(data);
  const preparedDemande = demandeService.preparedDemande;

  // Calculs via service
  const budgetUsage = preparedDemande?.budget
    ? BudgetService.calculateBudgetUsage(preparedDemande, preparedDemande.budget)
    : null;

  const maxRiskScore = preparedDemande?.risks
    ? RiskService.calculateGlobalRiskScore(preparedDemande.risks)
    : 0;

  // Actions via service
  const handleAssign = async () => {
    if (!preparedDemande) return;
    
    const validation = DemandeService.validate(preparedDemande);
    if (!validation.valid) {
      // Afficher erreurs
      return;
    }

    // Appel API
    await assignDemande(preparedDemande.id, selectedEmployee);
  };
}
```

### Étape 7 : Tests Unitaires (5J/H)

**Fichiers de tests**:
- `src/domain/demandes/__tests__/budget.service.test.ts`
- `src/domain/demandes/__tests__/risk.service.test.ts`
- `src/domain/demandes/__tests__/priority.service.test.ts`
- `src/domain/demandes/__tests__/demande.service.test.ts`
- `src/domain/demandes/__tests__/validation.rules.test.ts`
- `src/domain/demandes/__tests__/approval.rules.test.ts`

**Couverture cible**: >80%

### Étape 8 : Tests E2E Playwright (2J/H)

```typescript
// e2e/demandes/demande-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Demande Workflow', () => {
  test('should calculate budget usage correctly', async ({ page }) => {
    await page.goto('/maitre-ouvrage/demandes');
    
    // Créer une demande
    await page.click('button:has-text("Nouvelle demande")');
    await page.fill('input[name="title"]', 'Test demande');
    await page.fill('input[name="amount"]', '50000');
    
    // Vérifier le calcul budget
    const budgetUsage = await page.textContent('[data-testid="budget-usage"]');
    expect(budgetUsage).toContain('50%');
  });

  test('should evaluate risks automatically', async ({ page }) => {
    await page.goto('/maitre-ouvrage/demandes');
    
    // Créer une demande avec montant élevé
    await page.click('button:has-text("Nouvelle demande")');
    await page.fill('input[name="amount"]', '6000000'); // > 5M
    
    // Vérifier que les risques sont détectés
    const risks = await page.locator('[data-testid="risk-item"]');
    await expect(risks).toHaveCount(1);
  });
});
```

---

## 📁 Fichiers Modifiés

### Fichiers Créés (15)
- `src/domain/demandes/types/demande.types.ts`
- `src/domain/demandes/types/budget.types.ts`
- `src/domain/demandes/types/risk.types.ts`
- `src/domain/demandes/services/demande.service.ts`
- `src/domain/demandes/services/budget.service.ts`
- `src/domain/demandes/services/risk.service.ts`
- `src/domain/demandes/services/priority.service.ts`
- `src/domain/demandes/rules/validation.rules.ts`
- `src/domain/demandes/rules/approval.rules.ts`
- `src/domain/demandes/rules/escalation.rules.ts`
- `src/domain/demandes/__tests__/budget.service.test.ts`
- `src/domain/demandes/__tests__/risk.service.test.ts`
- `src/domain/demandes/__tests__/demande.service.test.ts`
- `src/hooks/useDemandeService.ts`
- `e2e/demandes/demande-workflow.spec.ts`

### Fichiers Modifiés (3)
- `src/components/features/bmo/workspace/views/DemandView.tsx` (refactorisé)
- `src/components/features/bmo/demandes/command-center/views/*.tsx` (utilisation services)
- `src/modules/demandes/components/*.tsx` (utilisation services)

### Exemple de Diff

```diff
--- a/src/components/features/bmo/workspace/views/DemandView.tsx
+++ b/src/components/features/bmo/workspace/views/DemandView.tsx
@@ -1,5 +1,8 @@
 import React, { useState, useMemo } from 'react';
+import { useDemandeService } from '@/hooks/useDemandeService';
+import { BudgetService } from '@/domain/demandes/services/budget.service';
+import { RiskService } from '@/domain/demandes/services/risk.service';
 
 export function DemandView({ tab }: { tab: WorkspaceTab }) {
   const [data, setData] = useState<Demande | null>(null);
@@ -295,8 +298,8 @@ export function DemandView({ tab }: { tab: WorkspaceTab }) {
-  // Calcul budget
-  const budgetUsage = data?.budget?.available && data?.amount
-    ? Math.round((data.amount / data.budget.available) * 100)
-    : null;
+  const demandeService = useDemandeService(data);
+  const budgetUsage = demandeService.preparedDemande?.budget
+    ? BudgetService.calculateBudgetUsage(demandeService.preparedDemande, demandeService.preparedDemande.budget)
+    : null;
 
-  // Calcul risque global
-  const maxRiskScore = data?.risks?.length 
-    ? Math.max(...data.risks.map(r => r.score))
-    : 0;
+  const maxRiskScore = demandeService.preparedDemande?.risks
+    ? RiskService.calculateGlobalRiskScore(demandeService.preparedDemande.risks)
+    : 0;
```

---

## ✅ Tests Requis

### Tests Unitaires
- ✅ `BudgetService` - Tous les calculs budget
- ✅ `RiskService` - Évaluation des risques
- ✅ `PriorityService` - Calcul des priorités
- ✅ `DemandeService` - Validation et préparation
- ✅ `ValidationRules` - Toutes les règles
- ✅ `ApprovalRules` - Niveaux d'approbation

**Couverture cible**: >80%

### Tests E2E Playwright
- ✅ Création demande avec calculs automatiques
- ✅ Validation avec erreurs
- ✅ Calcul budget usage
- ✅ Détection risques
- ✅ Assignation avec validation

### Storybook Stories
```typescript
// src/components/features/bmo/workspace/views/DemandView.stories.tsx
export default {
  title: 'Features/Demandes/DemandView',
  component: DemandView,
};

export const WithBudgetWarning = {
  args: {
    demande: {
      amount: 90000,
      budget: { available: 100000, consumed: 0, allocated: 0 }
    }
  }
};

export const WithHighRisk = {
  args: {
    demande: {
      amount: 6000000, // > 5M
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 jours
    }
  }
};
```

---

## ✅ Checklist QA

### Fonctionnel
- [ ] Calculs budget identiques à avant
- [ ] Calculs risques identiques à avant
- [ ] Priorités calculées correctement
- [ ] Validation fonctionne comme avant
- [ ] Actions (assign, validate, reject) fonctionnent
- [ ] UI identique (pas de régression visuelle)

### Technique
- [ ] Tous les tests unitaires passent (>80% coverage)
- [ ] Tests E2E passent
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint
- [ ] Performance identique ou meilleure
- [ ] Bundle size n'a pas augmenté significativement

### Métier
- [ ] Règles métier respectées
- [ ] Seuils d'approbation corrects
- [ ] Calculs financiers exacts
- [ ] Gestion des risques conforme

---

## 📊 Critères d'Acceptation Métier

1. **Calculs Budget**
   - ✅ Le pourcentage d'utilisation est calculé correctement
   - ✅ Les alertes budget apparaissent aux bons seuils (>80%, >90%, >100%)
   - ✅ Le budget restant est affiché correctement

2. **Évaluation Risques**
   - ✅ Les risques sont détectés automatiquement
   - ✅ Le score de risque global est calculé correctement
   - ✅ Les risques critiques (>80) sont mis en évidence

3. **Priorités**
   - ✅ La priorité est calculée automatiquement selon les règles
   - ✅ La priorité peut être modifiée manuellement
   - ✅ Les priorités critiques/urgentes sont visibles

4. **Validation**
   - ✅ Les erreurs de validation sont affichées
   - ✅ Les warnings sont affichés
   - ✅ La soumission est bloquée si erreurs

5. **Actions**
   - ✅ Assignation fonctionne avec validation
   - ✅ Validation fonctionne avec vérifications
   - ✅ Rejet fonctionne avec raison

---

## 📈 Estimation Effort/Impact

### Effort
- **Total**: 40 J/H (5 jours)
  - Structure domaine: 2J/H
  - Types: 1J/H
  - Services: 10J/H
  - Règles: 5J/H
  - Hook: 3J/H
  - Refactoring composant: 15J/H
  - Tests unitaires: 5J/H
  - Tests E2E: 2J/H

### Impact Attendu (KPI)

**Maintenabilité**:
- ✅ Réduction complexité cyclomatique: -30%
- ✅ Augmentation couverture tests: +75% (de 5% à 80%)
- ✅ Réduction dette technique: -20%

**Qualité**:
- ✅ Réduction bugs métier: -50% (grâce aux tests)
- ✅ Temps de correction bugs: -40% (logique centralisée)

**Productivité**:
- ✅ Temps d'ajout nouvelle règle: -60% (centralisé)
- ✅ Réutilisabilité: +100% (services réutilisables)

---

## 🔄 Rollback Plan

### Si problème critique détecté

1. **Revert du commit**:
   ```bash
   git revert <commit-hash>
   ```

2. **Restaurer l'ancien code**:
   - Les fichiers originaux sont dans `main`
   - Pas de suppression, seulement refactoring

3. **Vérifications**:
   - Tests E2E doivent passer
   - UI doit être identique
   - Pas de régression fonctionnelle

### Points de contrôle
- ✅ Tests unitaires passent avant merge
- ✅ Tests E2E passent avant merge
- ✅ Review code par au moins 2 devs
- ✅ Tests manuels sur staging

---

## 📝 Notes pour l'Équipe Backend

**Aucune modification backend requise** pour cette PR.

**Futures améliorations possibles** (hors scope):
- API endpoint `/api/demandes/validate` pour validation côté serveur
- API endpoint `/api/demandes/risks` pour évaluation risques côté serveur
- WebSocket pour notifications risques en temps réel

---

**PR créée par**: Cursor AI Assistant  
**Date**: 2025-01-XX  
**Statut**: 📝 Prête à être créée

