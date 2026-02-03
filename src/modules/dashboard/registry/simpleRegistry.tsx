/**
 * Registry simplifié pour le Dashboard (Phase 2)
 * 
 * Utilise des loaders API directs avec fetch
 * Compatible avec le système de registry existant
 */

'use client';

import React from 'react';
import { ViewEntry, NavKey, navToKey } from '../types/dashboard';
import type {
  OverviewSummaryDashboardData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  OverviewSummaryPointsData,
  OverviewKpisHighlightsData,
} from '../types/dashboard.readmodels';
import dynamic from 'next/dynamic';
import { ContentLoadingSkeleton } from '../components/ContentLoadingSkeleton';

// ============================================================================
// Composants lazy-loaded
// ============================================================================

// Vue réutilisée (déjà existante)
const DashboardAdvancedView = dynamic(
  () => import('../components/DashboardAdvancedView').then((m) => m.DashboardAdvancedView),
  { ssr: false }
);

// Pages KPI lazy-loaded
const ProjetKpiPage = dynamic(
  () => import('../components/views/ProjetKpiPage').then((m) => m.ProjetKpiPage),
  { ssr: false }
);

const DemandesKpiPage = dynamic(
  () => import('../components/views/DemandesKpiPage').then((m) => m.DemandesKpiPage),
  { ssr: false }
);

const BudgetKpiPage = dynamic(
  () => import('../components/views/BudgetKpiPage').then((m) => m.BudgetKpiPage),
  { ssr: false }
);

const HighlightsKpiPage = dynamic(
  () => import('../components/views/HighlightsKpiPage').then((m) => m.HighlightsKpiPage),
  { ssr: false }
);

// ============================================================================
// Helper pour créer un loader API simple
// ============================================================================

/**
 * Crée un loader qui appelle l'API avec fetch
 */
function createApiLoader<TData>(nav: NavKey) {
  return async (currentNav: NavKey) => {
    const targetNav = currentNav || nav;
    const url = `/api/dashboard/${targetNav.main}/${targetNav.sub ?? ''}/${targetNav.leaf ?? ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = (await res.json()) as TData;
    return { key: navToKey(targetNav), fetchedAt: Date.now(), data };
  };
}

// ============================================================================
// Loaders API par vue
// ============================================================================

/**
 * Loader typé — appelle la route API avec fetch
 */
async function loadOverviewSummaryDashboard(nav: NavKey) {
  return createApiLoader<OverviewSummaryDashboardData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'dashboard',
  })(nav);
}

async function loadOverviewSummaryPoints(nav: NavKey) {
  return createApiLoader<OverviewSummaryPointsData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'points',
  })(nav);
}

async function loadOverviewKpisHighlights(nav: NavKey) {
  return createApiLoader<OverviewKpisHighlightsData>({
    main: 'overview',
    sub: 'kpis',
    leaf: 'highlights',
  })(nav);
}

async function loadKpisProjets(nav: NavKey) {
  return createApiLoader<KpisProjetsData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'projets',
  })(nav);
}

async function loadKpisDemandes(nav: NavKey) {
  return createApiLoader<KpisDemandesData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'demandes',
  })(nav);
}

async function loadKpisBudget(nav: NavKey) {
  return createApiLoader<KpisBudgetData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'budget',
  })(nav);
}

// ============================================================================
// Registry
// ============================================================================

export const dashboardRegistry: Record<string, ViewEntry<any>> = {
  'overview::summary::dashboard': {
    id: 'overview-summary-dashboard',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: ({ data }) => <DashboardAdvancedView data={data} />,
  },

  'overview::summary::points': {
    id: 'overview-summary-points',
    ttl: 60_000,
    loader: loadOverviewSummaryPoints,
    render: ({ data }) => {
      // ✅ Phase 8: Utiliser le composant dédié SummaryPointsPage
      // Note: Le render doit retourner un composant React, pas une fonction
      const SummaryPointsPage = React.lazy(() => 
        import('../components/views/SummaryPointsPage').then(m => ({ default: m.SummaryPointsPage }))
      );
      return (
        <React.Suspense fallback={<ViewLoadingFallback />}>
          <SummaryPointsPage data={data} />
        </React.Suspense>
      );
    },
  },

  'overview::kpis::highlights': {
    id: 'overview-kpis-highlights',
    ttl: 60_000,
    loader: loadOverviewKpisHighlights,
    render: ({ data }) => <HighlightsKpiPage />,
  },

  'performance::kpis::projets': {
    id: 'performance-kpis-projets',
    ttl: 120_000,
    loader: loadKpisProjets,
    render: ({ data }) => <ProjetKpiPage />,
  },

  'performance::kpis::demandes': {
    id: 'performance-kpis-demandes',
    ttl: 120_000,
    loader: loadKpisDemandes,
    render: ({ data }) => <DemandesKpiPage />,
  },

  'performance::kpis::budget': {
    id: 'performance-kpis-budget',
    ttl: 120_000,
    loader: loadKpisBudget,
    render: ({ data }) => <BudgetKpiPage data={data} />,
  },

  // … autres entrées à convertir au fil de l'eau
};
