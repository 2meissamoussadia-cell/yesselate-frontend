# 🎯 Plan d'Exécution Pas à Pas - PR #01 Finalisation

**Branch**: `refactor/demandes-extract-domain-logic-final`  
**Statut**: 📋 Prêt à exécuter  
**Estimation**: 8 J/H (1 jour)

---

## 📋 Prérequis

### 1. Vérifier État Actuel
```bash
# Vérifier branche actuelle
git branch --show-current
# Doit être: pre-cursor-refactor

# Vérifier tag
git tag | grep pre-cursor-refactor
# Doit exister

# Vérifier fichiers domain existants
ls -la src/domain/demandes/
# Doit contenir: services/, rules/, types/, adapters/
```

### 2. Créer Branche de Travail
```bash
git checkout -b refactor/demandes-extract-domain-logic-final
```

---

## 🔧 Étape 1 : Audit DemandView.tsx (2J/H)

### 1.1 Lire le Fichier Complet
```bash
# Lire le fichier
cat src/components/features/bmo/workspace/views/DemandView.tsx | wc -l
# Vérifier taille (~1100 lignes)
```

### 1.2 Identifier Logique Résiduelle

**Rechercher patterns à extraire**:
```bash
# Rechercher calculs inline
grep -n "calculate\|compute\|evaluate" src/components/features/bmo/workspace/views/DemandView.tsx

# Rechercher conditions métier complexes
grep -n "if.*amount\|if.*budget\|if.*risk" src/components/features/bmo/workspace/views/DemandView.tsx

# Rechercher appels directs aux services (devrait être 0)
grep -n "BudgetService\|RiskService\|PriorityService" src/components/features/bmo/workspace/views/DemandView.tsx
```

### 1.3 Vérifier Utilisation useDemandeService

**Vérifier que le hook est utilisé correctement**:
```typescript
// Doit être présent autour de la ligne 303-314
const {
  budgetUsage,
  budgetMetrics,
  globalRiskScore: maxRiskScore,
  riskLevel,
  risks: evaluatedRisks,
  validation,
  warnings,
  approver,
  canAutoApprove,
  shouldEscalate
} = useDemandeService(demandeForService);
```

**Actions**:
- ✅ Vérifier que toutes les propriétés nécessaires sont extraites du hook
- ✅ Remplacer toute logique de calcul résiduelle par les propriétés du service
- ✅ Supprimer toute fonction helper locale qui fait des calculs métier

---

## 🔧 Étape 2 : Nettoyage et Refactoring (2J/H)

### 2.1 Remplacer Logique Résiduelle

**Si des calculs existent encore dans le composant**:

```typescript
// ❌ AVANT (à supprimer)
const calculateBudgetAlert = (budget: Budget) => {
  if (budget.available < budget.requested * 0.1) {
    return 'critical';
  }
  // ...
};

// ✅ APRÈS (utiliser le service)
const { budgetUsage, warnings } = useDemandeService(demandeForService);
// warnings contient déjà les alertes budget
```

### 2.2 Simplifier Rendu

**Extraire sous-composants si nécessaire**:
```typescript
// Créer sous-composants pour sections complexes
<DemandHeader demande={data} statusConfig={statusConfig} />
<DemandBudgetSection budgetUsage={budgetUsage} budgetMetrics={budgetMetrics} />
<DemandRisksSection risks={evaluatedRisks} riskLevel={riskLevel} />
<DemandValidationSection validation={validation} warnings={warnings} />
```

### 2.3 Vérifier Types

**S'assurer que les types sont corrects**:
```typescript
// Vérifier que demandeForService est bien adapté
const demandeForService = useMemo(() => {
  if (!data) return null;
  return adaptLocalDemandToDomain(data);
}, [data]);

// Le hook doit gérer le cas null
const demandeService = useDemandeService(demandeForService);
```

**Fichier à modifier**:
- `src/components/features/bmo/workspace/views/DemandView.tsx`

---

## 🔧 Étape 3 : Tests E2E Playwright (3J/H)

### 3.1 Installer Playwright (si pas déjà fait)
```bash
npm install -D @playwright/test
npx playwright install
```

