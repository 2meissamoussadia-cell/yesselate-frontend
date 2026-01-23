# 🎯 Plan d'Action Complet - ERP BTP Front-End

**Date**: 2025-01-XX  
**Statut**: 🚀 En cours d'implémentation  
**Priorité**: Non-régression maximale

---

## 📋 Vue d'Ensemble

### Objectifs
1. ✅ Appliquer les 3 PRs prioritaires (extraction, virtualisation, tests)
2. ✅ Implémenter les améliorations avancées (workflow, offline, RBAC, observabilité)
3. ✅ Garantir la non-régression à chaque étape
4. ✅ Documentation complète pour chaque changement

### Stratégie
- **Branches séparées** pour chaque PR
- **Tests avant/après** pour chaque changement
- **Métriques mesurées** pour validation
- **Rollback plan** pour chaque PR

---

## 🔴 PHASE 1 : PRs PRIORITAIRES

### PR #01 : Extraction Domaine Demandes
**Branch**: `refactor/demandes-extract-domain-logic`  
**Statut**: ⚠️ Partiellement fait (services existent, composants à refactorer)

#### État Actuel
- ✅ Services créés : `BudgetService`, `RiskService`, `PriorityService`, `DemandeService`
- ✅ Types créés : `demande.types.ts`
- ✅ Règles créées : `validation.rules.ts`, `approval.rules.ts`
- ❌ Composants non refactorés : `DemandView.tsx` contient encore de la logique

#### Actions Restantes
1. Refactorer `DemandView.tsx` pour utiliser les services
2. Créer hook `useDemandeService`
3. Ajouter tests unitaires manquants
4. Tests E2E Playwright

#### Métriques Before/After
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Complexité cyclomatique | ~25 | <15 | ? |
| Couverture tests | 0% | >80% | ? |
| Lignes logique métier dans composants | ~200 | 0 | ? |

---

### PR #02 : Virtualisation Listes
**Branch**: `perf/virtualize-lists`  
**Statut**: ❌ À faire

#### Composants à Virtualiser
1. `DemandesOverviewView.tsx` - Liste demandes
2. `ChantiersListView.tsx` - Liste chantiers
3. `AlertsListView.tsx` - Liste alertes
4. `BlockedListView.tsx` - Liste dossiers bloqués
5. Tableaux dans `GovernanceView.tsx`

#### Métriques Before/After
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Temps rendu 1000 items | ~10s | <2s | ? |
| Memory usage 1000 items | ~250MB | <50MB | ? |
| FPS scroll | ~15 | >60 | ? |

---

### PR #03 : Tests Services & Domain
**Branch**: `test/add-services-domain-tests`  
**Statut**: ❌ À faire

#### Services à Tester
1. `validation-bc-api.ts` - Tests API
2. `rhBusinessRules.ts` - Tests règles RH
3. `calendarValidationService.ts` - Tests calendrier
4. `policy-engine.ts` - Tests délégations
5. `domain/demandes/services/*.ts` - Tests domain demandes

#### Métriques Before/After
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Couverture globale | <5% | >70% | ? |
| Couverture services | 0% | >80% | ? |
| Tests unitaires | 11 | 50+ | ? |

---

## 🚀 PHASE 2 : AMÉLIORATIONS AVANCÉES

### 1. Workflow Déclaratif
**Branch**: `feat/declarative-workflow-engine`  
**Statut**: ❌ À faire

#### Description Métier
Créer un moteur de workflow déclaratif permettant de définir des processus métier (validation BC, demande RH, etc.) via configuration JSON/YAML plutôt que code.

#### Plan Technique
- Créer `src/lib/workflow/engine.ts` - Moteur d'exécution
- Créer `src/lib/workflow/types.ts` - Types workflow
- Créer `src/lib/workflow/builder.ts` - Builder de workflows
- Créer `src/lib/workflow/__tests__/engine.test.ts` - Tests

#### Métriques
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Temps création workflow | ~2 jours | <2h | ? |
| Réutilisabilité | 0% | 80% | ? |

---

### 2. Offline Sync
**Branch**: `feat/offline-sync`  
**Statut**: ❌ À faire

#### Description Métier
Permettre l'utilisation de l'application hors ligne avec synchronisation automatique lors de la reconnexion.

