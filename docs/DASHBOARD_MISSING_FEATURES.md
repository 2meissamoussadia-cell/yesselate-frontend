# Fonctionnalités Manquantes et Améliorations - Dashboard

## ✅ Réalisé récemment

- **ErrorBoundary** : Intégré dans `DashboardViewRouter` (chemins registry + composant dynamique) et dans `DashboardShell` autour du contenu principal. Tests unitaires dans `__tests__/components/ErrorBoundary.test.tsx`.
- **Route `/api/export/reporting`** : Alias implémenté (`app/api/export/reporting/route.ts`) qui réexporte `GET` depuis `/api/export/dashboard`.
- **Registry** : Alias ajoutés dans `registryKeyResolver.ts` pour les routes pilotage sans leaf (gouvernance, calendrier, alertes, hse) → vue default. Tests dans `src/modules/dashboard/utils/__tests__/registryKeyResolver.test.ts`.
- **Accessibilité** : Lien d’évitement « Aller au contenu principal » (composant `SkipLink`), `id="dashboard-main-content"` sur la zone de contenu, `aria-label` sur `<main>`.

---

## 🔍 Analyse Complète

Après analyse approfondie, voici les fonctionnalités manquantes et aspects à améliorer :

---

## 🐛 Bugs Critiques

### 1. Bug dans `useDashboardExport.ts` (ligne 52)
**Problème** : `window.URL.createObjectURL` est appelé sans argument
```typescript
// ❌ Actuel (ligne 52)
const urlObj = window.URL.createObjectURL;

// ✅ Devrait être
const urlObj = window.URL.createObjectURL(blob);
```

### 2. console.log/error/warn encore présents
**Fichiers concernés** :
- `useDashboardExport.ts` (ligne 63)
- `DashboardViewRouter.tsx` (lignes 165, 257)
- `useDashboardPermissions.ts` (ligne 58)
- `AlertDetailModal.tsx` (lignes 61, 74, 87)
- `routeValidation.ts` (ligne 69)
- `DashboardNavigationContext.tsx` (lignes 35, 40, 45)
- `useKPIFilter.ts` (lignes 49, 72)

**Action** : Remplacer tous par le système de logging unifié

---

## ⚠️ Fonctionnalités Manquantes

### 1. Gestion d'Erreurs Incomplète

#### ErrorBoundary (✅ réalisé)
- ~~`DashboardContentSwitch` n'a pas d'ErrorBoundary~~ → ErrorBoundary autour de `DashboardContentSwitch` dans `DashboardViewRouter` et autour du rendu dynamique (Component).
- ~~`DashboardViewRouter` a une gestion basique mais pas d'ErrorBoundary React~~ → ErrorBoundary React intégré ; ErrorBoundary global dans `DashboardShell` autour du contenu.
- Tests : `__tests__/components/ErrorBoundary.test.tsx`.

#### Gestion d'erreurs API
- Pas de retry automatique dans certains hooks
- Pas de fallback UI pour les erreurs réseau
- Pas de gestion d'erreurs 429 (rate limit) avec retry-after

### 2. Registry

#### Alias (✅ réalisé)
- Alias dans `registryKeyResolver.ts` pour pilotage sans leaf (gouvernance, calendrier, alertes, hse) → vue default. Tests : `src/modules/dashboard/utils/__tests__/registryKeyResolver.test.ts`.

#### `simpleRegistry.tsx`
- Commentaire "… autres entrées à convertir au fil de l'eau" (ligne 182)
- Pas toutes les routes du `dashboardRegistry.tsx` sont dans `simpleRegistry.tsx`

**Action** : Compléter le registry ou documenter pourquoi certaines routes sont manquantes

### 3. Exports Incomplets

#### Route API (✅ réalisé)
- Route `/api/export/reporting` : alias implémenté (`app/api/export/reporting/route.ts`) réexportant `GET` depuis `/api/export/dashboard`.
- Route `/api/export/dashboard` existe et reste la source.

#### Formats d'export
- Export CSV/JSON fonctionnel
- Export PDF/Excel mentionné mais à vérifier côté serveur
- Pas de streaming pour gros exports

### 4. Tests

#### Tests unitaires (partiel ✅)
- ✅ ErrorBoundary : `__tests__/components/ErrorBoundary.test.tsx`
- ✅ registryKeyResolver : `src/modules/dashboard/utils/__tests__/registryKeyResolver.test.ts`
- Pas de tests pour les nouveaux composants (modals, SummaryPointsPage)
- Pas de tests pour les hooks (useDashboardExport, useDashboardPermissions)
- Pas de tests pour les utilitaires (routeNavigation, getAuthHeaders)

#### Tests E2E
- Pas de tests de navigation swipe gestures
- Pas de tests de modals
- Pas de tests d'export

**Roadmap mentionnée** : "Tests unitaires et E2E" (README.md ligne 222)

### 5. Observabilité Incomplète

#### Métriques Prometheus
- Mentionné dans POST_DEPLOYMENT_CHECKLIST.md (ligne 285)
- Pas d'implémentation visible

#### Traces OpenTelemetry
- Mentionné dans POST_DEPLOYMENT_CHECKLIST.md (ligne 287)
- Pas d'implémentation visible

#### Health checks
- Endpoint `/api/health` mentionné (POST_DEPLOYMENT_CHECKLIST.md ligne 288)
- À vérifier si implémenté

### 6. Performance

#### ISR/Edge caching
- Mentionné dans README.md (ligne 223)
- Pas d'implémentation

#### Optimisations possibles
- Pas de code splitting par route
- Pas de prefetching des routes suivantes
- Pas de virtualisation pour grandes listes

### 7. Accessibilité (A11y)