### 3.2 Créer Configuration Playwright
**Fichier à créer**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.3 Créer Tests E2E
**Fichier à créer**: `e2e/demandes/demand-view.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('DemandView - Domain Logic Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication if needed
    await page.goto('/maitre-ouvrage/demandes');
  });

  test('should display demande with correct budget calculations', async ({ page }) => {
    // Navigate to a specific demand
    await page.click('text=DEM-001'); // Adjust selector
    
    // Verify budget section displays correctly
    await expect(page.locator('[data-testid="budget-usage"]')).toBeVisible();
    
    // Verify budget metrics are calculated
    const budgetUsage = await page.locator('[data-testid="budget-usage-value"]').textContent();
    expect(budgetUsage).toMatch(/\d+%/);
  });

  test('should display risk scores correctly', async ({ page }) => {
    await page.click('text=DEM-001');
    
    // Verify risk section
    await expect(page.locator('[data-testid="risk-score"]')).toBeVisible();
    
    // Verify risk level badge
    const riskLevel = await page.locator('[data-testid="risk-level"]').textContent();
    expect(['low', 'medium', 'high', 'critical']).toContain(riskLevel?.toLowerCase());
  });

  test('should show validation warnings', async ({ page }) => {
    await page.click('text=DEM-001');
    
    // Verify warnings are displayed if any
    const warnings = page.locator('[data-testid="validation-warnings"]');
    if (await warnings.count() > 0) {
      await expect(warnings.first()).toBeVisible();
    }
  });

  test('should handle validation workflow', async ({ page }) => {
    await page.click('text=DEM-001');
    
    // Click validate button
    await page.click('[data-testid="validate-button"]');
    
    // Verify modal or confirmation
    await expect(page.locator('[data-testid="validation-modal"]')).toBeVisible();
    
    // Complete validation
    await page.fill('[data-testid="validation-note"]', 'Test validation');
    await page.click('[data-testid="confirm-validation"]');
    
    // Verify success message
    await expect(page.locator('text=Demande validée')).toBeVisible();
  });
});
```

### 3.4 Ajouter Data-Testid dans DemandView.tsx

**Modifier le composant pour ajouter test IDs**:
```typescript
<div data-testid="budget-usage">
  <span data-testid="budget-usage-value">{budgetUsage.percentage}%</span>
</div>

<div data-testid="risk-score">
  <span data-testid="risk-level">{riskLevel}</span>
</div>
```

---

## 🔧 Étape 4 : Storybook Stories (2J/H)

### 4.1 Installer Storybook (si pas déjà fait)
```bash
npx storybook@latest init
```

### 4.2 Créer Story
**Fichier à créer**: `src/components/features/bmo/workspace/views/DemandView.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { DemandView } from './DemandView';
import { WorkspaceTab } from '@/lib/stores/workspaceStore';

// Mock data
const mockDemandData = {
  id: 'DEM-001',
  subject: 'Demande de matériel chantier',
  status: 'pending',
  priority: 'high',
  amount: 500000,
  budget: {
    code: 'BUD-001',
    line: 'Matériel',
    available: 1000000,
    requested: 500000
  },
  risks: [
    {
      id: 'risk-001',
      category: 'budget',
      probability: 0.7,
      impact: 0.8,
      score: 0.56
    }
  ]
};

const meta: Meta<typeof DemandView> = {
  title: 'Workspace/DemandView',
  component: DemandView,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-950 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DemandView>;

export const Default: Story = {
  args: {
    tab: {
      type: 'demand',
      id: 'DEM-001',
      label: 'Demande DEM-001'
    } as WorkspaceTab
  },
  parameters: {
    mockData: {
      demand: mockDemandData
    }
  }
};

export const WithHighRisk: Story = {
  args: {
    tab: {
      type: 'demand',
      id: 'DEM-002',
      label: 'Demande à haut risque'
    } as WorkspaceTab
  },
  parameters: {
    mockData: {
      demand: {
        ...mockDemandData,
        id: 'DEM-002',
        risks: [
          {
            id: 'risk-002',
            category: 'budget',
            probability: 0.9,
            impact: 0.9,
            score: 0.81
          }
        ]
      }
    }
  }
};

export const WithBudgetAlert: Story = {
  args: {
    tab: {
      type: 'demand',
      id: 'DEM-003',
      label: 'Demande avec alerte budget'
    } as WorkspaceTab
  },
  parameters: {
    mockData: {
      demand: {
        ...mockDemandData,
        id: 'DEM-003',
        budget: {
          code: 'BUD-001',
          line: 'Matériel',
          available: 100000,
          requested: 500000
        }
      }
    }
  }
};
```

