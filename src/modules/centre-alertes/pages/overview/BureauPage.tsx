/**
 * Page : Vue d'ensemble > Synthèse par bureau
 */

'use client';

import React from 'react';
import { useAlertesStats } from '../../hooks';
import { Building2 } from 'lucide-react';

export function BureauPage() {
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

  const bureaux = Object.entries(stats.parBureau)
    .map(([bureau, count]) => ({ bureau, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Synthèse par bureau</h2>
        <p className="text-sm text-slate-400">
          Répartition des alertes par bureau
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tableau */}
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">Alertes par bureau</h3>
          </div>
          <div className="space-y-2">
            {bureaux.map(({ bureau, count }) => (
              <div
                key={bureau}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
              >
                <span className="text-sm text-slate-300">{bureau}</span>
                <span className="text-lg font-bold text-slate-200">{count}</span>
              </div>
            ))}
            {bureaux.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-4">
                Aucune alerte par bureau
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

