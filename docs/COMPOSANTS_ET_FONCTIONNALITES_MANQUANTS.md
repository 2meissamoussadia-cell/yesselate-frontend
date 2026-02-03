# Composants et fonctionnalités manquants — BMO

Synthèse des composants et fonctionnalités identifiés comme manquants ou incomplets dans la base de code et la documentation existante.

**Sources** : `DASHBOARD_MISSING_COMPONENTS.md`, `DASHBOARD_MISSING_FEATURES.md`, `FIL_CONDUCTEUR_MODULES_BMO.md`, `ANALYSE_COHERENCE_INTERFACE_MODULES.md`.

---

## 1. Composants Dashboard manquants (~130+)

Les routes sont définies dans `dashboardNavigationConfig` mais les **composants de page** correspondants n’existent pas encore.

### Priorité 1 — Critique

| Composant | Route / ID |
|-----------|------------|
| `AlertsActivesPage` | overview::alerts::actives |
| `AlertsUrgentesPage` | overview::alerts::urgentes |
| `ActivityTimelinePage` | overview::activity::timeline |
| `ActivityNotificationsPage` | overview::activity::notifications |
| `ValidationsEnAttentePage` | performance::validation::en-attente |
| `ValidationsValideesPage` | performance::validation::validees |
| `ValidationsRejeteesPage` | performance::validation::rejetees |
| `ValidationsCircuitPage` | performance::validation::circuit |
| `BudgetConsommationPage`, `BudgetRestantPage`, `BudgetPrevisionsPage`, `BudgetAnalysePage` | performance::budget::* |
| `ActionsInboxUrgentesPage`, `ActionsInboxAujourdhuiPage`, `ActionsInboxSemainePage` | actions::inbox::* |
| `RisksCriticalRisquesPage`, `RisksCriticalAlertesPage` | risks::critical::* |

### Priorité 2 — Important

| Composant | Route / ID |
|-----------|------------|
| `PerformanceSynthesePage`, `PerformanceProjetsPage`, `PerformanceDemandesPage`, `PerformanceBudgetPage` | performance::indicators::* |
| `DelaysCritiquesPage`, `DelaysMoyensPage`, `DelaysAnalyseCausesPage` | performance::delays::* |
| `StocksOverviewPage`, `StocksTrendsPage` | performance::stocks::* |
| `MaterielOverviewPage` | performance::materiel::overview |
| `ComplianceDashboardPage`, `ComplianceDocumentsPage`, `ComplianceBacklogPage`, `ComplianceLotsPage` | performance::compliance::* |
| `BureauxAllPage`, `BureauxBmoPage`, … (par bureau) | performance::bureaux::* |
| `ActionsBlockedBlocagesPage`, `ActionsBlockedEscaladesPage`, `ActionsBlockedAnalysePage` | actions::blocked::* |
| `RisksWarningsMoyensPage`, `RisksType*Page`, `RisksAnalyse*Page` | risks::* |

### Priorité 3 — Nice to have

- **Decisions** : Pending, Executed, Timeline, Audit, Modèles (~15 pages).
- **Realtime** : Monitoring, Alerts, Notifications, Sync (~12 pages).
- **Administration** : Settings, Users, Permissions, Logs (~9 pages).
- **Comparison** : Bureaux, Projets, Période, Benchmarking.
- **Trends** : Mensuelles, Trimestrielles, Annuelles.

**Référence complète** : [docs/DASHBOARD_MISSING_COMPONENTS.md](./DASHBOARD_MISSING_COMPONENTS.md).

---

## 2. Fonctionnalités manquantes ou incomplètes

### Bugs / corrections critiques

- **useDashboardExport.ts** : `window.URL.createObjectURL` appelé sans argument (ligne 52) — doit être `createObjectURL(blob)`.
- **console.log / error / warn** : encore présents dans plusieurs fichiers (export, ViewRouter, permissions, modals, routeValidation, navigation context, useKPIFilter) — à remplacer par un logging unifié.

### Gestion d’erreurs

- **ErrorBoundary** : absent sur `DashboardContentSwitch`, `DashboardViewRouter` et les vues (BudgetKpiPage, DemandesKpiPage, etc.).
- **API** : pas de retry systématique, pas de fallback UI pour erreurs réseau, pas de gestion 429 (retry-after).

### Registry / navigation

- **simpleRegistry** : pas toutes les routes du `dashboardRegistry` ; commentaire « autres entrées à convertir au fil de l’eau » — à compléter ou documenter.

### Exports

- Route `/api/export/reporting` mentionnée en doc mais pas de route dédiée (seul `/api/export/dashboard` existe).
- Export PDF/Excel à vérifier côté serveur.
- Pas de streaming pour gros exports.