#### Réalisé
- Lien d’évitement « Aller au contenu principal » (SkipLink) dans `DashboardShell`, cible `#dashboard-main-content`.
- `aria-label` sur `<main>` et sur la zone de contenu ; KPIBar (export, refresh) a déjà des aria-labels.

#### À faire
- Pas d'ARIA labels sur les modals
- Pas de navigation clavier documentée
- Pas de gestion du focus dans les modals

**Action** : Audit d'accessibilité complet (modals, focus, screen reader)

### 8. Documentation

#### Documentation manquante
- Pas de guide d'utilisation pour les développeurs
- Pas de documentation API pour les hooks
- Pas de guide de contribution
- Pas de changelog détaillé

---

## 🔧 Améliorations Suggérées

### 1. Qualité du Code

#### Nettoyage
- [ ] Remplacer tous les `console.log/error/warn` restants
- [ ] Corriger le bug dans `useDashboardExport.ts`
- [ ] Ajouter des types stricts partout
- [ ] Ajouter des JSDoc pour toutes les fonctions publiques

#### Refactoring
- [ ] Extraire la logique d'export dans un service dédié
- [ ] Centraliser la gestion d'erreurs
- [x] Créer un composant ErrorBoundary réutilisable (existant : `@/components/shared/ErrorBoundary`, intégré dans ViewRouter + Shell)

### 2. Fonctionnalités

#### Exports
- [x] Implémenter `/api/export/reporting` (alias vers `/api/export/dashboard`)
- [ ] Ajouter streaming pour gros exports
- [ ] Ajouter preview avant export
- [ ] Ajouter historique des exports

#### Gestion d'erreurs
- [x] Ajouter ErrorBoundary partout (ViewRouter + Shell ; tests ErrorBoundary.test.tsx)
- [ ] Implémenter retry avec exponential backoff partout
- [ ] Ajouter fallback UI pour chaque type d'erreur
- [ ] Ajouter gestion 429 avec retry-after

#### Performance
- [ ] Implémenter ISR/Edge caching
- [ ] Ajouter code splitting par route
- [ ] Implémenter prefetching
- [ ] Ajouter virtualisation pour listes

### 3. Tests

#### Tests unitaires
- [ ] Tests pour tous les hooks
- [ ] Tests pour tous les utilitaires
- [ ] Tests pour tous les composants

#### Tests E2E
- [ ] Tests de navigation
- [ ] Tests de modals
- [ ] Tests d'export
- [ ] Tests de swipe gestures

### 4. Observabilité

#### Métriques
- [ ] Implémenter métriques Prometheus
- [ ] Ajouter dashboard Grafana
- [ ] Ajouter alertes

#### Traces
- [ ] Implémenter traces OpenTelemetry
- [ ] Ajouter correlation IDs
- [ ] Ajouter spans pour chaque opération

### 5. Accessibilité

#### A11y
- [ ] Audit complet avec axe-core
- [ ] Ajouter ARIA labels partout
- [ ] Implémenter navigation clavier
- [ ] Tester avec screen readers

### 6. Documentation

#### Guides
- [ ] Guide de développement
- [ ] Guide d'utilisation
- [ ] Guide de contribution
- [ ] Documentation API complète

---

## 📊 Priorisation

### 🔴 Critique (À faire immédiatement)
1. Corriger bug `useDashboardExport.ts`
2. Remplacer tous les `console.log` restants
3. Ajouter ErrorBoundary partout
4. Compléter le registry

### 🟡 Important (Cette semaine)
5. Implémenter `/api/export/reporting`
6. Ajouter tests unitaires de base
7. Améliorer gestion d'erreurs
8. Audit accessibilité

### 🟢 Amélioration (Prochaine itération)
9. Implémenter ISR/Edge caching
10. Ajouter métriques Prometheus
11. Implémenter traces OpenTelemetry
12. Documentation complète

---

## ✅ Checklist de Complétion

### Bugs
- [ ] Corriger `useDashboardExport.ts` ligne 52
- [ ] Remplacer `console.log` dans `useDashboardExport.ts`
- [ ] Remplacer `console.log` dans `DashboardViewRouter.tsx`
- [ ] Remplacer `console.log` dans `useDashboardPermissions.ts`
- [ ] Remplacer `console.error` dans `AlertDetailModal.tsx`
- [ ] Remplacer `console.warn` dans `routeValidation.ts`
- [ ] Remplacer `console.warn` dans `DashboardNavigationContext.tsx`
- [ ] Remplacer `console.warn` dans `useKPIFilter.ts`

### Fonctionnalités
- [x] Ajouter ErrorBoundary dans `DashboardContentSwitch` (via DashboardViewRouter)
- [ ] Ajouter ErrorBoundary dans chaque composant de vue (optionnel, couvert par Shell)
- [ ] Compléter `simpleRegistry.tsx`
- [x] Implémenter `/api/export/reporting` (alias vers `/api/export/dashboard`)
- [ ] Ajouter retry automatique partout
- [ ] Ajouter fallback UI pour erreurs

### Tests
- [ ] Tests pour hooks
- [ ] Tests pour utilitaires
- [ ] Tests pour composants
- [ ] Tests E2E navigation
- [ ] Tests E2E modals

### Observabilité
- [ ] Métriques Prometheus
- [ ] Traces OpenTelemetry
- [ ] Health checks

### Accessibilité
- [ ] Audit A11y
- [ ] ARIA labels
- [ ] Navigation clavier
- [ ] Support screen reader

### Documentation
- [ ] Guide développement
- [ ] Guide utilisation
- [ ] Documentation API
- [ ] Changelog

---

**Date de création** : 2026-01-27  
**Statut** : 🔴 Analyse complète - Actions prioritaires identifiées
