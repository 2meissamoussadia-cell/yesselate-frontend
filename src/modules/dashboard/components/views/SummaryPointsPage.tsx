/**
 * Composant pour afficher les points clés (overview/summary/points)
 * ✅ Phase 8: Composant dédié créé pour remplacer le render inline
 */

'use client';

import React from 'react';
import type { OverviewSummaryPointsData } from '../../types/dashboard.readmodels';

interface SummaryPointsPageProps {
  data: OverviewSummaryPointsData;
}

export function SummaryPointsPage({ data }: SummaryPointsPageProps) {
  const { points = [] } = data;

  if (points.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Points clés</h2>
        <p className="text-slate-400">Aucun point clé disponible</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Points clés</h2>
      <div className="space-y-3">
        {points.map((point) => (
          <div
            key={point.id}
            className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{point.label}:</span>
              <div className="flex items-center gap-2">
                {point.trend && (
                  <span
                    className={`text-xs font-medium ${
                      typeof point.trend === 'string' && point.trend.startsWith('+')
                        ? 'text-emerald-400'
                        : typeof point.trend === 'string' && point.trend.startsWith('-')
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {point.trend}
                  </span>
                )}
                <span
                  className={`font-semibold text-lg ${
                    point.color === 'emerald'
                      ? 'text-emerald-400'
                      : point.color === 'rose'
                      ? 'text-rose-400'
                      : point.color === 'amber'
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {typeof point.value === 'number'
                    ? point.value.toLocaleString('fr-FR')
                    : point.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
