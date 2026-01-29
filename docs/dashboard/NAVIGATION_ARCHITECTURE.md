# Architecture de la navigation Dashboard

## Vue d'ensemble

La navigation du dashboard est à **3 niveaux** : `main` → `sub` → `leaf`.  
Une seule source de vérité pour l’état courant : **Command Center store** (Zustand).  
L’URL est synchronisée via `useDashboardCommandCenterUrlSync`.

---

## Sources de configuration (état actuel)

| Fichier | Rôle | Utilisé par |
|--------|------|-------------|
| `navigation/dashboardNavigationConfig.ts` | Arbre de navigation (NavNode) : id, label, i18nKey, icon, requires, children | Sidebar, navigationFilter, routeNavigation |
| `navigation/navigation.config.json` | Mapping (main, sub, leaf) → label + **component** | routeValidation, Breadcrumbs (labels), ViewRouter (résolution composant) |

**Point d’attention** : les labels peuvent diverger si on modifie l’un sans l’autre.  
**Recommandation** : utiliser la config TS pour les labels (sidebar + breadcrumbs) et garder le JSON pour le mapping vers les composants (ou unifier plus tard via un build step).

---

## Types (source unique)

- **`types/dashboardNavigationTypes.ts`**  
  - `DashboardMainCategory`, `DashboardSubCategory`, `DashboardSubSubCategory`  
  - `NavRequires`, `NavNode` (icon, label, i18nKey, requires, children)  
  - `DashboardNavItem` (legacy, compatible)

- **`types/dashboard.ts`**  
  - `NavKey` (main, sub, leaf), `navToKey()`, `keyToNav()`

- **Store**  
  - `dashboardCommandCenterStore` : types `DashboardMainCategory`, `DashboardNavigation`, `navigate()`, `lastNavigatedAt`, etc.

---

## Flux de navigation

1. **Utilisateur** clique dans la Sidebar ou le Breadcrumb → `navigate(main, sub, leaf)` (store).
2. **Store** met à jour `navigation` et `lastNavigatedAt`.
3. **useDashboardCommandCenterUrlSync** lit le store et met à jour l’URL (searchParams ou path).
4. **DashboardViewRouter** lit l’URL / le store, valide la route (`isValidRoute`, `normalizeRoute`), résout le composant via le registry + `navigation.config.json`, affiche la vue.

---

## Résolution des labels

- **Sidebar** : labels via `t(node.i18nKey ?? node.label ?? node.id)` depuis `dashboardNavigationConfig` (NavNode).
- **Breadcrumbs** : `getBreadcrumbLabels(main, sub, leaf)` (config TS + fallback JSON), puis `t(mainLabel)`, `t(subLabel)`, `t(leafLabel)` pour i18n.
- **Helper** : `utils/navigationLabels.ts` — `getNavigationLabelFromTree()` (retourne `label` ou `i18nKey`), `getBreadcrumbLabels()` pour le fil d'Ariane.

---

## Permissions et filtrage

- **navigationFilter** : `filterNavigationConfig(config, permissions, roles, featureFlags)` — filtre l’arbre NavNode selon `requires`.
- **permissions.ts** : `nodeAllowed(ctx, req)` — vérifie perm / flag / roles pour un nœud.
- **Sidebar** : n’affiche que les nœuds passant le filtre ; vérification d’accès par route via `hasViewAccess(registry[key], user)`.

---

## Évolutions recommandées

1. **Types** : tout importer depuis `types/dashboardNavigationTypes` (NavNode, NavRequires) — fait.
2. **Labels** : une seule API `getNavigationLabel(main, sub?, leaf?)` utilisée par Breadcrumbs + tout affichage de libellé — en place via `navigationLabels.ts`.
3. **Config** : à terme, envisager un build qui génère le JSON (labels + component) à partir de la config TS pour éviter la double saisie.
4. **Hook** : `useDashboardNavigation` reste le point d’entrée (store) ; ajouter si besoin : recent items, favorites (localStorage), sans casser l’existant.

---

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `lib/stores/dashboardCommandCenterStore.ts` | État navigation + UI (sidebar, palette, etc.) |
| `navigation/dashboardNavigationConfig.ts` | Arbre de navigation (TS) |
| `navigation/navigation.config.json` | Routes + composants |
| `utils/routeValidation.ts` | isValidRoute, getDefaultLeafForSub, getNavigationConfig |
| `utils/navigationLabels.ts` | Labels depuis config TS + fallback JSON |
| `hooks/useDashboardNavigation.ts` | API main/sub/leaf + navigate |
| `hooks/useDashboardCommandCenterUrlSync.ts` | Sync store ↔ URL |
| `components/DashboardBreadcrumbs.tsx` | Fil d’Ariane (store + labels unifiés) |
| `navigation/DashboardSidebar.tsx` | Menu latéral (config filtrée + permissions) |

---

*Dernière mise à jour : janvier 2025*
