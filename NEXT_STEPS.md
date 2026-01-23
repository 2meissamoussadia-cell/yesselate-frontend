# 🚀 Prochaines Étapes - Suite du Refactoring

**Date**: 2025-01-XX  
**Statut Actuel**: ✅ PR #01 complétée

---

## 📊 ÉTAT ACTUEL

### ✅ Complété
- ✅ **SCAN_PROJECT** - Inventaire complet créé
- ✅ **MAP_DOMAINS** - 13 domaines cartographiés
- ✅ **DETECT_ANTIPATTERNS** - 7 anti-patterns identifiés
- ✅ **PR_PROPOSALS** - 3 PRs prioritaires proposées
- ✅ **PR #01** - Finalisation extraction domaine Demandes

### 🚀 À Faire
- ⏳ **PR #02** - Virtualisation listes + server pagination
- ⏳ **PR #03** - Tests domain services + coverage 70%+

---

## 🎯 PR #02 : Virtualisation Listes + Server Pagination

### Objectif
Améliorer les performances des listes en virtualisant le rendu et en implémentant la pagination serveur.

### Estimation
- **Effort** : 24 J/H (3 jours)
- **Priorité** : 🟠 HAUTE
- **Impact** : ⭐⭐⭐⭐

### Composants à Virtualiser
1. `src/modules/demandes/pages/overview/DemandesOverviewView.tsx`
2. `src/components/features/bmo/chantiers/views/ChantiersListView.tsx`
3. `src/modules/centre-alertes/pages/overview/AlertesOverviewView.tsx`
4. `src/modules/blocked/pages/overview/BlockedOverviewView.tsx`

### Métriques Cibles
| Métrique | Avant | Cible |
|----------|-------|-------|
| Temps rendu 1000 items | ~2000ms | <200ms |
| Mémoire utilisée | ~50MB | <5MB |
| LCP | ~3s | <1.5s |
| TBT | ~500ms | <200ms |

### Plan d'Action
1. Créer composant `TableVirtual` réutilisable (6J/H)
2. Adapter 4 pages listes (12J/H)
3. Tests performance (4J/H)
4. Storybook stories (2J/H)

### Fichiers à Créer/Modifier
- `src/components/ui/TableVirtual.tsx` (nouveau)
- `src/modules/demandes/pages/overview/DemandesOverviewView.tsx` (modifier)
- `src/components/features/bmo/chantiers/views/ChantiersListView.tsx` (modifier)
- `src/modules/centre-alertes/pages/overview/AlertesOverviewView.tsx` (modifier)
- `src/modules/blocked/pages/overview/BlockedOverviewView.tsx` (modifier)
- `e2e/performance/lists-virtualization.spec.ts` (nouveau)

---

## 🎯 PR #03 : Tests Domain Services + Coverage 70%+

### Objectif
Atteindre coverage >70% global, >80% domain/ en ajoutant des tests pour les services domain.

### Estimation
- **Effort** : 16 J/H (2 jours)
- **Priorité** : 🟡 MOYENNE
- **Impact** : ⭐⭐⭐

### Actions
1. Compléter tests `demandes` à 80%+ (4J/H)
2. Ajouter tests `analytics` domain (6J/H)
3. Ajouter tests services critiques (4J/H)
4. Activer CI coverage gating (2J/H)

### Métriques Cibles
| Métrique | Avant | Cible |
|----------|-------|-------|
| Coverage global | ~5% | >70% |
| Coverage domain/ | ~70% | >80% |
| Tests unitaires | 18 | 50+ |

### Fichiers à Créer/Modifier
- `src/domain/demandes/__tests__/*.test.ts` (compléter)
- `src/domain/analytics/services/__tests__/*.test.ts` (nouveau/compléter)
- `src/lib/services/__tests__/validation-bc-anomalies.service.test.ts` (nouveau)
- `src/lib/services/__tests__/delegationsApiService.test.ts` (nouveau)
- `jest.config.js` (modifier - coverage gating)

---

## 📅 PLAN D'EXÉCUTION

### Semaine 1
- **Jour 1-2** : Finaliser PR #01 (✅ FAIT)
- **Jour 3-5** : PR #02 - Virtualisation listes

### Semaine 2
- **Jour 1-3** : PR #02 - Finalisation
- **Jour 4-5** : PR #03 - Tests coverage

### Semaine 3
- **Jour 1-2** : PR #03 - Finalisation
- **Jour 3-5** : Extraction domaines restants (validation-bc, delegations, etc.)

---

## 🎯 PRIORITÉS

### Immédiat (Cette Semaine)
1. ✅ Merger PR #01
2. 🚀 Commencer PR #02

### Court Terme (2 Semaines)
1. 🚀 Finaliser PR #02
2. 🚀 Commencer PR #03

### Moyen Terme (1 Mois)
1. 🚀 Finaliser PR #03
2. 🚀 Extraction domaines restants
3. 🚀 Implémentation support offline
4. 🚀 Implémentation RBAC UI

---

## 📊 MÉTRIQUES GLOBALES

### Actuel
- Coverage global : ~5%
- Coverage domain/ : ~70%
- Tests unitaires : 18 fichiers
- Tests E2E : 2 fichiers

### Cible (Après PR #02 + #03)
- Coverage global : >70%
- Coverage domain/ : >80%
- Tests unitaires : 50+ fichiers
- Tests E2E : 5+ fichiers

---

## 🔗 RESSOURCES

### Documentation PRs
- `PR_PROPOSALS.md` - 3 PRs prioritaires détaillées
- `PR_01_EXECUTION_PLAN.md` - Plan exécution PR #01 (référence)
- `MERGE_GUIDE_PR_01.md` - Guide merge PR #01

### Inventaires
- `inventory.json` - Inventaire technique
- `component-domain-map.json` - Carte domaines

### Rapports
- `RAPPORT_SCAN_COMPLET.md` - Rapport scan initial
- `EXECUTION_COMPLETE_SUMMARY.md` - Résumé exécution complète

---

## ✅ CHECKLIST PROCHAINES ÉTAPES

### PR #01
- [x] Code complété
- [x] Tests créés
- [x] Documentation créée
- [ ] PR créée
- [ ] PR mergée

### PR #02
- [ ] Composant TableVirtual créé
- [ ] 4 pages listes adaptées
- [ ] Tests performance créés
- [ ] Storybook stories créées
- [ ] PR créée

### PR #03
- [ ] Tests demandes complétés
- [ ] Tests analytics créés
- [ ] Tests services critiques créés
- [ ] CI coverage gating activé
- [ ] PR créée

---

## 🎉 CONCLUSION

**PR #01 est complétée et prête à être mergée.**

**Prochaines étapes** :
1. Merger PR #01
2. Commencer PR #02 (Virtualisation listes)
3. Commencer PR #03 (Tests coverage)

**Estimation totale restante** : 40 J/H (5 jours)

---

## 📝 NOTES

- Les PRs peuvent être travaillées en parallèle si nécessaire
- PR #02 et PR #03 sont indépendantes
- Prioriser PR #02 pour améliorer les performances utilisateur
- PR #03 peut être faite en parallèle de PR #02

