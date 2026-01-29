# Analyse de cohérence — Modules d’interface YESSALATE BMO

**Date** : Janvier 2025  
**Périmètre** : Portail maître d’ouvrage, dashboard, workspaces, modales, design tokens, layout.

---

## 1. Synthèse exécutive

L’interface repose sur **plusieurs sources de vérité** (design tokens, layouts, patterns de modales) et **plusieurs shells** (BMOAppShell, Dashboard, pages fullscreen). La cohérence est **partielle** : bonnes bases (dashboard tokens, confinement horizontal récent), mais **incohérences** à corriger pour un comportement type « logiciel métier » (Odoo-like) sur toute l’app.

**Priorités** :
1. Unifier les design tokens et leur usage.
2. Standardiser le layout (viewport, overflow) sur toutes les pages.
3. Harmoniser les APIs des modales et des panneaux.
4. Documenter et appliquer un pattern unique pour les pages du portail.

---

## 2. Design tokens et couleurs

### 2.1 Plusieurs systèmes coexistants

| Source | Fichier | Format | Usage |
|--------|---------|--------|--------|
| **Dashboard** | `src/modules/dashboard/utils/dashboardDesignTokens.ts` | Classes Tailwind (`bg-slate-950`, `border-slate-800/60`) | ~66 fichiers (vues dashboard, cockpit, shared) |
| **Application** | `src/application/utils/designTokens.ts` | Valeurs brutes (hex, rem) | Couleurs, espacements, z-index, typo |
| **Alertes** | `src/modules/alertes/design/design-tokens.json` | JSON (couleurs, sémantiques) | Module alertes |

**Incohérences** :
- Le dashboard utilise des **classes** (slate-950, slate-900/40) ; l’application des **valeurs** (hex). Pas de mapping commun.
- Les composants hors dashboard (workspaces, modales) utilisent souvent des classes en dur (`bg-slate-900`, `border-slate-700/50`) au lieu d’importer les tokens dashboard ou application.
- **~2462 occurrences** de `bg-slate-950`, `bg-slate-900`, `border-slate-800` en dur dans `src/**/*.tsx` : forte dépendance aux couleurs Tailwind non centralisées.

### 2.2 Recommandations

- **Court terme** : Utiliser systématiquement `dashboardDesignTokens` (colors, spacing, borderRadius) dans tous les composants du dashboard et des workspaces BMO.
- **Moyen terme** : Unifier dans un seul fichier (ou réexport) : palette + espacements + rayons + ombres. Les composants n’utilisent que ce module.
- **Option** : Un script (ou règle lint) qui signale l’usage de `bg-slate-9xx` / `border-slate-8xx` en dehors du fichier de tokens.

---

## 3. Layout et viewport (cadre horizontal)

### 3.1 Ce qui a été fait (confinement horizontal)

- **Racine** : `html`, `body` avec `overflow-x: hidden`, `max-width: 100vw` (globals.css).
- **Classe utilitaire** : `.viewport-contained` (min-width: 0, max-width: 100%, overflow-x: hidden).
- **Layout portail** : `app/(portals)/maitre-ouvrage/layout.tsx` — wrapper `min-w-0 max-w-full overflow-x-hidden` autour de `{children}` ; `main` avec `viewport-contained` et `overflow-x-hidden overflow-y-auto`.
- **Shell** : BMOAppShell (min-w-0, max-w-full, overflow-x-hidden), PageTemplate (overflow-x-hidden sur la zone scrollable), NavigationSidebar (overflow-x-hidden).
- **Dashboard** : DashboardShell, DashboardSidebar, DashboardModulesBar, DashboardContentSwitch, DashboardPageLayout avec min-w-0 / max-w-full / overflow-x-hidden.
- **Pages portail** : Plus de 25 pages avec zones de scroll en `overflow-x-hidden overflow-y-auto`.
- **Vues dashboard** : BudgetKpiPage, DemandesKpiPage, ValidationsGlobalPage, CockpitDG_V2Page + racines avec min-w-0 max-w-full overflow-x-hidden ; DashboardPageLayout avec max-w-full overflow-x-hidden.

### 3.2 Incohérences de structure des pages

- **Pattern majoritaire** (demandes, blocked, validation-bc, etc.) :
  - Conteneur : `flex h-screen ... overflow-hidden`
  - Zone scroll : `h-full overflow-x-hidden overflow-y-auto`
