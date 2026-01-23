# 🚀 Prochaines Actions - Guide d'Exécution

**Date**: 2025-01-XX  
**Statut**: Prêt pour CI & Finalisation

---

## 📋 Checklist d'Exécution

### 1. Exécuter CI Local

```bash
# Lint
npm run lint

# Typecheck
npm run typecheck
# ou
npx tsc --noEmit

# Tests unitaires avec coverage
npm run test -- --coverage
# ou
npm run test:coverage

# Tests E2E
npm run test:e2e
# ou
npx playwright test

# Build
npm run build
```

### 2. Vérifier Coverage

```bash
# Ouvrir rapport coverage
# Généralement dans: coverage/lcov-report/index.html

# Vérifier:
# - Domain Demandes: ≥70%
# - Domain Analytics: ≥70%
# - Global: ≥70%
```

### 3. Identifier Gaps

Si coverage < 70%:
- Analyser rapport coverage
- Identifier lignes non couvertes
- Ajouter tests manquants

### 4. Finaliser PR #03

```bash
# Ajouter tests manquants
# Exécuter tests
npm run test -- --coverage

# Vérifier coverage ≥70%
```

### 5. Créer Rapport Before/After

```markdown
# Métriques à collecter:
- Lignes de code
- Nombre de tests
- Coverage %
- Temps de build
- Bundle size
- Performance (FCP, TTFB)
```

### 6. Ouvrir PRs GitHub

Pour chaque PR:
- [ ] Titre descriptif
- [ ] Description complète
- [ ] Checklist QA
- [ ] Rollback plan
- [ ] Screenshots (si UI changes)

---

## 🔍 Commandes Utiles

### Tests
```bash
# Tests spécifiques
npm run test tests/domain/demandes/service.spec.ts
npm run test tests/domain/demandes/utils.spec.ts

# Tests avec watch
npm run test:watch

# Tests E2E spécifiques
npx playwright test e2e/demandes/demande-workflow.spec.ts
```

### Coverage
```bash
# Coverage détaillé
npm run test:coverage -- --coverageThreshold='{"global":{"branches":70,"functions":70,"lines":70,"statements":70}}'

# Coverage par fichier
npm run test:coverage -- --collectCoverageFrom='src/domain/**/*.ts'
```

### Lint & Format
```bash
# Lint avec fix
npm run lint -- --fix

# Format code
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## 📝 Notes Importantes

- **Ne pas modifier backend** sans ticket OpenAPI
- **Chaque PR doit inclure tests** et Storybook
- **Respecter le design actuel** (pas de breaking changes UI)
- **Mode patch minimal** (non-régression)

---

**Prêt pour**: Exécution CI et finalisation

