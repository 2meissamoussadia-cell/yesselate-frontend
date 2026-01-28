# Analyse des manques — Dashboard (fonctionnalités, composants, modals, patterns)

**Date** : 2026-01-28  
**Périmètre** : Module Dashboard (maître d’ouvrage), registry, vues, modals, patterns.

---

## 1. Vue d’ensemble

| Catégorie | État | Détail |
|-----------|------|--------|
| **Routes / Registry** | ✅ Complet | 129 clés `main::sub::leaf` dans `dashboardRegistry.tsx`, toutes avec loader + render |
| **Vues (pages)** | ⚠️ Partiel | ~70+ vues dans `views/`, beaucoup en squelette (structure seule, peu de logique) |
| **Modals** | ❌ Incomplet | 4 modals dédiés + pas de conteneur global pour les modals du store |
| **Patterns** | ❌ Incohérent | Pas d’ErrorBoundary, KPI/drill-down/export présents seulement sur certaines vues |

---

## 2. Fonctionnalités manquantes ou incomplètes

### 2.1 Données et API

- **Loaders**  
  Les loaders du registry appellent bien les APIs (`loaders.ts`), mais beaucoup de vues :
  - ne consomment pas les données passées par le registry (elles font leur propre `useDashboardData()` ou mock),
  - ou affichent encore des TODOs / listes vides.

- **Gestion d’erreurs**
  - Pas d’**ErrorBoundary** dans `DashboardContentSwitch` ni autour des vues dans `DashboardViewRouter`.
  - Pas de retry systématique (ex. exponential backoff) côté client.
  - Pas de fallback UI dédié pour 429 / rate limit.

- **Export**
  - Bug connu dans `useDashboardExport.ts` (ligne 52) : `createObjectURL` appelé sans argument.
  - Pas de route dédiée `/api/export/reporting` (doc vs implémentation).
  - Pas de streaming pour les gros exports.

### 2.2 Observabilité et qualité

- **Logging**  
  Des `console.log` / `console.error` / `console.warn` subsistent (voir `DASHBOARD_MISSING_FEATURES.md`).
- **Tests**  
  Peu ou pas de tests unitaires pour les vues, hooks (export, permissions), modals.
- **Accessibilité**  
  ARIA, focus dans les modals, navigation clavier non homogènes.

---

## 3. Composants manquants ou à aligner

### 3.1 Registry vs rendu réel

- **`overview::kpis::budget`**  
  Le registry utilise un **render inline** (blocs budget / catégories / tendances) au lieu du composant **`BudgetKpiPage`** (qui lui a barre KPI, filtres, **BudgetDetailModal**).  
  → Incohérence : la route “Budget” n’a pas le même niveau de fonctionnalité que la page dédiée.

- **Vues “squelette”**  
  Beaucoup de pages dans `views/` (ex. `ActionsInboxUrgentesPage`, `ValidationsEnAttentePage`, etc.) ont :
  - structure (layout, KPICards, tableau vide),
  - mais pas de modal de détail au clic sur une ligne,
  - pas toujours d’export CSV/JSON,
  - pas de drill-down KPI vers une modal.

### 3.2 Liste de composants “riches” à généraliser

À calquer sur **DemandesKpiPage** / **BudgetKpiPage** / **HighlightsKpiPage** :

| Fonctionnalité | DemandesKpiPage | BudgetKpiPage | Beaucoup d’autres vues |
|----------------|----------------|--------------|-------------------------|
| Données API (loader + props) | ✅ | ✅ (mock partiel) | ❌ ou partiel |
| KPI tiles cliquables → drill-down | ✅ (openModal kpi-drilldown) | ✅ (BudgetDetailModal) | ❌ |
| Tableau avec `onRowClick` → modal détail | ✅ (BlocageDetailModal) | N/A | ❌ |
| Export CSV/JSON | ✅ | ✅ | ❌ ou partiel |
| Filtre recherche | ✅ | ✅ | ❌ ou partiel |
| Section titre + cartes (SectionTitle, DataCard, etc.) | ✅ | ✅ | Partiel |