#### Plan Technique
- Intégrer IndexedDB pour stockage local
- Créer `src/lib/offline/sync-manager.ts` - Gestionnaire de sync
- Créer `src/lib/offline/queue.ts` - File d'attente actions
- Créer `src/lib/offline/conflict-resolver.ts` - Résolution conflits

#### Métriques
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Disponibilité offline | 0% | 100% | ? |
| Temps sync reconnexion | N/A | <5s | ? |

---

### 3. RBAC UI
**Branch**: `feat/rbac-ui`  
**Statut**: ❌ À faire

#### Description Métier
Interface utilisateur pour gérer les rôles et permissions (RBAC) avec visualisation des permissions par rôle.

#### Plan Technique
- Créer `src/components/rbac/RoleManager.tsx`
- Créer `src/components/rbac/PermissionMatrix.tsx`
- Créer `src/lib/rbac/ui-helpers.ts` - Helpers UI
- Intégrer dans page paramètres

#### Métriques
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Temps configuration rôle | ~30min | <5min | ? |
| Erreurs permissions | Fréquentes | <1% | ? |

---

### 4. Observabilité
**Branch**: `feat/observability`  
**Statut**: ❌ À faire

#### Description Métier
Système complet d'observabilité : logs structurés, métriques performance, traces, alertes.

#### Plan Technique
- Intégrer Sentry pour erreurs
- Créer `src/lib/observability/logger.ts` - Logger structuré
- Créer `src/lib/observability/metrics.ts` - Collecte métriques
- Créer `src/lib/observability/tracing.ts` - Traces
- Dashboard observabilité

#### Métriques
| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Temps détection erreur | ~1h | <5min | ? |
| Visibilité performance | 20% | 100% | ? |

---

## 📊 CHECKLIST GLOBALE

### Pour Chaque PR
- [ ] Description métier complète
- [ ] Plan technique détaillé
- [ ] Diff simulé
- [ ] Tests unitaires (>80% coverage)
- [ ] Tests Playwright E2E
- [ ] Storybook stories
- [ ] Checklist QA
- [ ] Métriques before/after
- [ ] Rollback plan
- [ ] Documentation

### Non-Régression
- [ ] Tests existants passent
- [ ] UI identique (screenshots)
- [ ] Performance égale ou meilleure
- [ ] Pas de régression fonctionnelle
- [ ] Review code par 2 devs minimum

---

## 🗓️ Planning

### Semaine 1-2 : PR #01 (Extraction)
- J1-2 : Refactoring composants
- J3-4 : Tests unitaires
- J5-6 : Tests E2E
- J7-8 : Documentation & Review

### Semaine 3 : PR #02 (Virtualisation)
- J1-2 : Composant générique
- J3-4 : Application aux listes
- J5 : Tests performance
- J6-7 : Documentation & Review

### Semaine 4-5 : PR #03 (Tests)
- J1-3 : Tests services Validation BC
- J4-5 : Tests services RH
- J6-7 : Tests domain
- J8-9 : Tests E2E workflows
- J10 : CI/CD & Documentation

### Semaine 6-7 : Workflow Déclaratif
- J1-3 : Moteur workflow
- J4-5 : Builder & UI
- J6-7 : Tests & Documentation

### Semaine 8-9 : Offline Sync
- J1-3 : IndexedDB & Sync Manager
- J4-5 : Queue & Conflict Resolver
- J6-7 : Tests & Documentation

### Semaine 10 : RBAC UI
- J1-3 : Composants UI
- J4-5 : Intégration & Tests

### Semaine 11-12 : Observabilité
- J1-3 : Logger & Metrics
- J4-5 : Tracing & Dashboard
- J6-7 : Tests & Documentation

---

## 📝 Notes Importantes

### Priorité Non-Régression
- Chaque PR doit maintenir 100% de compatibilité fonctionnelle
- Tests de régression obligatoires avant merge
- Feature flags pour déploiement progressif

### Communication
- Daily standup pour suivi progression
- Documentation à jour à chaque étape
- Métriques partagées avec équipe

---

**Document créé par**: Cursor AI Assistant  
**Date**: 2025-01-XX  
**Prochaine étape**: Implémentation PR #01