### 4.3 Configurer Mock Service Worker (si nécessaire)
**Fichier à créer**: `src/mocks/handlers.ts` (si pas existant)

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/demands/:id', () => {
    return HttpResponse.json({
      id: 'DEM-001',
      // ... mock data
    });
  }),
];
```

---

## 🔧 Étape 5 : Validation et Mesures (1J/H)

### 5.1 Exécuter Tests Unitaires
```bash
npm run test src/domain/demandes
# Vérifier que tous passent (100%)
```

### 5.2 Exécuter Tests E2E
```bash
npm run dev &  # Démarrer serveur dev
npx playwright test e2e/demandes
# Vérifier que tous passent
```

### 5.3 Vérifier Coverage
```bash
npm run test:coverage src/domain/demandes
# Vérifier coverage >70%
```

### 5.4 Build Storybook
```bash
npm run build-storybook
# Vérifier que le build réussit
```

### 5.5 Mesurer Performance
```bash
# Avant modifications
npm run build
# Mesurer temps de build, taille bundle

# Après modifications
npm run build
# Comparer métriques
```

### 5.6 Vérifier Linting
```bash
npm run lint
# Vérifier 0 erreurs
```

---

## 📝 Checklist Finale

### Code
- [ ] `DemandView.tsx` utilise uniquement `useDemandeService`
- [ ] Aucune logique métier dans le composant
- [ ] Tous les calculs via le service domain
- [ ] Types corrects partout
- [ ] Pas de `any` ou `unknown`

### Tests
- [ ] Tests unitaires passent (100%)
- [ ] Tests E2E Playwright créés et passent
- [ ] Coverage domain/demandes >70%
- [ ] Storybook stories créées et fonctionnent

### Documentation
- [ ] Changelog mis à jour
- [ ] Guide migration créé (si breaking changes)
- [ ] Commentaires code ajoutés si nécessaire

### CI/CD
- [ ] Lint passe
- [ ] Typecheck passe
- [ ] Build réussit
- [ ] Tests passent

---

## 🚀 Commandes Git Finales

```bash
# 1. Vérifier changements
git status
git diff

# 2. Ajouter fichiers
git add src/components/features/bmo/workspace/views/DemandView.tsx
git add e2e/demandes/demand-view.spec.ts
git add src/components/features/bmo/workspace/views/DemandView.stories.tsx
git add playwright.config.ts
git add inventory.json component-domain-map.json

# 3. Commit
git commit -m "refactor(demandes): finaliser extraction domaine logique

- Nettoyer DemandView.tsx pour utiliser uniquement useDemandeService
- Ajouter tests E2E Playwright pour scénarios critiques
- Ajouter Storybook stories pour composants
- Coverage domain/demandes >70%

Closes #PR-01"

# 4. Push
git push origin refactor/demandes-extract-domain-logic-final

# 5. Créer PR (via GitHub UI ou CLI)
gh pr create --title "refactor(demandes): finaliser extraction domaine logique" \
  --body-file PR_01_DESCRIPTION.md \
  --base main
```

---

## 📊 Métriques à Collecter

### Avant
- Temps rendu DemandView: ?ms
- Lignes logique métier dans composant: ? lignes
- Coverage domain/demandes: ~70%
- Tests E2E: 0

### Après
- Temps rendu DemandView: ?ms (objectif: <100ms)
- Lignes logique métier dans composant: 0 lignes
- Coverage domain/demandes: >70%
- Tests E2E: 4+ tests

---

## 🔄 Rollback Plan

Si problème détecté après merge:

```bash
# 1. Identifier commit problématique
git log --oneline | head -5

# 2. Revert commit
git revert <commit-hash>

# 3. Push
git push origin main
```

Les services domain existent déjà, donc pas de perte de logique métier.

---

## ✅ Critères de Succès

1. ✅ `DemandView.tsx` utilise uniquement `useDemandeService`
2. ✅ 0 ligne de logique métier dans le composant
3. ✅ Tests unitaires passent (100%)
4. ✅ Tests E2E créés et passent
5. ✅ Storybook stories fonctionnent
6. ✅ Coverage >70%
7. ✅ Pas de régression visuelle
8. ✅ Build réussit
9. ✅ Lint passe
10. ✅ Typecheck passe

