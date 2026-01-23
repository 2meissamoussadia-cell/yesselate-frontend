# PR #03 : Tests Services & Domain - Couverture >70%

## 📋 Métadonnées

- **Titre PR**: `test/add-services-domain-tests`
- **Type**: Tests
- **Priorité**: 🔴 CRITIQUE
- **Estimation**: 60 J/H (7.5 jours)
- **Impact**: ⭐⭐⭐⭐⭐ (Très élevé)
- **Risque**: Faible

---

## 🎯 Description Métier (Pour PO)

### Contexte
Actuellement, seulement **11 fichiers de tests** pour ~1200 composants et 61 services. La couverture est estimée à **<5%**, ce qui représente un **risque majeur** pour :
- **Régression** lors de modifications
- **Bugs en production** non détectés
- **Refactoring** difficile (pas de sécurité)

### Problème Métier
- **Bugs fréquents** en production (règles métier cassées)
- **Peur de modifier** le code (pas de tests de sécurité)
- **Temps de debug** élevé
- **Qualité** dégradée

### Solution Proposée
Ajouter tests unitaires pour tous les **services métier critiques** et **logique domain**, avec objectif **>70% de couverture**.

### Bénéfices Métier
- ✅ **Fiabilité** : Bugs détectés avant production
- ✅ **Confiance** : Modifications sécurisées
- ✅ **Qualité** : Code plus robuste
- ✅ **Vélocité** : Debug plus rapide

---

## 🔧 Plan Technique Étape par Étape

### Étape 1 : Configuration Tests (2J/H)

**Améliorer `jest.config.js`**:
```javascript
module.exports = {
  ...existingConfig,
  collectCoverageFrom: [
    'src/domain/**/*.{ts,tsx}',
    'src/lib/services/**/*.{ts,tsx}',
    'src/lib/business/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Seuils par domaine
    'src/domain/demandes/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/lib/services/validation-': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}'
  ]
};
```

### Étape 2 : Tests Services Validation BC (8J/H)

**Fichiers à tester**:
- `src/lib/services/validation-bc-api.ts`
- `src/lib/services/validation-bc-anomalies.service.ts`
- `src/lib/services/bc-audit.service.ts`
- `src/lib/utils/validation-logic.ts`

**Exemple**:
```typescript
// src/lib/services/__tests__/validation-bc-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationBCApiService } from '../validation-bc-api';
import axios from 'axios';

vi.mock('axios');

describe('ValidationBCApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocument', () => {
    it('should fetch document by id', async () => {
      const mockDocument = { id: '1', amount: 100000 };
      (axios.get as any).mockResolvedValue({ data: mockDocument });

      const result = await ValidationBCApiService.getDocument('1');

      expect(axios.get).toHaveBeenCalledWith('/api/validation-bc/documents/1');
      expect(result).toEqual(mockDocument);
    });

    it('should handle errors', async () => {
      (axios.get as any).mockRejectedValue(new Error('Network error'));

      await expect(
        ValidationBCApiService.getDocument('1')
      ).rejects.toThrow('Network error');
    });
  });

  describe('validateDocument', () => {
    it('should validate document successfully', async () => {
      const mockResponse = { success: true, documentId: '1' };
      (axios.post as any).mockResolvedValue({ data: mockResponse });

      const result = await ValidationBCApiService.validateDocument('1', {
        validatorId: 'user-1',
        comment: 'Validé'
      });

      expect(axios.post).toHaveBeenCalledWith(
        '/api/validation-bc/documents/1/validate',
        { validatorId: 'user-1', comment: 'Validé' }
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
```

### Étape 3 : Tests Services RH (6J/H)

**Fichiers**:
- `src/lib/services/rhApiService.ts`
- `src/lib/services/rhBusinessService.ts`
- `src/lib/services/rhBusinessRules.ts`

**Exemple**:
```typescript
// src/lib/services/__tests__/rhBusinessRules.test.ts
import { describe, it, expect } from 'vitest';
import { RHBusinessRules } from '../rhBusinessRules';
import type { DemandeRH } from '@/lib/types/rh.types';

describe('RHBusinessRules', () => {
  describe('calculateCongeBalance', () => {
    it('should calculate balance correctly', () => {
      const demande: DemandeRH = {
        type: 'conge',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-10'),
        employeeId: 'emp-1'
      };

      const balance = RHBusinessRules.calculateCongeBalance(
        demande,
        { total: 25, taken: 5, pending: 0 }
      );

      expect(balance.remaining).toBe(20);
      expect(balance.requested).toBe(8); // 10 jours - 2 weekends
    });

    it('should reject if balance insufficient', () => {
      const demande: DemandeRH = {
        type: 'conge',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-30'), // 30 jours
        employeeId: 'emp-1'
      };

      const result = RHBusinessRules.validateCongeRequest(
        demande,
        { total: 25, taken: 20, pending: 0 }
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Solde de congés insuffisant');
    });
  });
});
```

