# Module Dashboard

Module centralisé pour la gestion du dashboard avec navigation à 3 niveaux, KPIs, graphiques et registry typé.

## 🚀 Quick Start

```typescript
import { DashboardViewRouter } from '@/modules/dashboard';

function DashboardPage() {
  return <DashboardViewRouter />;
}
```

## 📦 Exports Principaux

### Composants

```typescript
// Routeur principal (recommandé)
import { DashboardViewRouter } from '@/modules/dashboard';

// Composants de graphiques (lazy-loaded)
import { 
  TrendsChart, 
  MonthlyComparisonChart, 
  CategoryDistributionChart 
} from '@/modules/dashboard';

// Modal de drill-down
import { KPIDrillDownModal } from '@/modules/dashboard';
```

### Hooks

```typescript
// Charger les données d'une vue
import { useDashboardViewData } from '@/modules/dashboard';

const { data, isLoading, error } = useDashboardViewData<KpisProjetsData>({
  main: 'overview',
  sub: 'kpis',
  subSub: 'projets',
});

// Obtenir l'entrée du registry
import { useDashboardViewEntry } from '@/modules/dashboard';

const entry = useDashboardViewEntry(nav);

// Prefetch et invalidation
import { 
  usePrefetchDashboardView,
  useInvalidateDashboardView 
} from '@/modules/dashboard';
```

### Helpers KPI

```typescript
import {
  formatMoneyXOF,
  formatMoneyEUR,
  formatMoneyCompact,
  mapToneToColor,
  parseTrendPercent,
  getTrendDirection,
} from '@/modules/dashboard';

// Formatage monétaire
formatMoneyXOF(1000000); // "1 000 000 FCFA"
formatMoneyCompact(1500000); // "1.5M FCFA"

// Mapping tonalité → couleur
mapToneToColor('ok'); // 'emerald'
mapToneToColor('warn'); // 'amber'

// Parsing de tendances
parseTrendPercent('+12%'); // 12
getTrendDirection(12); // 'up'
```

### Types

```typescript
import type {
  // Types de navigation
  DashboardMainCategory,
  NavKey,
  
  // Types de données
  OverviewSummaryDashboardData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  DashboardViewData,
  
  // Types de registry
  ViewEntry,
  TypedLoaderFn,
} from '@/modules/dashboard';
```

## 🏗️ Architecture

### Navigation

Le dashboard utilise une navigation à 3 niveaux :
- **Main** : Catégorie principale (`overview`, `performance`, `actions`, etc.)
- **Sub** : Sous-catégorie (`summary`, `kpis`, `validation`, etc.)
- **Leaf** : Vue finale (`dashboard`, `projets`, `demandes`, etc.)

La configuration est dans `navigation.config.json`.

### Registry

Le registry associe chaque route (main::sub::leaf) à :
- Un **loader** : fonction async qui charge les données
- Un **render** : composant React qui affiche la vue
- Un **TTL** : durée de cache en millisecondes

```typescript
// Exemple d'entrée dans le registry
'overview::kpis::projets': {
  id: 'overview-kpis-projets',
  title: 'KPIs Projets',
  ttl: 60_000, // 1 minute
  loader: loadOverviewKpisProjets,
  render: ({ data }) => <ProjetKpiPage data={data} />,
}
```

### Data Loading

Les données sont chargées via TanStack Query avec :
- Cache automatique basé sur le TTL
- Prefetch pour améliorer les performances
- Invalidation manuelle si nécessaire

## 📚 Documentation

- [Guide de Migration](./MIGRATION_GUIDE.md) : Comment migrer depuis l'ancienne architecture
- [Résumé du Refactoring](./REFACTORING_SUMMARY.md) : Vue d'ensemble des changements
- [Types de Données](./types/dashboardDataTypes.ts) : Contrats typés pour chaque vue

## 🔧 Configuration

### Navigation

Modifier `navigation.config.json` pour ajouter/modifier des routes :

```json
{
  "overview": {
    "label": "Vue d'ensemble",
    "sub": {
      "kpis": {
        "label": "KPIs",
        "leaf": {
          "projets": {
            "label": "KPIs Projets",
            "component": "ProjetKpiPage"
          }
        }
      }
    }
  }
}
```

### Registry

Ajouter une nouvelle entrée dans `dashboardRegistry.tsx` :

```typescript
import type { KpisProjetsData } from '../types/dashboardDataTypes';

const loadMyView: TypedLoaderFn<KpisProjetsData> = async (nav) => {
  // Charger les données
  const data = await fetchData();
  
  return {
    key: navToKey(nav),
    data,
    fetchedAt: Date.now(),
  };
};

export const dashboardRegistry = {
  // ...
  'overview::kpis::projets': {
    id: 'overview-kpis-projets',
    title: 'KPIs Projets',
    ttl: 60_000,
    loader: loadMyView,
    render: ({ data }) => <MyComponent data={data} />,
  },
};
```

## 🎨 Design System

### Couleurs KPI

Les couleurs sont standardisées via `mapToneToColor()` :
- `ok` → `emerald` (vert)
- `warn` → `amber` (orange)
- `crit` → `rose` (rouge)
- `info` → `blue` (bleu)

### Formatage

Tous les helpers de formatage sont dans `utils/colorMapping.ts` :
- Monétaire : XOF, EUR, compact
- Tendances : parsing, direction
- Couleurs : mapping tonalité → couleur

## 🚧 Roadmap

- [ ] Phase 3 : APIs lecture avec RLS/ABAC
- [ ] Audit & Logging complet
- [ ] Tests unitaires et E2E
- [ ] ISR/Edge caching

## 📝 Notes

- Le module est entièrement typé avec TypeScript
- Tous les composants sont lazy-loaded pour optimiser le bundle
- Le cache est géré automatiquement par TanStack Query
- Les helpers KPI sont centralisés pour garantir la cohérence
