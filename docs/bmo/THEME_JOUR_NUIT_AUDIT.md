# Audit thème jour/nuit — projet BMO

Le mode jour (clair) et nuit (sombre) doit s'appliquer **partout** dans le projet BMO. Ce document liste les modules/composants à adapter par priorité.

---

## Infrastructure (unifié)

**Source unique du thème** : `useAppStore().darkMode` → `ThemeSync` applique `dark`/`light` sur `<html>` → tous les composants utilisent Tailwind `dark:` pour réagir.

| Élément | Fichier | Statut |
|--------|---------|--------|
| ThemeSync | `src/components/shared/ThemeSync.tsx` (monté dans `Providers.tsx`) | ✅ Source unique : `dark`/`light` sur `<html>` selon `useAppStore().darkMode` |
| Variables CSS | `app/globals.css` | ✅ `--bg`, `--surface`, `--text`, `--muted`, `--border` |
| FluentProvider | `src/components/shared/FluentProviderClient.tsx` | ✅ webLightTheme / webDarkTheme |
| ThemeToggle | `src/components/features/bmo/ThemeToggle.tsx` | ✅ Dans BmoTopbar |
| BmoLayoutShell | `src/components/bmo/layout/BmoLayoutShell.tsx` | ✅ Fond, sidebar |
| Règle Cursor | `.cursor/rules/bmo-theme-light-dark.mdc` | ✅ Conventions pour nouveaux composants |

---

## Priorité 1 — Très visible (déjà partiellement traités)

| Zone | Fichiers clés | Statut |
|------|---------------|--------|
| **Topbar / Navigation** | `BmoTopbar.tsx`, `BmoSidebar.tsx` | ✅ Adaptés |
| **Dropdown menus** | `src/components/ui/dropdown-menu.tsx` | ✅ Adapté |
| **Palette commandes** | `DashboardCommandPalette.tsx` | ✅ Adapté |
| **Dashboard Home** | `DashboardHome.tsx`, KPIs, widgets | ✅ Partiellement adapté |
| **Widgets partagés** | `KPICard`, `DashboardPanel`, `CollapsibleSection` | ✅ Adaptés |
| **Governance** | Sidebar, SubNav, Header, pages | ✅ Adaptés |

---

## Priorité 2 — Modules à couvrir

| Module | Chemin | Composants à vérifier |
|--------|--------|------------------------|
| **Calendrier** | `src/modules/calendrier/`, `src/components/features/bmo/calendrier/` | BMOCalendar, modals, vues (Echeances, SLA, VueEnsemble, Conflits) |
| **Chantiers** | `src/modules/`, pages chantiers | Cartes, listes, modals détail |
| **Alertes** | `app/(portals)/maitre-ouvrage/alerts/` | Layout, pages, tableaux |
| **Blocked** | `src/components/features/bmo/workspace/blocked/` | AlertDetailModal, listes |
| **Validation BC** | `src/components/features/validation-bc/` | BudgetsView, panels |
| **Tickets** | `src/components/features/bmo/workspace/tickets/` | FiltersPanel, command-center |
| **Demandes RH** | `src/components/features/bmo/demandes-rh/` | Modals, vues |
| **Substitution** | `src/components/features/bmo/substitution/` | Modals (Assign, Create, Export, Escalate) |
| **IA** | `src/components/features/bmo/ia/` | IAModuleDetailModal |
| **System logs** | `src/components/features/bmo/system-logs/` | LogDetailModal |
| **Analytics / BTP** | `src/components/features/bmo/analytics/` | Modals, dashboards, charts |

---

## Priorité 3 — Pages et layouts

| Zone | Fichiers | Statut |
|------|----------|--------|
| **Layouts maitre-ouvrage** | `app/(portals)/maitre-ouvrage/*/layout.tsx` | ✅ PortalModuleCleanLayout |
| **Pages cockpit** | `cockpit/`, `cockpit/kpis/`, `cockpit/rapports/` | ✅ |
| **Modals dashboard** | `src/modules/dashboard/components/modals/*.tsx` | ✅ DecisionsEnAttente, BudgetConsomme, CallCompany, EscalateDG, etc. |
| **ChartKit** | `src/modules/dashboard/charts/ChartKit/*.tsx` | À vérifier |

---

## Priorité 4 — Composants UI génériques

| Composant | Fichier | Usage |
|-----------|---------|-------|
| Dialog | `src/components/ui/dialog.tsx` | Base des modals |
| Select | `src/components/ui/select.tsx` | Déjà avec dark: |
| Tooltip | `src/components/ui/tooltip.tsx` | Vérifier contenu |
| Command (cmdk) | Si utilisé ailleurs | Palette, etc. |
| Skeleton | `src/components/ui/skeleton.tsx` | Loaders |
| Tables | Composants table | En-têtes, lignes alternées |

---

## Conventions à appliquer

Voir la règle Cursor `.cursor/rules/bmo-theme-light-dark.mdc` :

- Fond : `bg-white dark:bg-slate-900` (ou variantes)
- Bordure : `border-slate-200 dark:border-slate-700`
- Texte : `text-slate-900 dark:text-slate-100`
- Texte secondaire : `text-slate-500 dark:text-slate-400`
- Hover : `hover:bg-slate-100 dark:hover:bg-slate-800`

---

## Ordre recommandé pour les corrections

1. **Composants UI de base** (dialog, tooltip, etc.) — impact global
2. **Modals** (tous les `*Modal.tsx`) — très visibles
3. **Calendrier** — module fréquent
4. **Chantiers** — module central
5. **Autres modules** selon usage

---

*Dernière mise à jour : février 2025*
