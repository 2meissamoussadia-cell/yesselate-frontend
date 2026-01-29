# Refonte architecture navigation V2 — Analyse et plan d’implémentation

**Projet** : Cockpit DG NICE RÉNOVATION  
**Date** : Janvier 2026  
**Objectif** : Passer à une architecture navigation scalable, performante et maintenable (niveau entreprise).

---

## 1. Analyse de l’architecture actuelle

### 1.1 Ce qui existe déjà

| Élément | Emplacement | État |
|--------|-------------|------|
| **Sidebar principale** | `src/components/navigation/Sidebar.tsx` | Monolithe ~320 lignes, 7 sections, 3 niveaux, collapsed w-72/w-20 |
| **Config routes** | `src/config/navigation.ts` | 7 sections, 60+ routes, `allPaths`, `resolveBadgeCount` |
| **Types navigation** | `src/types/navigation.ts` | Types BMO (NavSection, NavItem, NavSubItem, SidebarProps, SubNav*) |
| **SubNavigation** | `src/components/navigation/SubNavigation.tsx` | Tabs/filtres/actions contextuels |
| **PageTemplate** | `src/components/navigation/PageTemplate.tsx` | Intègre SubNav + contenu, contexte selon pathname |
| **Shell** | `src/components/bmo/BMOAppShell.tsx` | Utilise Sidebar + PageTemplate, `useAppStore` (sidebarOpen), `useNavigationStore` (pageCounts) |
| **Store navigation** | `src/lib/stores/navigation-store.ts` | `pageCounts`, `navigationHistory`, `pageFilters` |
| **Service routes** | `src/lib/services/navigation.service.ts` | `routeMapping`, `updateNavBadges`, `getActivePageId` |
| **Ancienne sidebar BMO** | `src/components/features/bmo/Sidebar.tsx` | Toujours présente, non utilisée par BMOAppShell |
| **Dashboard (autre flux)** | `src/modules/dashboard/` | Sidebar + registry + navigation.config.json, indépendant du BMO |

### 1.2 Points faibles actuels

- **Sidebar monolithique** : tout dans un seul fichier (header, sections, items, badges, toggle), pas de composants réutilisables.
- **Pas de `lib/navigation`** : la config est dans `src/config/navigation.ts`, pas de `utils`, `constants`, `permissions` dédiés.
- **Pas de hook `useNavigation()`** : logique (activeId, expandedIds, isItemActive) dans le composant ; pas de persistance sections/collapsed.
- **Pas de search Cmd+K** : aucune command palette / recherche globale.
- **Pas de breadcrumbs** : pas de fil d’Ariane dérivé de la config.
- **Pas de favoris / recent** : pas de “star” ni “5 dernières pages”.
- **RBAC** : pas de filtrage des routes par rôle dans la sidebar (uniquement `pageCounts`).
- **Icônes** : émojis en dur (📊, 🏛️…) au lieu de Lucide typé.
- **Persistance** : `sidebarOpen` dans app-store, pas de persistance des sections ouvertes.
- **Tests / Storybook** : pas de tests ni stories sur la navigation.
- **Types** : pas de `NavigationLink | NavigationSection | NavigationDivider`, pas de `RoutePermission`, pas de `NavigationConfig.settings`.

### 1.3 Ce qui est déjà solide

- 7 sections et 60+ routes bien définis.
- Design YESSALATE BMO (slate, orange/amber) et transitions 300 ms.
- ARIA de base (aria-label, aria-expanded, aria-current).
- Badges temps réel via `pageCounts` et `resolveBadgeCount`.
- Sous-menus dépliables (expand/collapse).
- Mode collapsed et intégration dans BMOAppShell.
- SubNavigation contextuelle dans PageTemplate.
- TypeScript strict sur les types existants.

---

## 2. Architecture cible (alignée au prompt)

Adaptation au repo actuel (pas de `src/components/layout` ni `src/lib/navigation` utilisés aujourd’hui) :

