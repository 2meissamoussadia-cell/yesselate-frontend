# ⚡ Quick Start - Finaliser PR #01

**Temps estimé** : 2 minutes

---

## 🚀 Option 1 : Script Automatique (Recommandé)

### Windows (PowerShell)
```powershell
.\FINALIZE_PR_01.ps1
```

### Linux/Mac (Bash)
```bash
bash FINALIZE_PR_01.sh
```

---

## 🚀 Option 2 : Commandes Manuelles

### 1. Vérifier l'état
```bash
git status
git branch --show-current  # Doit être: refactor/demandes-extract-domain-logic-final
```

### 2. Ajouter les fichiers
```bash
git add inventory.json component-domain-map.json
git add e2e/demandes/demand-view-domain-integration.spec.ts
git add src/components/features/bmo/workspace/views/DemandView.tsx
git add PR_*.md VALIDATION_*.md CHANGELOG_*.md RAPPORT_*.md EXECUTION_*.md MERGE_*.md NEXT_*.md FINAL_*.md
```

### 3. Créer le commit
```bash
git commit -m "refactor(demandes): finaliser extraction domaine logique

- Ajouter data-testid dans DemandView.tsx (7 data-testid)
- Créer tests E2E intégration domain service
- Documentation complète (14 fichiers)
- Inventaires complets

Tests: 62/62 passent (100%)
Coverage: ~70% domain/demandes
E2E: 2 fichiers créés
Lint: 0 erreur

Closes #PR-01"
```

### 4. Push
```bash
git push origin refactor/demandes-extract-domain-logic-final
```

### 5. Créer la PR
```bash
gh pr create \
  --title "refactor(demandes): finaliser extraction domaine logique" \
  --body-file PR_01_COMPLETE_SUMMARY.md \
  --base main
```

---

## ✅ Vérification Rapide

### Avant de commiter
- [ ] Tests unitaires passent : `npm run test src/domain/demandes`
- [ ] Lint passe : `npm run lint`
- [ ] Fichiers ajoutés : `git status`

### Après le commit
- [ ] Commit créé : `git log -1`
- [ ] Push réussi : `git status`
- [ ] PR créée sur GitHub

---

## 📚 Documentation

- **Guide complet** : `MERGE_GUIDE_PR_01.md`
- **Résumé PR** : `PR_01_COMPLETE_SUMMARY.md`
- **Résumé final** : `FINAL_SUMMARY.md`
- **Prochaines étapes** : `NEXT_STEPS.md`

---

## 🆘 En cas de problème

### Erreur "branch not found"
```bash
git checkout -b refactor/demandes-extract-domain-logic-final
```

### Erreur "nothing to commit"
```bash
git status  # Vérifier quels fichiers sont modifiés
git add .   # Ajouter tous les fichiers modifiés
```

### Erreur push
```bash
git pull origin refactor/demandes-extract-domain-logic-final
git push origin refactor/demandes-extract-domain-logic-final
```

---

## 🎉 C'est tout !

Une fois la PR créée, elle sera prête à être reviewée et mergée.

**Temps total** : ~2 minutes