Les vues **Actions\***, **Risks\***, **Validations\***, **Decisions\***, **Realtime\***, **Performance\*** (indicateurs, budget détaillé, delays, comparison, compliance, bureaux, trends) sont pour la plupart en squelette par rapport à ce pattern.

### 3.3 Administration

Les routes **administration::\*** (settings, users, permissions, logs) sont dans le registry avec des vues lazy (ex. `AdminSettingsDashboardPage`), mais les composants correspondants peuvent être absents ou très basiques — à vérifier dans `views/` et `admin/`.

---

## 4. Modals manquants et pattern global

### 4.1 Modals existants (dashboard module)

| Modal | Fichier | Utilisé dans |
|-------|---------|---------------|
| AlertDetailModal | `components/AlertDetailModal.tsx` | AlertsActivesPage, AlertsUrgentesPage |
| BlocageDetailModal | `components/modals/BlocageDetailModal.tsx` | DemandesKpiPage |
| BudgetDetailModal | `components/modals/BudgetDetailModal.tsx` | BudgetKpiPage |
| RiskDetailModal | `components/modals/RiskDetailModal.tsx` | HighlightsKpiPage |
| KPIDrillDownModal | `components/KPIDrillDownModal.tsx` | DashboardAdvancedView (et KPIBar selon usage) |
| AlertListModal | `components/modals/AlertListModal.tsx` | (à confirmer selon usage) |

### 4.2 Modals “attendus” par le store mais non rendus globalement

Le **dashboardCommandCenterStore** expose `openModal(type, data)`. Les types utilisés dans le module dashboard sont notamment :

- `kpi-drilldown` — utilisé par DashboardKPIBar, ProjetKpiPage, DemandesKpiPage, HighlightsKpiPage, AchatsKpiPage, OverviewPage.
- `action-detail` / `action-details` — OverviewPage.
- `risk-detail` / `risk-details` — OverviewPage.
- `decision-detail` / `decision-details` — OverviewPage.
- `calendar` — OverviewPage.
- `agenda-details` — OverviewPage.
- `shortcuts` — DashboardFooter.

Or **DashboardCommandCenterPage** ne rend aucun conteneur de modals (pas de composant du type “DashboardModals” qui lit `modal.type` / `modal.isOpen` du store et affiche le bon modal).  
Donc :

- **KPIDrillDownModal** n’est rendu que dans **DashboardAdvancedView** (vue overview). Dès qu’on est sur une autre route et qu’on clique sur un KPI dans la barre globale, `openModal('kpi-drilldown', …)` ne montre rien.
- **Action / Risk / Decision / Calendar / Agenda / Shortcuts** : aucun modal correspondant n’est rendu dans le shell du dashboard.

### 4.3 Modals manquants par domaine

- **Actions**  
  - Modal détail **action** (une tâche / un item de l’inbox) pour les vues Actions (inbox, type, priority, blocked, assigned, history).  
  - Aujourd’hui seule OverviewPage appelle `openModal('action-detail', …)` et rien ne s’affiche.

- **Decisions**  
  - Modal détail **décision** (pending, executed, timeline, audit, modèles).  
  - Idem : `openModal('decision-detail')` sans rendu.

- **Risks**  
  - RiskDetailModal existe et est utilisé dans HighlightsKpiPage.  
  - Pour les vues Risks (critical, warnings, type, analyse, actions correctives), pas de modal détail “risque” centralisé côté dashboard (OverviewPage appelle `openModal('risk-detail', …)` mais pas de conteneur global).

- **Validations**  
  - Pas de modal détail “validation” (item en attente / validée / rejetée / circuit).

- **Performance (budget détaillé, delays, comparison, compliance, bureaux)**  
  - Budget : BudgetDetailModal présent uniquement dans BudgetKpiPage ; pas de modal “ligne budget” ou “projet” depuis d’autres vues.
  - Delays / comparison / compliance / bureaux : pas de modals détail identifiés.

