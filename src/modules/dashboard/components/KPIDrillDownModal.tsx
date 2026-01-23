/**
 * Modal de drill-down pour les KPIs avec détails et graphiques
 */

'use client';

import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zIndexClass } from '../utils/zIndex';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPIDrillDownModalProps {
  kpi: {
    label: string;
    value: string | number;
    type: 'demandes' | 'validations' | 'budget' | 'other';
  };
  isOpen: boolean;
  onClose: () => void;
  historicalData?: Array<{ date: string; value: number }>;
}

export function KPIDrillDownModal({ kpi, isOpen, onClose, historicalData }: KPIDrillDownModalProps) {
  if (!isOpen) return null;

  // Générer des données historiques si non fournies
  const chartData = useMemo(() => {
    const data = historicalData || Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: typeof kpi.value === 'number' 
          ? kpi.value + Math.floor(Math.random() * 50 - 25)
          : Math.floor(Math.random() * 100),
      };
    });

    const labels = data.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return {
      labels,
      datasets: [
        {
          label: kpi.label,
          data: data.map(d => d.value),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [kpi, historicalData]);

  const stats = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return null;
    const values = historicalData.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    const previous = values[values.length - 2] || current;
    const change = current - previous;
    const changePercent = previous !== 0 ? ((change / previous) * 100) : 0;

    return { avg, min, max, current, change, changePercent };
  }, [historicalData]);

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn", zIndexClass('modal'))}>
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white">{kpi.label}</h2>
            <p className="text-sm text-slate-400 mt-1">Détails et analyse</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {/* Valeur principale avec statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Valeur actuelle</p>
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
            </div>
            {stats && (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Moyenne</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.avg.toFixed(0)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Minimum</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.min}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Maximum</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.max}</p>
                </div>
              </>
            )}
          </div>

          {/* Variation */}
          {stats && (
            <div className={cn(
              'rounded-lg p-4 border',
              stats.change >= 0 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            )}>
              <div className="flex items-center gap-2">
                {stats.change >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className="text-sm text-slate-400">Variation</p>
                  <p className={cn(
                    'text-lg font-semibold',
                    stats.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)} ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Graphique historique */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Évolution historique</h3>
            <div className="h-64">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#cbd5e1' },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      titleColor: '#f1f5f9',
                      bodyColor: '#cbd5e1',
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' },
                    },
                    y: {
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-200">Période analysée</p>
              </div>
              <p className="text-xs text-slate-400">30 derniers jours</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-200">Type de métrique</p>
              </div>
              <p className="text-xs text-slate-400 capitalize">{kpi.type}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}