### Tests

- **Unitaires** : manquants pour modals, SummaryPointsPage, useDashboardExport, useDashboardPermissions, routeNavigation, getAuthHeaders.
- **E2E** : pas de tests navigation swipe, modals, export.

### Observabilité

- Métriques Prometheus, traces OpenTelemetry, health `/api/health` mentionnés en checklist — à vérifier / implémenter.

### Performance

- ISR / Edge caching, code splitting par route, prefetching, virtualisation des listes — non implémentés ou partiels.

### Accessibilité (A11y)

- ARIA labels manquants sur modals, navigation clavier non documentée, gestion du focus dans modals, support screen reader — audit recommandé.

**Référence** : [docs/DASHBOARD_MISSING_FEATURES.md](./DASHBOARD_MISSING_FEATURES.md).

---

## 3. Modules métier / fil conducteur manquants

Au regard du **fil conducteur BTP** (phases 0–10), les éléments suivants sont **à créer** ou **à enrichir**.

### Modules à créer

| Module | Phase(s) | Contenu principal |
|--------|----------|-------------------|
| **Pré‑projet & Opportunité** | 0 | Fiches opportunité, étude d’opportunité, GO/NOGO, budget enveloppe |
| **Foncier & Due diligence** | 1 | Dossier foncier, diagnostics (structure, élec, plomberie), G1, réseaux |
| **Programmation** | 2 | Programme fonctionnel + technique, cibles performance |
| **Autorisations** | 4 | Permis de construire, DEEC, DROC, attestations assurances |
| **Exploitation & Maintenance** | 10 | GPA / biennale / décennale, plan de maintenance, registres |

### Modules à enrichir (sans changer le nom)

| Module | Enrichissements |
|--------|------------------|
| **Cockpit DG** | Bloc « Projets en pré‑projet », budget enveloppe, lien Gate #0 |
| **Chantiers & Programmes** | Méthodes/PEX, installation chantier, avancement par lot, statut « Livré », handover |
| **Documents & Contrats** | Typo : Études (ESQ/APS/APD), DCE, Autorisations (PC, DEEC, DROC), Réceptions (PV), DOE |
| **Engagements & Finances** | Lien BPU / budget prévisionnel ; commandes ↔ chantiers |
| **Qualité & Réserves** | Réserves par phase (GO, SO), checklist tests, GPA / biennale / décennale, échéances garanties |
| **Gouvernance & Arbitrage** | Gates #0 à #10 (décisions GO/NOGO, validation programme, gel APD, permis OK, attribution, visa PEX, réception, clôture) |

**Référence** : [docs/bmo/FIL_CONDUCTEUR_MODULES_BMO.md](./bmo/FIL_CONDUCTEUR_MODULES_BMO.md).

---

## 4. Cohérence interface (design / layout)

- **Design tokens** : plusieurs systèmes (dashboard, application, alertes) ; couleurs en dur (~2462 occurrences slate-9xx) — unifier et centraliser.
- **Modales** : trois conventions (open/onClose, isOpen/onClose, Dialog open/onOpenChange) — harmoniser une seule API.
- **Layout** : pas de **WorkspaceLayout** commun ; chaque module recopie header + subnav + contenu — définir un layout commun avec slots.

**Référence** : [docs/ANALYSE_COHERENCE_INTERFACE_MODULES.md](./ANALYSE_COHERENCE_INTERFACE_MODULES.md).

---

## 5. Priorisation synthétique

| Priorité | Type | Exemples d’actions |
|----------|------|--------------------|
| **P1** | Bugs | Corriger `useDashboardExport.ts`, retirer console.* |
| **P1** | Robustesse | ErrorBoundary sur toutes les vues dashboard |
| **P1** | Dashboard | Composants Overview Alerts/Activity, Performance Validation/Budget, Actions Inbox, Risks Critical |
| **P2** | Fonctionnalités | Compléter registry, exports (reporting, streaming), retry API |
| **P2** | Dashboard | Performance (Delays, Stocks, Compliance, Bureaux), Actions Blocked, Risks analyse |
| **P2** | Métier | Créer Pré‑projet, Foncier, Programmation, Autorisations, Exploitation & Maintenance |
| **P3** | Qualité | Tests (hooks, utils, modals, E2E), observabilité, A11y |
| **P3** | Dashboard | Decisions, Realtime, Administration, Comparison, Trends |
| **P3** | UX | Design tokens unifiés, WorkspaceLayout, API modales unifiée |

---

*Dernière mise à jour : 2026-02-03*
