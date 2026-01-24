/**
 * Exemple d'utilisation de la navigation Dashboard (unifiée).
 *
 * NOTE: `DashboardViewRouter` lit l'URL, donc pour une démo complète on utilise
 * `useDashboardNavigationWithUrl` (store + URL).
 */

'use client';

import React from 'react';
import { DashboardViewRouter } from '../components/DashboardViewRouter';
import { useDashboardNavigationWithUrl } from '../components/buttons/useDashboardNavigation';

// Exemple de composant qui utilise la navigation
function NavigationControls() {
  const { navigate } = useDashboardNavigationWithUrl();

  return (
    <div className="p-4 space-y-4 bg-slate-800/40 rounded-lg">
      <div>
        <p className="text-sm text-slate-400 mb-2">Navigation (via URL):</p>
        <p className="text-slate-300 text-xs">
          Utilise `main/sub/leaf` dans l’URL et le store unifié.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate('overview', 'kpis', 'projets')}
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
        >
          Navigate to Projet KPI
        </button>
        <button
          onClick={() => navigate('overview', 'kpis', 'budget')}
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
        >
          Navigate to Budget KPI
        </button>
        <button
          onClick={() => navigate('overview', 'summary', null)}
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
        >
          Navigate to Summary
        </button>
      </div>
    </div>
  );
}

// Exemple de page complète avec le provider
export function DashboardNavigationExample() {
  return (
    <div className="space-y-6">
      <NavigationControls />
      <DashboardViewRouter />
    </div>
  );
}

