/**
 * Exemple d'utilisation du DashboardViewRouter avec paramètres d'URL
 * 
 * @example
 * // URL: /dashboard?main=overview&sub=kpis&leaf=projet
 * // Affichera automatiquement <ProjetKpiPage />
 * 
 * // URL: /dashboard?main=overview&sub=summary
 * // Affichera automatiquement <SummaryPage />
 * 
 * // URL: /dashboard?main=overview
 * // Affichera automatiquement <OverviewPage />
 */

'use client';

import React from 'react';
import { DashboardViewRouter } from '../components/DashboardViewRouter';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Exemple de composant qui utilise le routeur avec navigation par URL
 */
export function DashboardRouterWithURLExample() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fonction helper pour naviguer en mettant à jour l'URL
  const navigate = (main: string, sub?: string | null, leaf?: string | null) => {
    const params = new URLSearchParams();
    params.set('main', main);
    if (sub) params.set('sub', sub);
    if (leaf) params.set('leaf', leaf);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Contrôles de navigation */}
      <div className="p-4 space-y-4 bg-slate-800/40 rounded-lg">
        <div>
          <p className="text-sm text-slate-400 mb-2">Navigation actuelle (depuis URL):</p>
          <p className="text-white font-mono">
            main={searchParams.get('main') || 'overview'} → 
            sub={searchParams.get('sub') || 'null'} → 
            leaf={searchParams.get('leaf') || 'null'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('overview', 'kpis', 'projet')}
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
            onClick={() => navigate('overview', 'kpis', null)}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
          >
            Navigate to KPI Overview
          </button>
          <button
            onClick={() => navigate('overview', 'summary', null)}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
          >
            Navigate to Summary
          </button>
          <button
            onClick={() => navigate('overview', null, null)}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-sm text-blue-300 transition-colors"
          >
            Navigate to Overview
          </button>
        </div>
      </div>

      {/* Le routeur lit automatiquement les paramètres d'URL */}
      <DashboardViewRouter debug={true} />
    </div>
  );
}

