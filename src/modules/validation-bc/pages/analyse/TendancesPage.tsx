/**
 * Page : Analyse > Tendances
 */

'use client';

import React, { useState } from 'react';
import { useValidationStats } from '../../hooks';
import { TrendsChart } from '../../components/TrendsChart';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

export function TendancesPage() {
  const { data: stats, isLoading, error } = useValidationStats();
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des tendances...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des tendances</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-200">Tendances</h2>
          </div>
          <p className="text-sm text-slate-400">
            Analyse des tendances de validation sur différentes périodes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartType(chartType === 'line' ? 'area' : chartType === 'area' ? 'bar' : 'line')}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {chartType === 'line' ? 'Lignes' : chartType === 'area' ? 'Aires' : 'Barres'}
          </Button>
        </div>
      </div>

      {/* Graphique de tendances */}
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            Évolution sur 7 derniers jours
          </h3>
          <p className="text-xs text-slate-400">
            Analyse détaillée des tendances de validation
          </p>
        </div>
        <TrendsChart data={stats} type={chartType} height={400} showLegend />
      </div>

      {/* Métriques de tendances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-slate-800/50 border-slate-700/50">
          <div className="text-xs font-medium text-slate-400 mb-1">Taux de validation</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.tauxValidation.toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-lg border bg-slate-800/50 border-slate-700/50">
          <div className="text-xs font-medium text-slate-400 mb-1">Délai moyen</div>
          <div className="text-2xl font-bold text-amber-400">{stats.delaiMoyen.toFixed(1)} jours</div>
        </div>
        <div className="p-4 rounded-lg border bg-slate-800/50 border-slate-700/50">
          <div className="text-xs font-medium text-slate-400 mb-1">Documents total</div>
          <div className="text-2xl font-bold text-slate-300">{stats.totalDocuments}</div>
        </div>
      </div>
    </div>
  );
}
