/**
 * Exemple d'utilisation des boutons de navigation
 * 
 * @example
 * <NavigationButtonsExample />
 */

'use client';

import React from 'react';
import { KpiProjetButton, KpiBudgetButton } from '../components/buttons';
import { useDashboardNavigationWithUrl } from '../components/buttons/useDashboardNavigation';

export function NavigationButtonsExample() {
  const { navigate } = useDashboardNavigationWithUrl();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Boutons de navigation</h2>
        
        <div className="space-y-4">
          {/* Boutons prédéfinis */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Boutons prédéfinis:</p>
            <div className="flex flex-wrap gap-2">
              <KpiProjetButton />
              <KpiBudgetButton />
              <KpiProjetButton variant="outline" size="lg">
                Voir les KPIs Projet
              </KpiProjetButton>
              <KpiBudgetButton variant="ghost" size="sm">
                Budget
              </KpiBudgetButton>
            </div>
          </div>

          {/* Navigation personnalisée avec le hook */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Navigation personnalisée:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('overview', 'summary', null)}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
              >
                Aller à Summary
              </button>
              <button
                onClick={() => navigate('overview', 'kpis', null)}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
              >
                Aller à KPIs Overview
              </button>
              <button
                onClick={() => navigate('overview', null, null)}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 rounded text-sm text-slate-300 transition-colors"
              >
                Aller à Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

