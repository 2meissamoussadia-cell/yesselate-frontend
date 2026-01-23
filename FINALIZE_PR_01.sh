#!/bin/bash
# Script de finalisation PR #01
# Usage: bash FINALIZE_PR_01.sh

set -e

echo "🚀 Finalisation PR #01 - Extraction Domaine Demandes"
echo "=================================================="
echo ""

# Vérifier qu'on est sur la bonne branche
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "refactor/demandes-extract-domain-logic-final" ]; then
  echo "⚠️  Attention: Vous n'êtes pas sur la branche 'refactor/demandes-extract-domain-logic-final'"
  echo "   Branche actuelle: $BRANCH"
  read -p "Continuer quand même? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "📋 Étape 1: Vérification de l'état..."
git status --short

echo ""
echo "📋 Étape 2: Ajout des fichiers..."
git add inventory.json component-domain-map.json
git add e2e/demandes/demand-view-domain-integration.spec.ts
git add src/components/features/bmo/workspace/views/DemandView.tsx
git add PR_*.md VALIDATION_*.md CHANGELOG_*.md RAPPORT_*.md EXECUTION_*.md MERGE_*.md NEXT_*.md FINAL_*.md

echo ""
echo "📋 Étape 3: Création du commit..."
git commit -m "refactor(demandes): finaliser extraction domaine logique

- Ajouter data-testid dans DemandView.tsx (7 data-testid)
- Créer tests E2E intégration domain service
- Documentation complète (14 fichiers)
- Inventaires complets (inventory.json, component-domain-map.json)

Tests: 62/62 passent (100%)
Coverage: ~70% domain/demandes
E2E: 2 fichiers créés
Lint: 0 erreur

Closes #PR-01"

echo ""
echo "📋 Étape 4: Push vers le remote..."
git push origin refactor/demandes-extract-domain-logic-final

echo ""
echo "✅ PR #01 finalisée!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Aller sur GitHub et créer la PR"
echo "   2. Ou utiliser: gh pr create --title 'refactor(demandes): finaliser extraction domaine logique' --body-file PR_01_COMPLETE_SUMMARY.md"
echo ""
echo "📚 Documentation disponible:"
echo "   - MERGE_GUIDE_PR_01.md - Guide de merge"
echo "   - PR_01_COMPLETE_SUMMARY.md - Résumé complet"
echo "   - FINAL_SUMMARY.md - Résumé final"
echo ""

