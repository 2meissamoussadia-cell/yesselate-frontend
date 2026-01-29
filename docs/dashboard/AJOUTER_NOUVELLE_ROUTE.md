# Comment ajouter une nouvelle route au Dashboard

Le dashboard utilise une navigation à **3 niveaux** : **main** (catégorie principale) → **sub** (sous-catégorie) → **leaf** (page finale). Une route est identifiée par la clé `main::sub::leaf` (ex. `overview::kpis::budget`).

## 1. Déclarer le nœud dans la config de navigation (sidebar)

**Fichier** : `src/modules/dashboard/navigation/dashboardNavigationConfig.ts`

- Si la **catégorie principale** n’existe pas, l’ajouter dans `dashboardNavigationConfig` (ex. `overview`, `performance`, `actions`, …).
- Pour une **nouvelle page** sous une section existante, ajouter un **enfant** au bon endroit dans l’arbre (sub → leaf ou main → sub → leaf).

Exemple : ajouter une page "Rapports" sous **Overview → KPIs** :

```ts
// Dans overview.children, trouver l’entrée id: 'kpis', puis dans children :
{
  id: 'rapports',
  label: 'Rapports',
  // optionnel : i18nKey: 'nav.rapports',
  // optionnel : requires: { perm: 'dashboard:read' },
},
```

- **Types** : chaque nœud est un `NavNode` (`id`, `label`, optionnellement `i18nKey`, `icon`, `badge`, `requires`, `children`).
- Les **catégories principales** doivent correspondre au type `DashboardMainCategory` (défini dans `src/modules/dashboard/types/dashboardNavigationTypes.ts`). Si vous ajoutez une nouvelle catégorie principale, mettre à jour ce type.

## 2. Ajouter la route dans navigation.config.json (validation + labels)

**Fichier** : `src/modules/dashboard/navigation/navigation.config.json`

Structure : `main.sub.leaf` avec `label` et `component` (nom du composant de la vue).

Exemple pour `overview.kpis.rapports` :

```json
"kpis": {
  "label": "KPIs",
  "leaf": {
    "highlights": { "label": "Synthèse stratégique", "component": "HighlightsKpiPage" },
    "rapports": { "label": "Rapports", "component": "RapportsKpiPage" }
  }
}
```

- Ce fichier est utilisé par `routeValidation` (validation des routes, leaf par défaut) et par les labels (breadcrumbs, etc.).
- Le **nom du composant** doit correspondre à celui enregistré dans le registry (étape 3).

## 3. Enregistrer la vue dans le registry

**Fichier** : `src/modules/dashboard/registry/dashboardRegistry.tsx`

- La clé d’entrée est `navToKey({ main, sub, leaf })`, ex. `"overview::kpis::rapports"`.
- Chaque entrée du registry contient au minimum une fonction **`render`** qui reçoit `{ nav, data }`. Optionnellement un **`loader`** pour charger les données.

Exemple (en suivant le pattern existant dans le fichier) :

```ts
import { RapportsKpiPage } from '../components/views/RapportsKpiPage';

// Dans l’objet du registry (ou le Map selon l’implémentation) :
[navToKey({ main: 'overview', sub: 'kpis', leaf: 'rapports' })]: {
  id: 'overview::kpis::rapports',
  render: ({ nav, data }) => <RapportsKpiPage nav={nav} data={data} />,
  // optionnel : loader: loadKpisRapportsApi,
},
```

- Si la vue a besoin de **données** : définir un loader dans `src/modules/dashboard/api/loaders.ts` (ou équivalent) et le référencer ici.
- Les **types** (NavKey, ViewEntry, Loader, etc.) sont dans `src/modules/dashboard/types/dashboard.ts`.

## 4. Créer le composant de la vue

**Emplacement** : `src/modules/dashboard/components/views/`

- Créer par ex. `RapportsKpiPage.tsx`.
- Le composant reçoit en général `nav: NavKey` et, si un loader est défini, `data` dans les props ou via le contexte / hook du registry.

## 5. (Optionnel) i18n

- Si vous utilisez `i18nKey` dans `dashboardNavigationConfig`, ajouter les clés dans les fichiers de traduction (ex. `locales/fr-FR.json`, `public/locales/…`).
- Les breadcrumbs et la sidebar utilisent `t(node.i18nKey ?? node.label ?? node.id)` pour afficher le libellé.

## 6. (Optionnel) Permissions

- Pour restreindre l’accès : utiliser **`requires`** sur le `NavNode` (`perm`, `flag`, `roles`). Le filtrage est géré par `filterNavigationConfig` et `nodeAllowed` (voir `src/modules/dashboard/navigation/permissions.ts`).
- Vérifier que le **registry** ou les guards utilisent les mêmes règles si une vérification côté vue est nécessaire.

## Résumé des fichiers à toucher

| Étape | Fichier |
|-------|--------|
| 1. Sidebar / arbre de nav | `src/modules/dashboard/navigation/dashboardNavigationConfig.ts` |
| 2. Validation + labels | `src/modules/dashboard/navigation/navigation.config.json` |
| 3. Vue enregistrée | `src/modules/dashboard/registry/dashboardRegistry.tsx` |
| 4. Composant de la page | `src/modules/dashboard/components/views/<NomPage>.tsx` |
| 5. (Optionnel) Données | `src/modules/dashboard/api/loaders.ts` + entrée loader dans le registry |
| 6. (Optionnel) i18n / permissions | Locales, `dashboardNavigationConfig` (requires) |

Après ces étapes, la nouvelle route est disponible dans la sidebar, dans les breadcrumbs, dans la palette de commandes (Cmd+/) et dans les "Récemment visités".
