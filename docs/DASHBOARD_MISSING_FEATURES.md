# Fonctionnalités Manquantes et Améliorations - Dashboard

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

#### ErrorBoundary manquant
- `DashboardContentSwitch` n'a pas d'ErrorBoundary
- `DashboardViewRouter` a une gestion basique mais pas d'ErrorBoundary React
- Les composants de vues (BudgetKpiPage, DemandesKpiPage, etc.) n'ont pas d'ErrorBoundary

**Solution** : Ajouter ErrorBoundary autour de chaque composant de vue

#### Gestion d'erreurs API
- Pas de retry automatique dans certains hooks
- Pas de fallback UI pour les erreurs réseau
- Pas de gestion d'erreurs 429 (rate limit) avec retry-after

### 2. Registry Incomplet

#### `simpleRegistry.tsx`
- Commentaire "… autres entrées à convertir au fil de l'eau" (ligne 182)
- Pas toutes les routes du `dashboardRegistry.tsx` sont dans `simpleRegistry.tsx`

**Action** : Compléter le registry ou documenter pourquoi certaines routes sont manquantes

### 3. Exports Incomplets

#### Route API manquante
- Documentation mentionne `/api/export/reporting` (PR_P7_REPORTING_DIRECTION.md ligne 218)
- Route `/api/export/dashboard` existe mais pas de route dédiée pour reporting

#### Formats d'export
- Export CSV/JSON fonctionnel
- Export PDF/Excel mentionné mais à vérifier côté serveur
- Pas de streaming pour gros exports

### 4. Tests Manquants

#### Tests unitaires
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

#### Problèmes identifiés
- Pas d'ARIA labels sur les modals
- Pas de navigation clavier documentée
- Pas de gestion du focus dans les modals
- Pas de support screen reader

**Action** : Audit d'accessibilité complet

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
- [ ] Créer un composant ErrorBoundary réutilisable

### 2. Fonctionnalités

#### Exports
- [ ] Implémenter `/api/export/reporting`
- [ ] Ajouter streaming pour gros exports
- [ ] Ajouter preview avant export
- [ ] Ajouter historique des exports

#### Gestion d'erreurs
- [ ] Ajouter ErrorBoundary partout
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
- [ ] Ajouter ErrorBoundary dans `DashboardContentSwitch`
- [ ] Ajouter ErrorBoundary dans chaque composant de vue
- [ ] Compléter `simpleRegistry.tsx`
- [ ] Implémenter `/api/export/reporting`
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