- **Exceptions** :
  - **Dashboard** : pas de `h-screen` sur le conteneur principal ; utilise DashboardShell + sidebar + contenu. OK car hérité du layout.
  - **Paramètres** : `h-full flex flex-col` (pas `min-h-screen`), `main` avec `overflow-x-hidden overflow-y-auto`. Cohérent avec le layout qui fournit la hauteur.
  - **Dépenses / Substitution** : `main` avec `overflow-x-hidden overflow-y-auto min-w-0 max-w-full` (déjà aligné).

- **Pages imbriquées** (validation-bc/*, governance/*, alerts/*) : beaucoup délèguent au layout parent ; certaines ont leur propre `page.tsx` minimal. À vérifier que le wrapper du layout portail s’applique bien (une seule zone de scroll par écran).

### 3.3 Recommandations

- Imposer **un seul pattern** pour les pages du portail (documenté dans un RULE ou README front) :
  - Racine page : `min-w-0 max-w-full overflow-x-hidden` (ou classe `.viewport-contained`).
  - Zone de scroll principale : `overflow-x-hidden overflow-y-auto` (+ min-w-0 si flex).
- Vérifier les **sous-pages** (validation-bc, governance, alerts) : pas de double scroll horizontal, pas de largeur minimale qui dépasse 100vw.
- Conserver les **scrolls horizontaux locaux** (ex. bandeau KPI, breadcrumb long) dans des conteneurs dédiés avec `overflow-x-auto` à l’intérieur d’un parent en `overflow-x-hidden`.

---

## 4. Navigation et shells

### 4.1 Deux contextes de navigation

| Contexte | Sidebar | Largeur (ouverte / réduite) | Contenu principal |
|----------|---------|-----------------------------|-------------------|
| **BMO global** | `NavigationSidebar` (Sidebar.tsx) | 288px / 80px | PageTemplate + enfants (dashboard ou autres pages) |
| **Dashboard** | `DashboardSidebar` | 256px (w-64) / 64px (w-16) | DashboardShell + ViewRouter |

- **Incohérence** : deux sidebars différentes (largeurs, structure) selon que l’on soit sur le dashboard ou sur une autre page du portail. Volontaire (dashboard = sous-ensemble du BMO) mais à documenter pour éviter des attentes « une seule sidebar partout ».

### 4.2 Recommandations

- Documenter clairement : **BMO** = shell global (NavigationSidebar) ; **Dashboard** = sous-application avec sa propre DashboardSidebar.
- S’assurer que les deux sidebars utilisent les **mêmes tokens** (couleurs, bordures) pour l’aspect visuel, même si la structure diffère.

---

## 5. Modales et panneaux

### 5.1 APIs de modales hétérogènes

- **open / onClose** : SystemLogsModals, IncidentDetailModal, BlockedModals, etc.
- **isOpen / onClose** : GenericDetailModal, EmployeeDetailModal, ArbitrageDetailModal, etc.
- **Dialog (Radix/shadcn) open / onOpenChange** : PaiementValidationModal, PaiementDetailsModal, BlockedResolutionModal, BlockedDossierDetailsModal.

**Incohérence** : trois conventions différentes pour « ouvert » et « fermer ». Complique la réutilisation et les tests.

### 5.2 Styles de modales

- **GenericDetailModal** : `bg-white dark:bg-gray-900`, bordures `border-gray-200 dark:border-gray-800`.
- **IncidentDetailModal** (system-logs) : `bg-slate-900`, `border-slate-700/50`.
- **Modales BMO / dashboard** : souvent `bg-slate-900`, `border-slate-800`, `rounded-2xl`.

**Recommandation** : unifier sur le thème sombre BMO (slate-950/900/800) et un composant de base (wrapper) qui impose la même structure (backdrop, conteneur, header, footer) et la même API (ex. `open` + `onClose` ou `isOpen` + `onClose` partout).

### 5.3 Panneaux (panels)

- **DashboardPanel** (dashboard) : `border-slate-800/70`, `bg-slate-950/35`, `rounded-2xl`, padding sm/md/lg. Bien utilisé dans les vues dashboard.
- Workspaces (demandes, blocked, paiements, etc.) : mélange de panels « maison » et de divs avec classes ad hoc.

**Recommandation** : réutiliser un même composant Panel (ou un alias DashboardPanel) partout où on affiche un bloc de contenu type « carte » dans un workspace, avec les mêmes tokens (couleur, bordure, rayon, padding).

---

## 6. Composants partagés

### 6.1 Utilisation intensive dans le dashboard

- **DashboardPageLayout** : utilisé dans la grande majorité des vues (Overview, Performance, Actions, Risks, Decisions, Realtime, Admin, etc.) — **cohérent**.
- **DashboardPanel** : très utilisé ; **DashboardSection**, **DashboardGrid** : idem. Bonne cohérence à l’intérieur du module dashboard.

### 6.2 Peu ou pas utilisés hors dashboard

- Les workspaces (demandes, blocked, validation-bc, paiements, etc.) ont leurs propres **KPIBar**, **SubNavigation**, **CommandPalette**, **Modals**.
- Pas de composant « PageLayout » ou « WorkspaceShell » commun : chaque module recopie une structure du type header + subnav + contenu + modales.

**Recommandation** : définir un **WorkspaceLayout** (ou étendre PageTemplate) avec des slots : header, subnav, content, modals. Chaque module (demandes, blocked, etc.) l’utilise au lieu de recopier la même structure. Réduit la divergence et facilite l’application globale du confinement horizontal.

---

## 7. Tables et listes

- **VirtualizedTable** (shared) : utilisé dans plusieurs contextes.
- Beaucoup de listes en `divide-y divide-slate-800/50` et conteneurs en `overflow-x-hidden overflow-y-auto` — aligné avec le confinement horizontal.
- Certaines vues utilisent des grilles avec `min-w-[...]` (ex. Kanban) : s’assurer que le **parent** a `min-w-0` et `overflow-x-hidden` pour que le scroll horizontal reste local (ou qu’on bascule vers un pattern type modal / page détail plutôt qu’une page qui dépasse).

---

## 8. Checklist de cohérence par module

À valider pour chaque nouveau module ou refonte :

- [ ] **Viewport** : racine de la page en `min-w-0 max-w-full overflow-x-hidden` (ou `.viewport-contained`).
- [ ] **Zone de scroll** : une seule zone principale en `overflow-x-hidden overflow-y-auto` (pas de scroll horizontal au niveau page).
- [ ] **Tokens** : couleurs / espacements / rayons via `dashboardDesignTokens` (ou futur token unifié), pas de classes slate-9xx en dur hors tokens.
- [ ] **Modales** : API unique (ex. `open` + `onClose`) et même style (slate, même wrapper).
- [ ] **Panels** : même composant (ou même tokens) que le reste de l’app.
- [ ] **Navigation** : si sidebar dédiée, largeurs et couleurs alignées avec le reste (documentation).

---

## 9. Fichiers de référence

| Rôle | Fichier |
|------|---------|
| **Tokens (point d’entrée BMO)** | `src/lib/design-tokens.ts` (réexporte dashboard) |
| Tokens dashboard | `src/modules/dashboard/utils/dashboardDesignTokens.ts` |
| Tokens application | `src/application/utils/designTokens.ts` |
| **Règle layout/viewport** | `.cursor/rules/interface-layout-viewport.mdc` |
| **Modal unifiée BMO (open/onClose)** | `src/components/ui/BmoModal.tsx` |
| Layout portail | `app/(portals)/maitre-ouvrage/layout.tsx` |
| Shell BMO | `src/components/bmo/BMOAppShell.tsx` |
| Shell workspaces | `src/components/shared/layouts/CommandCenterShell.tsx` (viewport-safe) |
| PageTemplate | `src/components/navigation/PageTemplate.tsx` |
| Dashboard shell | `src/modules/dashboard/components/shared/DashboardShell.tsx` |
| Wrapper page dashboard | `src/modules/dashboard/components/shared/DashboardPageLayout.tsx` |
| Panel standard | `src/modules/dashboard/components/shared/DashboardPanel.tsx` (utilise les tokens) |
| Utilitaire viewport | `app/globals.css` (`.viewport-contained`) |

---

## 10. Résumé des actions recommandées

1. **Design tokens** : Unifier l’usage (un seul module de référence) et remplacer progressivement les classes slate en dur.
2. **Layout** : Documenter le pattern « viewport-contained + une zone de scroll verticale » et l’appliquer à toutes les pages (y compris sous-pages validation-bc, governance, alerts).
3. **Modales** : Standardiser API (open/onClose ou isOpen/onClose) et style (thème BMO slate) ; un wrapper commun si possible.
4. **Workspaces** : Introduire un WorkspaceLayout partagé (header, subnav, content, modals) pour éviter la duplication de structure.
5. **Navigation** : Documenter la dualité BMO vs Dashboard (sidebars différentes) et aligner visuellement via les mêmes tokens.

Cette analyse peut servir de base à un **plan de convergence** (sprints ou tâches) pour rendre l’ensemble des modules d’interface cohérents et maintenables.
