# Guide de Migration - Dashboard Refactoring

## Vue d'ensemble

Ce document décrit les changements apportés au module Dashboard pour unifier la navigation, standardiser les helpers KPI, et améliorer la maintenabilité.

## Phase 0 - Quick Wins ✅

### 1. Normalisation de `navigation.config.json`

**Changements :**
- Suppression du doublon `highlights` dans `overview/summary`
- Fusion `validations` + `validation` → uniquement `validation`
- Fusion `blocked` + `blocages` dans `risks` → uniquement `blocages`

**Impact :** Routes plus cohérentes, pas de routes fantômes

### 2. Centralisation des helpers KPI

**Fichier :** `src/modules/dashboard/utils/colorMapping.ts`

**Nouveaux helpers :**
- `mapToneToColor()` : mapping tonalité → couleur
- `getTrendDirection()` : détermination de la direction de tendance
- `formatMoneyXOF()`, `formatMoneyEUR()`, `formatMoney()` : formatage monétaire
- `formatMoneyCompact()` : format compact (ex: "1.5M FCFA")

**Migration :**
```typescript
// ❌ Avant
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

// ✅ Après
import { formatMoneyEUR } from '../../utils/colorMapping';
// Utiliser formatMoneyEUR(value)
```

### 3. Types et hook de données

**Fichier :** `src/modules/dashboard/hooks/useDashboardRegistry.ts`

**Nouveaux hooks :**
- `useDashboardViewData<T>()` : chargement des données avec TanStack Query
- `useDashboardViewEntry<T>()` : récupération de l'entrée du registry
- `usePrefetchDashboardView()` : préchargement
- `useInvalidateDashboardView()` : invalidation du cache

## Phase 1 - Consolidation ✅

### 1. Standardisation Recharts

**Changements :**
- Conversion de `DashboardCharts.tsx` de Chart.js vers Recharts
- Conversion de `KPIDrillDownModal.tsx` vers Recharts
- Lazy loading des composants de graphiques
- Design system de couleurs centralisé

**Migration :**
```typescript
// ❌ Avant (Chart.js)
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';

// ✅ Après (Recharts)
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
```

### 2. Unification du routeur

**Changement principal :**
- `DashboardContentRouter` est maintenant **déprécié**
- Utiliser `DashboardViewRouter` à la place

**Migration :**
```typescript
// ❌ Avant
import { DashboardContentRouter } from './DashboardContentRouter';
<DashboardContentRouter />

// ✅ Après
import { DashboardViewRouter } from './DashboardViewRouter';
<DashboardViewRouter />
```

**Avantages de `DashboardViewRouter` :**
- Lazy loading des composants
- Cache des composants chargés
- Transitions animées
- Meilleure gestion des routes via `navigation.config.json`

## Phase 2 - Types Stricts ✅

### 1. Contrats de données typés

**Fichier :** `src/modules/dashboard/types/dashboardDataTypes.ts`

**Types créés :**
- `OverviewSummaryDashboardData`
- `OverviewSummaryPointsData`
- `OverviewKpisHighlightsData`
- `KpisProjetsData`
- `KpisDemandesData`
- `KpisBudgetData`
- `ValidationsGlobalData`

**Utilisation :**
```typescript
import type { KpisProjetsData } from '../types/dashboardDataTypes';

const loadOverviewKpisProjets: TypedLoaderFn<KpisProjetsData> = async (nav) => {
  // TypeScript garantit que le retour correspond au contrat
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      projets: [...],
      total: 5,
      enCours: 3,
      // TypeScript vérifie que tous les champs sont présents
    },
  };
};
```

### 2. Registry typé

**Changements :**
- `ViewEntry<T>` est maintenant générique
- `LoaderFn` remplacé par `TypedLoaderFn<T>`
- Type safety amélioré dans tout le registry

## Prochaines étapes (Phase 3)

### 1. APIs lecture

Créer les endpoints `/api/dashboard/:main/:sub/:leaf` avec :
- Read models front-friendly
- RLS/ABAC par tenant et rôle
- Caching Edge/ISR si possible

### 2. Audit & Logging

- Journalisation de toute navigation
- Logging des actions KPI (drilldown, export, etc.)
- Quotas & anti-abuse

### 3. Tests

- Tests unitaires pour les helpers KPI
- Tests d'intégration pour le registry
- Tests E2E pour la navigation

## Checklist de migration

- [x] Normaliser `navigation.config.json`
- [x] Centraliser les helpers KPI
- [x] Créer les hooks TanStack Query
- [x] Standardiser Recharts
- [x] Unifier le routeur
- [x] Créer les types stricts
- [ ] Migrer les loaders vers de vraies APIs
- [ ] Ajouter RLS/ABAC
- [ ] Implémenter l'audit
- [ ] Ajouter les tests

## Support

Pour toute question ou problème de migration, consulter :
- `src/modules/dashboard/types/dashboardDataTypes.ts` pour les types
- `src/modules/dashboard/utils/colorMapping.ts` pour les helpers
- `src/modules/dashboard/hooks/useDashboardRegistry.ts` pour les hooks
