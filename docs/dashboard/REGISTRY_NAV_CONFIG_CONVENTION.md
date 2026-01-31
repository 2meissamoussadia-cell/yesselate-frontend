# Convention Registry vs navigation.config.json (DashboardViewRouter)

**Objectif :** Clarifier la règle « quelle URL → quelle vue » pour éviter qu'une route soit définie seulement dans l'un des deux.

## Règle en vigueur

1. **Registry prioritaire**
   `DashboardViewRouter` convertit la route courante en clé (ex. `performance::bureaux::bmo`) via `navToKey`.
   Si cette clé existe dans **`dashboardRegistry`** :
   - On utilise **`DashboardContentSwitch`** : loaders + données + `render({ data })`.
   - Pas d'usage de `navigation.config.json` ni de `loadComponent` pour cette vue.

2. **Fallback : navigation + loadComponent**
   Si la clé n'existe **pas** dans le registry :
   - On obtient le **nom du composant** via `getRouteComponent(main, sub, leaf)` (alimenté par `dashboardNavigationConfig` / `navigation.config.json`).
   - On charge le composant via **`loadComponent(componentName)`** (mapping nom → import dynamique).
   - Aucun loader registry, pas de `data` injectée.

## Conséquences

- **Une route doit être soit dans le registry, soit dans la config de navigation + componentMap**, pas les deux de façon contradictoire.
- **Nouvelle vue avec loaders / données** : l'ajouter au **registry** (entrée + loader + render).
- **Nouvelle vue sans données** : on peut soit l'ajouter au registry avec un loader minimal, soit seulement à la config nav + `loadComponent`.

## Fichiers

| Rôle | Fichier |
|------|--------|
| Registry (priorité) | `src/modules/dashboard/registry/dashboardRegistry.tsx` |
| Config navigation (fallback) | `src/modules/dashboard/navigation/dashboardNavigationConfig.ts`, `navigation.config.json` |
| Résolution composant (fallback) | `src/modules/dashboard/utils/loadComponent.ts` (componentMap) |
| Routeur | `src/modules/dashboard/components/DashboardViewRouter.tsx` |

---

## Modals et conteneur global (P5)

**Conteneur :** `DashboardModals` (rendu dans `DashboardCommandCenterPage` / shell). État : `dashboardCommandCenterStore.modal` (`openModal` / `closeModal`).

| Type modal           | Rendu dans DashboardModals | Ouvert depuis |
|----------------------|-----------------------------|----------------|
| `kpi-drilldown`      | `KPIDrillDownModal`         | DashboardKPIBar, DemandesKpiPage, HighlightsKpiPage, OverviewPage |
| `shortcuts`          | Aide raccourcis clavier     | DashboardFooter, DashboardCommandCenterPage |
| `action-detail`      | Placeholder « Vue en cours de développement » | OverviewPage |
| `risk-detail`        | Idem placeholder            | OverviewPage, HighlightsKpiPage |
| `decision-detail`    | Idem placeholder            | OverviewPage |
| `calendar`           | Idem placeholder            | OverviewPage |
| `agenda-details`     | Idem placeholder            | OverviewPage |

Les modals spécifiques aux vues (AlertListModal, BlocageDetailModal, BudgetDetailModal, ValidationsModal, CreancesModal, etc.) sont rendus **dans chaque vue** qui les utilise, pas dans le conteneur global.

---

*Document ajouté pour répondre à l'audit manquements (convention registry vs config). P5 : section Modals ajoutée.*