### Étape 4 : Tests Services Calendrier (6J/H)

**Fichiers**:
- `src/lib/services/calendarValidationService.ts`
- `src/lib/services/calendarConflicts.ts`
- `src/lib/services/calendarSLA.ts`

### Étape 5 : Tests Services Délégations (5J/H)

**Fichier**: `src/lib/delegation/policy-engine.ts`

**Exemple**:
```typescript
// src/lib/delegation/__tests__/policy-engine.test.ts
import { describe, it, expect } from 'vitest';
import { evaluate } from '../policy-engine';
import type { DelegationFull, ActionContext } from '../types';

describe('PolicyEngine', () => {
  describe('evaluate', () => {
    it('should allow action if within limits', () => {
      const delegation: DelegationFull = {
        id: '1',
        maxAmount: 1000000,
        validUntil: new Date('2025-12-31'),
        // ...
      };

      const context: ActionContext = {
        action: 'validate',
        amount: 500000,
        // ...
      };

      const result = evaluate(delegation, context);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Within delegation limits');
    });

    it('should reject if amount exceeds limit', () => {
      const delegation: DelegationFull = {
        id: '1',
        maxAmount: 1000000,
        // ...
      };

      const context: ActionContext = {
        action: 'validate',
        amount: 1500000, // > limit
        // ...
      };

      const result = evaluate(delegation, context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Amount exceeds delegation limit');
    });
  });
});
```

### Étape 6 : Tests Domain Analytics (5J/H)

**Fichiers**:
- `src/domain/analytics/services/*.ts`

### Étape 7 : Tests Domain Demandes (si PR #01 mergée) (8J/H)

**Fichiers**:
- `src/domain/demandes/services/*.ts`
- `src/domain/demandes/rules/*.ts`

### Étape 8 : Tests E2E Workflows Critiques (10J/H)

**Scénarios**:
1. **Workflow Validation BC**
   ```typescript
   // e2e/workflows/validation-bc.spec.ts
   test('should complete validation BC workflow', async ({ page }) => {
     await page.goto('/maitre-ouvrage/validation-bc');
     
     // Ouvrir un BC
     await page.click('[data-testid="bc-card"]:first-child');
     
     // Vérifier règles métier
     await expect(page.locator('[data-testid="3way-match"]')).toBeVisible();
     
     // Valider
     await page.click('button:has-text("Valider")');
     await expect(page.locator('.toast-success')).toBeVisible();
   });
   ```

2. **Workflow Demande RH**
   ```typescript
   // e2e/workflows/demande-rh.spec.ts
   test('should create and validate demande RH', async ({ page }) => {
     await page.goto('/maitre-ouvrage/demandes-rh');
     
     // Créer demande
     await page.click('button:has-text("Nouvelle demande")');
     await page.fill('input[name="type"]', 'conge');
     await page.fill('input[name="startDate"]', '2025-02-01');
     await page.fill('input[name="endDate"]', '2025-02-10');
     
     // Vérifier calcul automatique
     const balance = await page.textContent('[data-testid="balance"]');
     expect(balance).toContain('Solde restant');
     
     // Soumettre
     await page.click('button:has-text("Soumettre")');
     await expect(page.locator('.toast-success')).toBeVisible();
   });
   ```

3. **Workflow Délégation**
4. **Workflow Alertes**

### Étape 9 : CI/CD Integration (5J/H)