```
src/
├── components/
│   └── navigation/
│       ├── Sidebar/
│       │   ├── index.tsx
│       │   ├── Sidebar.tsx              # Container (orchestration)
│       │   ├── SidebarHeader.tsx        # Logo + user + search trigger
│       │   ├── SidebarSearch.tsx        # Champ search (optionnel inline)
│       │   ├── SidebarSection.tsx        # Section avec expand/collapse
│       │   ├── SidebarItem.tsx          # Lien ou groupe
│       │   ├── SidebarBadge.tsx
│       │   ├── SidebarFavorites.tsx      # Liste favoris (optionnel)
│       │   ├── SidebarFooter.tsx         # Toggle collapse
│       │   └── Sidebar.module.css
│       ├── Breadcrumbs/
│       │   ├── index.tsx
│       │   ├── Breadcrumbs.tsx
│       │   └── BreadcrumbItem.tsx
│       ├── NavigationSearch/            # Modal Cmd+K
│       │   ├── index.tsx
│       │   ├── NavigationSearch.tsx
│       │   └── SearchResult.tsx
│       ├── SubNavigation.tsx            # Existant, à garder
│       ├── PageTemplate.tsx             # Existant, à garder
│       └── index.ts
│
├── lib/
│   └── navigation/
│       ├── config.ts                    # Routes (migration depuis src/config/navigation.ts)
│       ├── types.ts                     # Types stricts (link | section | divider, permissions, etc.)
│       ├── constants.ts                 # Icons mapping, colors, keys localStorage
│       ├── utils.ts                     # findRoute, buildBreadcrumbs, flattenRoutes
│       └── permissions.ts               # hasPermission(item, userRoles)
│
├── hooks/
│   └── navigation/
│       ├── useNavigation.ts             # Route active, sections, collapsed, actions
│       ├── useNavigationSearch.ts       # Query, results, Cmd+K
│       ├── useNavigationState.ts        # Persistance (localStorage): collapsed, open sections
│       ├── useBreadcrumbs.ts            # Breadcrumbs depuis config + pathname
│       └── useKeyboardNav.ts            # Arrow keys, Enter, Escape (sidebar + search)
│
├── config/
│   └── navigation.ts                    # Optionnel: réexport lib/navigation/config ou déprécier
│
├── types/
│   └── navigation.ts                    # Optionnel: réexport lib/navigation/types
│
└── stores/
    └── (existant navigation-store + app-store, à connecter aux hooks)
```

---

## 3. Plan d’implémentation par phases (avec estimations)

### Phase 1 — Fondations (types, config, lib, persistance)

**Objectif** : Types stricts, config centralisée dans `lib/navigation`, utils, persistance état.

| Tâche | Détail | Estimation |
|-------|--------|------------|
| 1.1 | Créer `src/lib/navigation/types.ts` (NavigationLink, NavigationSection, NavigationDivider, NavigationConfig, RoutePermission, NavigationBadge, settings) | 1h |
| 1.2 | Créer `src/lib/navigation/constants.ts` (STORAGE_KEYS, defaultCollapsed, maxRecentItems, iconMap Lucide) | 0,5h |
| 1.3 | Créer `src/lib/navigation/utils.ts` (findRouteByPath, flattenRoutes, getActiveId, buildBreadcrumbs) | 1h |
| 1.4 | Créer `src/lib/navigation/permissions.ts` (hasPermission(item, userRoles), filterByPermission) | 0,5h |
| 1.5 | Migrer `src/config/navigation.ts` → `src/lib/navigation/config.ts` (adapter au nouveau type NavigationConfig avec items + settings) | 1,5h |
| 1.6 | Hook `useNavigationState.ts` : lecture/écriture localStorage (sidebar collapsed, open section ids), sync avec app-store si besoin | 1h |
| **Total Phase 1** | | **~5,5 h** |

### Phase 2 — Hook useNavigation et Breadcrumbs

**Objectif** : Un seul hook “navigation”, breadcrumbs dérivés de la config.

