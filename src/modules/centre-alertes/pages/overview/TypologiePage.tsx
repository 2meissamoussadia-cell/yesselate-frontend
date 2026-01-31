/**
 * Page : Vue d'ensemble > Synthèse par typologie
 */

'use client';

import React from 'react';
import { useAlertesStats } from '../../hooks';
import { PieChart } from 'lucide-react';

export function TypologiePage() {
  const { data: stats, isLoading } = useAlertesStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des données...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Aucune donnée disponible</div>
      </div>
    );
  }

  const typologies = [
    { label: 'Critiques', value: stats.parTypologie.CRITIQUE, color: 'red' },
    { label: 'SLA', value: stats.parTypologie.SLA, color: 'amber' },
    { label: 'RH', value: stats.parTypologie.RH, color: 'blue' },
    { label: 'Projets', value: stats.parTypologie.PROJET, color: 'purple' },
  ];

  const total = stats.total || 1;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Synthèse par typologie</h2>
        <p className="text-sm text-slate-400">
          Répartition des alertes par catégorie
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique simplifié */}
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">Répartition par typologie</h3>
          </div>
          <div className="space-y-3">
            {typologies.map((typologie) => (
              <div key={typologie.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{typologie.label}</span>
                  <span className="text-sm font-medium text-slate-200">{typologie.value}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${typologie.color}-500`}
                    style={{ width: `${(typologie.value / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liste détaillée */}
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Détails par typologie</h3>
          <div className="space-y-3">
            {typologies.map((typologie) => (
              <div
                key={typologie.label}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
              >
                <span className="text-sm text-slate-300">{typologie.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-200">{typologie.value}</span>
                  <span className="text-xs text-slate-400">
                    ({((typologie.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