**`.github/workflows/test.yml`**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          threshold: 70%
```

---

## 📁 Fichiers Modifiés

### Fichiers Créés (40+)
- `src/lib/services/__tests__/validation-bc-api.test.ts`
- `src/lib/services/__tests__/validation-bc-anomalies.service.test.ts`
- `src/lib/services/__tests__/bc-audit.service.test.ts`
- `src/lib/services/__tests__/rhApiService.test.ts`
- `src/lib/services/__tests__/rhBusinessService.test.ts`
- `src/lib/services/__tests__/rhBusinessRules.test.ts`
- `src/lib/services/__tests__/calendarValidationService.test.ts`
- `src/lib/services/__tests__/calendarConflicts.test.ts`
- `src/lib/services/__tests__/calendarSLA.test.ts`
- `src/lib/delegation/__tests__/policy-engine.test.ts`
- `src/domain/analytics/services/__tests__/*.test.ts`
- `e2e/workflows/validation-bc.spec.ts`
- `e2e/workflows/demande-rh.spec.ts`
- `e2e/workflows/delegation.spec.ts`
- `e2e/workflows/alerts.spec.ts`
- `.github/workflows/test.yml`

### Fichiers Modifiés (2)
- `jest.config.js` (configuration améliorée)
- `package.json` (scripts tests)

---

## ✅ Tests Requis

### Tests Unitaires
- ✅ Tous les services métier critiques
- ✅ Toutes les règles métier
- ✅ Tous les calculs (budget, risques, priorités)
- ✅ Toutes les validations

**Couverture cible**: >70% global, >80% pour domain/services critiques

### Tests E2E Playwright
- ✅ Workflow Validation BC complet
- ✅ Workflow Demande RH complet
- ✅ Workflow Délégation complet
- ✅ Workflow Alertes complet

### Tests d'Intégration
- ✅ Services + API mocks
- ✅ Services + Stores

---

## ✅ Checklist QA

### Couverture
- [ ] Couverture globale >70%
- [ ] Couverture services >80%
- [ ] Couverture domain >80%
- [ ] Tous les services critiques testés

### Qualité
- [ ] Tous les tests passent
- [ ] Pas de tests flaky
- [ ] Tests rapides (<5s pour suite complète)
- [ ] Tests isolés (pas de dépendances)

### CI/CD
- [ ] Tests exécutés sur chaque PR
- [ ] Couverture vérifiée automatiquement
- [ ] Échec si couverture <70%

---

## 📊 Critères d'Acceptation Métier

1. **Couverture**
   - ✅ Couverture globale >70%
   - ✅ Services critiques >80%
   - ✅ Domain logic >80%

2. **Qualité**
   - ✅ Tous les tests passent
   - ✅ Pas de régression détectée
   - ✅ Bugs connus couverts par tests

3. **CI/CD**
   - ✅ Tests automatiques sur PR
   - ✅ Rapport couverture visible
   - ✅ Blocage si couverture insuffisante

---

## 📈 Estimation Effort/Impact

### Effort
- **Total**: 60 J/H (7.5 jours)
  - Configuration: 2J/H
  - Services Validation BC: 8J/H
  - Services RH: 6J/H
  - Services Calendrier: 6J/H
  - Services Délégations: 5J/H
  - Domain Analytics: 5J/H
  - Domain Demandes: 8J/H
  - E2E Workflows: 10J/H
  - CI/CD: 5J/H
  - Buffer: 5J/H

### Impact Attendu (KPI)

**Qualité**:
- ✅ Couverture tests: +65% (de 5% à 70%)
- ✅ Bugs en production: -70%
- ✅ Temps de debug: -50%

**Confiance**:
- ✅ Refactoring sécurisé: +100%
- ✅ Vélocité équipe: +30%

**Fiabilité**:
- ✅ Régression détectée: +90%
- ✅ Confiance déploiement: +80%

---

## 🔄 Rollback Plan

### Si problème détecté

1. **Désactiver tests problématiques temporairement**:
   ```typescript
   describe.skip('ServiceProblematic', () => {
     // Tests à corriger
   });
   ```

2. **Ajuster seuils couverture progressivement**:
   - Semaine 1: 50%
   - Semaine 2: 60%
   - Semaine 3: 70%

3. **Revert si nécessaire**:
   ```bash
   git revert <commit-hash>
   ```

---

## 📝 Notes pour l'Équipe

### Stratégie Progressive
1. **Phase 1** (Semaine 1-2): Services critiques (Validation BC, RH)
2. **Phase 2** (Semaine 3-4): Autres services
3. **Phase 3** (Semaine 5): Domain logic
4. **Phase 4** (Semaine 6): E2E workflows

### Bonnes Pratiques
- ✅ Un test = une assertion claire
- ✅ Tests isolés (mocks)
- ✅ Noms de tests descriptifs
- ✅ Arrange-Act-Assert pattern

---

**PR créée par**: Cursor AI Assistant  
**Date**: 2025-01-XX  
**Statut**: 📝 Prête à être créée

