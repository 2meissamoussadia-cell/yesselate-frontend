/**
 * Registry centralisé pour les vues du Dashboard
 * Utilise les nouveaux types cohérents et des loaders API réels
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ViewEntry, NavKey, navToKey, type LoaderResult } from '../types/dashboard';
import type { OverviewSummaryDashboardData } from '../types/dashboardDataTypes';

// ============================================================================
// Lazy imports des composants de vues
// ============================================================================

const DashboardAdvancedView = dynamic(
  () => import('../components/DashboardAdvancedView').then((m) => ({ default: m.DashboardAdvancedView })),
  { ssr: false }
);

// Ré-export du type pour compatibilité
export type { OverviewSummaryDashboardData } from '../types/dashboardDataTypes';

// ============================================================================
// Loaders API réels
// ============================================================================

/**
 * Loader pour la vue overview::summary::dashboard
 * Fait un appel API réel vers /api/dashboard/overview/summary/dashboard
 */
async function loadOverviewSummaryDashboard(
  nav: NavKey
): Promise<LoaderResult<OverviewSummaryDashboardData>> {
  const res = await fetch(`/api/dashboard/${nav.main}/${nav.sub}/${nav.leaf}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load dashboard data: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as OverviewSummaryDashboardData;

  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data,
  };
}

// ============================================================================
// Registry des vues
// ============================================================================

export const dashboardRegistry: Record<string, ViewEntry<any>> = {
  // overview::summary::dashboard
  'overview::summary::dashboard': {
    id: 'overview-summary-dashboard',
    ttl: 60_000, // 60 secondes
    loader: loadOverviewSummaryDashboard,
    render: ({ data }) => <DashboardAdvancedView data={data} />,
  },

  // Ajouter d'autres entrées ici au fur et à mesure
  // Exemple:
  // 'overview::summary::highlights': { ... },
  // 'overview::kpis::projets': { ... },
};
