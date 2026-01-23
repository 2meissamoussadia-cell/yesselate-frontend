# ✅ Checklist QA - PR feat/demandes-extraction-domain

## 🔍 Vérifications Techniques

### Lint
- [ ] `npm run lint` exécuté
- [ ] Aucune erreur ESLint
- [ ] Aucun warning critique

### Typecheck
- [ ] `npm run typecheck` ou `tsc --noEmit` exécuté
- [ ] Aucune erreur TypeScript
- [ ] Types correctement exportés

### Unit Tests
- [ ] `npm run test tests/domain/demandes/service.spec.ts` exécuté
- [ ] Tous les tests passent (20+ tests)
- [ ] Couverture >80% pour `domain/demandes/service.ts`
- [ ] Rapport de couverture généré

### Playwright Smoke
- [ ] `npm run test:e2e e2e/demandes/demande-workflow.spec.ts` exécuté
- [ ] Scénario "Créer demande → Valider → Vérifier état" passe
- [ ] Scénario "Validation errors" passe
- [ ] Scénario "Budget usage calculation" passe
- [ ] Scénario "Risks detection" passe

### Storybook Stories
- [ ] `npm run storybook` lancé
- [ ] Story "WithBudgetWarning" visible
- [ ] Story "WithHighRisk" visible
- [ ] Story "WithValidationErrors" visible
- [ ] Story "WithAutoApprove" visible
- [ ] Story "WithCriticalBudget" visible
- [ ] Story "WithOverdueDeadline" visible

### Perf Quick Check
- [ ] Temps de rendu `DemandView` identique ou meilleur
- [ ] Pas de régression mémoire
- [ ] Pas de régression bundle size

---

## 🎯 Vérifications Fonctionnelles

### Validation
- [ ] Validation titre (min 10 caractères) fonctionne
- [ ] Validation montant (positif, <100M) fonctionne
- [ ] Validation bureau fonctionne
- [ ] Validation délai fonctionne
- [ ] Validation documents (≥1M) fonctionne
- [ ] Validation justification (≥500K) fonctionne
- [ ] Validation raison urgence (urgent/critical) fonctionne

### Calculs
- [ ] Calcul métriques budget correct
- [ ] Détection budget warning (>80%) fonctionne
- [ ] Détection budget critical (>90%) fonctionne
- [ ] Évaluation risques fonctionne
- [ ] Calcul priorité automatique fonctionne
- [ ] Calcul niveau approbation fonctionne

### Actions
- [ ] Auto-approbation (<500K) fonctionne
- [ ] Préparation demande (prepareForAction) fonctionne
- [ ] Calcul délai (delayDays) fonctionne
- [ ] Détection retard (isOverdue) fonctionne

---

## 🔄 Non-Régression

### UI
- [ ] Interface identique (screenshots comparés)
- [ ] Pas de régression visuelle
- [ ] Tous les champs affichés correctement

### Fonctionnel
- [ ] Tous les workflows existants fonctionnent
- [ ] Pas de régression fonctionnelle
- [ ] Compatibilité backward assurée

### Performance
- [ ] Temps de rendu ≤ temps avant
- [ ] Mémoire ≤ mémoire avant
- [ ] Bundle size ≤ taille avant

---

## 📝 Documentation

- [ ] Code commenté (JSDoc)
- [ ] Types exportés correctement
- [ ] README mis à jour si nécessaire
- [ ] Changelog mis à jour

---

## ✅ Validation Finale

- [ ] Tous les checks ci-dessus validés
- [ ] Review code par 2 devs minimum
- [ ] Tests manuels sur staging
- [ ] Approbation PO si nécessaire

---

**Checklist créée par**: Cursor AI Assistant  
**Date**: 2025-01-XX

