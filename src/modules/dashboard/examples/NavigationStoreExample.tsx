/**
 * Exemple d'utilisation du store de navigation Zustand
 * 
 * @example
 * const { main, sub, leaf, setMain, setSub, setLeaf, navigate } = useNavigationStore();
 * navigate('overview', 'kpis', 'projet');
 */

'use client';

import React from 'react';
import { useNavigationStore } from '@/lib/stores/navigationStore';
import { DashboardViewRouter } from '../components/DashboardViewRouter';

/**
 * Exemple de composant qui utilise le store de navigation
 */
export function NavigationStoreExample() {
  const { main, sub, leaf, setMain, setSub, setLeaf, navigate, reset } = useNavigationStore();

  return (
    <div className="space-y-6">
      {/* Affichage de l'état actuel */}
      <div className="p-4 space-y-4 bg-slate-800/40 rounded-lg">
        <div>
          <p className="text-sm text-slate-400 mb-2">État actuel du store:</p>
          <p className="text-white font-mono">
            main: {main} → sub: {sub || 'null'} → leaf: {leaf || 'null'}
          </p>
        </div>

        {/* Navigation avec navigate() */}
        <div>
          <p className="text-sm text-slate-400 mb-2">Navigation complète:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('overview', 'kpis', 'projet')}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
            >
              navigate('overview', 'kpis', 'projet')
            </button>
            <button
              onClick={() => navigate('overview', 'kpis', 'budget')}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
            >
              navigate('overview', 'kpis', 'budget')
            </button>
            <button
              onClick={() => navigate('overview', 'summary', null)}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
            >
              navigate('overview', 'summary')
            </button>
          </div>
        </div>

        {/* Setters individuels */}
        <div>
          <p className="text-sm text-slate-400 mb-2">Setters individuels:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMain('overview')}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
            >
              setMain('overview')
            </button>
            <button
              onClick={() => setSub('kpis')}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
            >
              setSub('kpis')
            </button>
            <button
              onClick={() => setSub('summary')}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
            >
              setSub('summary')
            </button>
            <button
              onClick={() => setLeaf('projet')}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
            >
              setLeaf('projet')
            </button>
            <button
              onClick={() => setLeaf('budget')}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
            >
              setLeaf('budget')
            </button>
          </div>
        </div>

        {/* Reset */}
        <div>
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded text-sm text-red-300 transition-colors"
          >
            Reset (retour aux valeurs par défaut)
          </button>
        </div>
      </div>

      {/* Le routeur utilise automatiquement le store */}
      <DashboardViewRouter debug={true} />
    </div>
  );
}