- **Realtime**  
  - Pas de modal détail “alerte” ou “notification” réutilisable dans les vues realtime.

- **Utilitaires**  
  - **Shortcuts** : `openModal('shortcuts')` appelé depuis DashboardFooter, aucun modal raccourcis dans le shell.
  - **Calendar / agenda-details** : pas de modals dans le shell du dashboard.

### 4.4 Pattern manquant : conteneur de modals global

- **Manque** : un composant du type **DashboardModals** (ou équivalent) rendu une seule fois dans **DashboardCommandCenterPage** (ou layout parent), qui :
  - lit `modal.isOpen`, `modal.type`, `modal.data` depuis `useDashboardCommandCenterStore`,
  - appelle `closeModal` pour fermer,
  - selon `modal.type` rend :  
    KPIDrillDownModal, ActionDetailModal, RiskDetailModal, DecisionDetailModal, CalendarModal, AgendaDetailsModal, ShortcutsModal, etc.
- Sans ce conteneur, tous les `openModal(...)` depuis la barre KPI, le footer ou OverviewPage restent sans effet dès qu’on n’est pas dans une vue qui rend elle‑même le modal (ex. BudgetKpiPage, HighlightsKpiPage).

---

## 5. Patterns manquants ou incohérents

### 5.1 ErrorBoundary

- Aucun ErrorBoundary dans :
  - `DashboardContentSwitch`,
  - `DashboardViewRouter`,
  - les wrappers de vues.
- Conséquence : une erreur dans une vue fait planter tout le bloc contenu sans message de repli ni bouton “Réessayer”.

**Souhaité** :  
- ErrorBoundary autour du rendu de la vue courante (dans DashboardContentSwitch ou ViewRouter).  
- Optionnel : ErrorBoundary par vue pour isoler les erreurs.

### 5.2 Vue “complète” (référence DemandesKpiPage / BudgetKpiPage)

Pattern à appliquer partout où c’est pertinent :

1. **Données**  
   - Utiliser les données du loader du registry (passées en props) ou un hook `useDashboardData<T>()` branché sur la même API que le loader.
2. **Structure**  
   - `DashboardPageLayout` → `DashboardSection` → titre + `DashboardPanel` / grille.
   - KPI tiles (KPICard / KpiStatCard) avec `onClick` → drill-down (openModal `kpi-drilldown` ou modal métier).
3. **Listes/tableaux**  
   - Tableau ou liste avec `onRowClick` → ouvrir un modal de détail (ex. BlocageDetailModal, ActionDetailModal).
4. **Export**  
   - Boutons Export CSV/JSON (et si possible PDF/Excel) avec `exportToCSV` / `exportToJSON` (ou API export).
5. **Filtres**  
   - Au moins un champ recherche (SearchFilter) pour les vues avec liste.
6. **États**  
   - Loading (skeleton), erreur (EmptyState + message), vide (EmptyState).

Aujourd’hui ce pattern est respecté surtout sur Overview, KPIs (partiellement), Alerts, et partiellement Budget/Demandes/Highlights. Les autres vues (Actions, Risks, Decisions, Realtime, Performance détaillé, Administration) en sont loin.

### 5.3 Barre KPI globale et drill-down

- **DashboardKPIBar** appelle `openModal('kpi-drilldown', { kpi, kpiId })`.
- Aucun composant dans le shell ne réagit à ce type de modal.
- **Souhaité** :  
  - Soit un conteneur global de modals qui rend **KPIDrillDownModal** quand `modal.type === 'kpi-drilldown'`,  
  - Soit documenter que le drill-down KPI ne fonctionne que sur la vue “Dashboard principal” (DashboardAdvancedView).

### 5.4 Double système de routage (registry vs loadComponent)

