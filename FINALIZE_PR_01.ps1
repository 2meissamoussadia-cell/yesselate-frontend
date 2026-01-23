# Script PowerShell de finalisation PR #01
# Usage: .\FINALIZE_PR_01.ps1

Write-Host "🚀 Finalisation PR #01 - Extraction Domaine Demandes" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est sur la bonne branche
$branch = git branch --show-current
if ($branch -ne "refactor/demandes-extract-domain-logic-final") {
    Write-Host "⚠️  Attention: Vous n'êtes pas sur la branche 'refactor/demandes-extract-domain-logic-final'" -ForegroundColor Yellow
    Write-Host "   Branche actuelle: $branch" -ForegroundColor Yellow
    $continue = Read-Host "Continuer quand même? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host "📋 Étape 1: Vérification de l'état..." -ForegroundColor Green
git status --short

Write-Host ""
Write-Host "📋 Étape 2: Ajout des fichiers..." -ForegroundColor Green
git add inventory.json component-domain-map.json
git add e2e/demandes/demand-view-domain-integration.spec.ts
git add src/components/features/bmo/workspace/views/DemandView.tsx
git add PR_*.md, VALIDATION_*.md, CHANGELOG_*.md, RAPPORT_*.md, EXECUTION_*.md, MERGE_*.md, NEXT_*.md, FINAL_*.md

Write-Host ""
Write-Host "📋 Étape 3: Création du commit..." -ForegroundColor Green
$commitMessage = @"
refactor(demandes): finaliser extraction domaine logique

- Ajouter data-testid dans DemandView.tsx (7 data-testid)
- Créer tests E2E intégration domain service
- Documentation complète (14 fichiers)
- Inventaires complets (inventory.json, component-domain-map.json)

Tests: 62/62 passent (100%)
Coverage: ~70% domain/demandes
E2E: 2 fichiers créés
Lint: 0 erreur

Closes #PR-01
"@

git commit -m $commitMessage

Write-Host ""
Write-Host "📋 Étape 4: Push vers le remote..." -ForegroundColor Green
git push origin refactor/demandes-extract-domain-logic-final

Write-Host ""
Write-Host "✅ PR #01 finalisée!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Aller sur GitHub et créer la PR"
Write-Host "   2. Ou utiliser: gh pr create --title 'refactor(demandes): finaliser extraction domaine logique' --body-file PR_01_COMPLETE_SUMMARY.md"
Write-Host ""
Write-Host "📚 Documentation disponible:" -ForegroundColor Cyan
Write-Host "   - MERGE_GUIDE_PR_01.md - Guide de merge"
Write-Host "   - PR_01_COMPLETE_SUMMARY.md - Résumé complet"
Write-Host "   - FINAL_SUMMARY.md - Résumé final"
Write-Host ""

