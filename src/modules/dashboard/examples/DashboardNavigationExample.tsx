/**
 * Exemple d'utilisation du contexte de navigation Dashboard
 * 
 * @example
 * // Dans votre layout ou page principale
 * <DashboardNavigationProvider>
 *   <DashboardViewRouter />
 * </DashboardNavigationProvider>
 * 
 * // Dans un composant enfant
 * const { activeMain, setActiveMain, navigate } = useDashboardNavigation();
 * navigate('overview', 'kpis', 'projet');
 */

'use client';

import React from 'react';
import { DashboardNavigationProvider, useDashboardNavigation } from '../context/DashboardNavigationContext';
import { DashboardViewRouter } from '../components/DashboardViewRouter';

// Exemple de composant qui utilise la navigation
function NavigationControls() {
  const { main, sub, leaf, setMain, setSub, setLeaf } = useDashboardNavigation();

  return (
    <div className="p-4 space-y-4 bg-slate-800/40 rounded-lg">
      <div>
        <p className="text-sm text-slate-400 mb-2">Navigation actuelle:</p>
        <p className="text-white font-mono">
          {main} → {sub || 'null'} → {leaf || 'null'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setMain('overview');
            setSub('kpis');
            setLeaf('projet');
          }}
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
        >
          Navigate to Projet KPI
        </button>
        <button
          onClick={() => {
            setMain('overview');
            setSub('kpis');
            setLeaf('budget');
          }}
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
        >
          Navigate to Budget KPI
        </button>
        <button
          onClick={() => {
            setMain('overview');
            setSub('summary');
            setLeaf(null);
          }}
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
        >
          Navigate to Summary
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMain('overview')}
          className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
        >
          Set Main: overview
        </button>
        <button
          onClick={() => setSub('kpis')}
          className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
        >
          Set Sub: kpis
        </button>
        <button
          onClick={() => setLeaf('projet')}
          className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
        >
          Set Leaf: projet
        </button>
      </div>
    </div>
  );
}

// Exemple de page complète avec le provider
export function DashboardNavigationExample() {
  return (
    <DashboardNavigationProvider>
      <div className="space-y-6">
        <NavigationControls />
        <DashboardViewRouter />
      </div>
    </DashboardNavigationProvider>
  );
}