| Tâche | Détail | Estimation |
|-------|--------|------------|
| 2.1 | `useNavigation.ts` : pathname, activeRouteId, activeSectionIds, isCollapsed, toggleSection, toggleSidebar, isActive(id), isSectionOpen(id), navigate, hasPermission | 2h |
| 2.2 | Connecter useNavigation à useNavigationState (persistance) et à useNavigationStore (pageCounts, history) | 0,5h |
| 2.3 | `useBreadcrumbs.ts` : parcours config par pathname, retour liste { label, href } | 1h |
| 2.4 | Composants `Breadcrumbs/` : Breadcrumbs.tsx + BreadcrumbItem.tsx, design BMO | 1h |
| **Total Phase 2** | | **~4,5 h** |

### Phase 3 — Sidebar en atomic design

**Objectif** : Découper la Sidebar en SidebarHeader, SidebarSection, SidebarItem, SidebarBadge, SidebarFooter.

| Tâche | Détail | Estimation |
|-------|--------|------------|
| 3.1 | `SidebarBadge.tsx` : variants, pulse, React.memo | 0,5h |
| 3.2 | `SidebarItem.tsx` : link ou button, active/hover/disabled, icon, badge, keyboard focus, React.memo | 1h |
| 3.3 | `SidebarSection.tsx` : header cliquable, AnimatePresence + motion pour le contenu, nested sections récursif, React.memo | 1,5h |
| 3.4 | `SidebarHeader.tsx` : logo, user profile, bouton search (ouvre Cmd+K) | 0,5h |
| 3.5 | `SidebarFooter.tsx` : bouton collapse | 0,25h |
| 3.6 | `Sidebar.tsx` : container qui utilise useNavigation + Section/Item/Header/Footer, délégation complète | 1h |
| 3.7 | `Sidebar.module.css` : transitions (transform/opacity), chevron, active bar, badge pulse, focus-visible | 0,5h |
| 3.8 | Remplacer l’ancien `Sidebar.tsx` (racine navigation) par le nouveau container et mettre à jour index + BMOAppShell | 0,5h |
| **Total Phase 3** | | **~5,75 h** |

### Phase 4 — Search global (Cmd+K) et Favorites / Recent

**Objectif** : Command palette, favoris, dernières pages.

| Tâche | Détail | Estimation |
|-------|--------|------------|
| 4.1 | `useNavigationSearch.ts` : query, debounce, search dans flattenRoutes (label, id), retour results[] | 1h |
| 4.2 | `NavigationSearch.tsx` : Dialog/Modal, input, liste de résultats, raccourci Cmd/Ctrl+K | 1,5h |
| 4.3 | `SearchResult.tsx` : une ligne par résultat, highlight du query, clic → navigate + fermeture | 0,5h |
| 4.4 | Favoris : état dans useNavigationState (localStorage), addFavorite/removeFavorite, SidebarFavorites.tsx (liste courte en haut de la sidebar) | 1,5h |
| 4.5 | Recent : utiliser navigationHistory (navigation-store), limiter à 5, affichage dans la modal Search ou dans Sidebar | 1h |
| **Total Phase 4** | | **~5,5 h** |

### Phase 5 — RBAC, i18n, dark mode, accessibilité

**Objectif** : Permissions, labels traduisibles, thème, a11y renforcé.

| Tâche | Détail | Estimation |
|-------|--------|------------|
| 5.1 | RBAC : intégrer permissions dans config (par item), hasPermission dans useNavigation, filtrer les items dans SidebarSection/SidebarItem | 1h |
| 5.2 | i18n : clés de traduction pour labels (ex. `navigation.dashboard`), usage dans config ou dans les composants selon stack i18n existante | 1h |
| 5.3 | Dark mode : classes Tailwind conditionnelles (déjà partiel dans BMO), vérifier Sidebar/Breadcrumbs/Search | 0,5h |
| 5.4 | A11y : aria-expanded, aria-controls, aria-current, roles, useKeyboardNav (flèches, Enter, Escape) pour Sidebar et Search | 1,5h |
| 5.5 | Focus management : focus trap dans la modal Search, focus visible partout | 0,5h |
| **Total Phase 5** | | **~4,5 h** |

### Phase 6 — Performance, tests, documentation

**Objectif** : Lazy sections si besoin, memo, tests, README et exemples.