- **DashboardContentSwitch** utilise **dashboardRegistry** (loaders + render) et donc les vues définies dans le registry.
- **DashboardViewRouter** utilise **getRouteComponent** + **loadComponent** (config / JSON) et charge des composants par nom.
- Les deux mécanismes peuvent coexister selon l’endroit où on utilise DashboardContentSwitch vs DashboardViewRouter, mais il faut une convention claire : quelle est la source de vérité pour “quelle URL → quelle vue” (registry vs config/loadComponent) pour éviter des incohérences (ex. overview/kpis/budget qui ne rend pas BudgetKpiPage).

### 5.5 simpleRegistry vs dashboardRegistry

- **simpleRegistry.tsx** ne couvre qu’un sous-ensemble de routes (commentaire “autres entrées à convertir au fil de l’eau”).
- **dashboardRegistry.tsx** est la référence (129 entrées).
- Risque : code qui s’appuie sur simpleRegistry pour certaines routes et ne les trouve pas, ou comportement différent selon le chemin de rendu.

---

## 6. Synthèse des priorités

### Priorité 1 — Critique

1. **Conteneur de modals global**  
   Ajouter un composant (ex. DashboardModals) dans le shell du dashboard qui rend au minimum :  
   `kpi-drilldown` → KPIDrillDownModal, `shortcuts` → ShortcutsModal, et idéalement action-detail, risk-detail, decision-detail, calendar, agenda-details.
2. **Correction bug export**  
   `useDashboardExport.ts` : `createObjectURL(blob)` au lieu de `createObjectURL` sans argument.
3. **ErrorBoundary**  
   Au moins un ErrorBoundary autour du contenu rendu par DashboardContentSwitch / DashboardViewRouter.

### Priorité 2 — Important

4. **Aligner overview::kpis::budget**  
   Utiliser **BudgetKpiPage** dans le registry pour cette clé au lieu du render inline, pour avoir filtres, modals et export.
5. **Modals détail par domaine**  
   - ActionDetailModal (Actions),  
   - DecisionDetailModal (Decisions),  
   - ValidationDetailModal (Validations),  
   - et les brancher dans le conteneur global + dans les vues (onRowClick / onClick).
6. **Remplacer console.***  
   Utiliser le logger unifié partout (voir liste dans DASHBOARD_MISSING_FEATURES.md).

### Priorité 3 — Amélioration

7. **Enrichir les vues squelette**  
   Pour Actions, Risks, Decisions, Realtime, Performance (indicators, budget, delays, comparison, compliance, bureaux, trends), appliquer le pattern “vue complète” (données, tableau + onRowClick → modal, export, filtre).
8. **Tests**  
   Tests unitaires pour hooks (export, permissions), modals, et au moins une vue de référence (DemandesKpiPage ou BudgetKpiPage).
9. **Documentation**  
   Quelle route est servie par le registry vs par loadComponent ; quels types de modals sont gérés et où ils sont rendus.

---

## 7. Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/modules/dashboard/registry/dashboardRegistry.tsx` | Définition des 129 vues (loader + render). |
| `src/modules/dashboard/components/DashboardCommandCenterPage.tsx` | Shell principal ; **aucun rendu de modals global**. |
| `src/modules/dashboard/components/DashboardViewRouter.tsx` | Routage par nom de composant (loadComponent). |
| `src/modules/dashboard/components/DashboardContentSwitch.tsx` | Routage par registry (loader + cache). |
| `src/lib/stores/dashboardCommandCenterStore.ts` | Navigation + `openModal` / `closeModal` / `modal`. |
| `src/modules/dashboard/components/views/DemandesKpiPage.tsx` | Référence “vue complète” (modal, export, drill-down). |
| `src/modules/dashboard/components/views/BudgetKpiPage.tsx` | Référence “vue complète” avec BudgetDetailModal. |
| `src/modules/dashboard/components/modals/*.tsx` | AlertListModal, BlocageDetailModal, BudgetDetailModal, RiskDetailModal. |

---

**Statut** : Analyse à jour au 2026-01-28 ; à réviser après ajout du conteneur de modals et des ErrorBoundaries.
