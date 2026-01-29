# Phase 5 – Fonctionnalités avancées navigation

## Recherche (Cmd+K / Cmd+/)

- **Raccourci** : `Ctrl+/` ou `Cmd+/` ouvre la palette de commandes du dashboard.
- **Composant** : `DashboardCommandPalette` (`src/components/features/bmo/dashboard/command-center/DashboardCommandPalette.tsx`).
- Recherche par mots-clés, navigation rapide vers les sections (main → sub → leaf), actions (export, etc.).

## Breadcrumbs

- **Dashboard** : `DashboardBreadcrumbs` utilise le store Command Center et `getBreadcrumbLabels` pour afficher le fil d’Ariane (main → sub → leaf).
- **Générique** : `Breadcrumbs` dans `src/components/navigation/Breadcrumbs` utilise `useBreadcrumbs()` (pathname) ou une liste d’items en override.

## Favoris

- **Hook** : `useNavigationState` expose `favorites`, `addFavorite`, `removeFavorite`, `toggleFavorite`.
- **Persistance** : `localStorage` via `STORAGE_KEYS.FAVORITES` (`lib/navigation/constants`).
- Les favoris sont des identifiants (ids ou clés de route). L’UI (étoile, liste) peut être branchée sur ce hook.

## Éléments récents

- **Hook** : `useNavigationRecent` (`src/hooks/navigation/useNavigationRecent.ts`).
- **API** : `recentItems`, `addRecent(key)`, `clearRecent()`, `removeRecent(key)`.
- **Persistance** : `localStorage` via `STORAGE_KEYS.RECENT_ITEMS`.
- **Limite** : `maxItems` (défaut 5, dashboard : 10).
- **Dashboard** : la route actuelle est enregistrée automatiquement dans « récents » à chaque changement de `main`/`sub`/`leaf` (effet dans `DashboardSidebar`).

## Navigation clavier (sidebar)

- **Hook** : `useSidebarKeyboardNav` (`src/hooks/navigation/useSidebarKeyboardNav.ts`).
- **Comportement** : dans le conteneur de la sidebar, `ArrowDown` / `ArrowUp` déplacent le focus entre les boutons ; `Home` / `End` vont au premier / dernier.
- **Dashboard** : utilisé dans `DashboardSidebar` sur la zone scrollable des items (`containerRef` + `onKeyDown`).

## Résumé

| Fonctionnalité   | Où / Comment |
|------------------|---------------|
| Search Cmd+/     | `DashboardCommandPalette` (existant) |
| Breadcrumbs      | `DashboardBreadcrumbs` (store) ou `Breadcrumbs` (pathname) |
| Favoris          | `useNavigationState` (favorites, toggleFavorite) |
| Récents          | `useNavigationRecent` + synchro auto dans `DashboardSidebar` |
| Clavier sidebar  | `useSidebarKeyboardNav` dans `DashboardSidebar` |