| Tâche | Détail | Estimation |
|-------|--------|------------|
| 6.1 | Lazy loading : React.lazy pour le contenu de sections peu utilisées (optionnel si <100 routes) | 0,5h |
| 6.2 | Revue React.memo / useMemo / useCallback sur Sidebar*, NavigationSearch, Breadcrumbs | 0,5h |
| 6.3 | Virtualisation : évaluer react-window/react-virtuoso uniquement si >100 items visibles ; sinon skip | 0,5h |
| 6.4 | Tests unitaires : utils (findRoute, buildBreadcrumbs), permissions (hasPermission), useBreadcrumbs | 1,5h |
| 6.5 | Tests RTL : SidebarItem (active, click), SidebarSection (expand/collapse), NavigationSearch (open, search, select) | 2h |
| 6.6 | Storybook : stories Sidebar (collapsed/expanded), SidebarSection, Breadcrumbs, NavigationSearch | 2h |
| 6.7 | README `docs/navigation/README.md` : architecture, ajout d’une route, permissions, Cmd+K | 1h |
| 6.8 | JSDoc sur types (NavigationConfig, NavigationSection, etc.) et sur hooks (useNavigation, useBreadcrumbs) | 0,5h |
| **Total Phase 6** | | **~8,5 h** |

---

## 4. Synthèse des estimations

| Phase | Contenu | Heures |
|-------|--------|--------|
| 1 | Types, config, lib, persistance | 5,5 |
| 2 | useNavigation, useBreadcrumbs, Breadcrumbs UI | 4,5 |
| 3 | Sidebar atomic (Header, Section, Item, Badge, Footer) | 5,75 |
| 4 | Cmd+K Search, Favorites, Recent | 5,5 |
| 5 | RBAC, i18n, dark mode, a11y | 4,5 |
| 6 | Performance, tests, Storybook, doc | 8,5 |
| **Total** | | **~34,25 h** |

En jours (à ~6–7 h/jour) : **environ 5 jours** pour une personne.

---

## 5. Stratégie de migration

- **Parallélisme** : garder l’actuel `Sidebar.tsx` et `config/navigation.ts` en place jusqu’à ce que le nouveau flux soit branché.
- **Nouveau code** :
  - Créer `lib/navigation/` et `hooks/navigation/` sans casser l’existant.
  - Créer `components/navigation/Sidebar/` en parallèle de l’actuel `Sidebar.tsx`.
- **Bascule** :
  - Dans `BMOAppShell`, remplacer l’import de `Sidebar` par le nouveau container `Sidebar/` une fois Phase 3 terminée.
  - Adapter les props (collapsed, badgeCounts, user) pour qu’ils viennent de `useNavigation` + stores existants.
- **Nettoyage** : une fois validé en dev/E2E, supprimer l’ancien `Sidebar.tsx` (racine) et éventuellement déprécier `src/config/navigation.ts` au profit de `lib/navigation/config.ts`.
- **Dashboard** : le module dashboard conserve son propre flux (DashboardSidebar, registry) ; pas de fusion avec cette refonte sauf décision explicite ultérieure.

---

## 6. Critères de succès (rappel)

- **Performance** : first paint sidebar < 100 ms, animations 60 fps, pas de re-render inutile.
- **UX/UI** : route active toujours visible, breadcrumbs à jour, Cmd+K opérationnel, états clairs (active, hover, focus).
- **Code** : 0 erreur TypeScript, 0 warning ESLint, tests navigation > 80 %, a11y (Lighthouse ou manuel) > 95.
- **Design** : identique YESSALATE BMO (couleurs, espacements, transitions).

---

## 7. Prochaine étape recommandée

Démarrer par **Phase 1** (types + `lib/navigation` + utils + permissions + migration config + useNavigationState), puis enchaîner Phase 2 (useNavigation + useBreadcrumbs + Breadcrumbs UI) pour avoir la base état et breadcrumbs avant de refondre la Sidebar en Phase 3.

Si tu veux, on peut détailler la Phase 1 fichier par fichier (contenu exact de `types.ts`, `config.ts`, `utils.ts`, etc.) ou enchaîner directement l’implémentation à partir de ce plan.
