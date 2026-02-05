/**
 * Modal de drill-down pour les KPIs avec détails et graphiques
 */

'use client';

import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { zIndexClass } from '../utils/zIndex';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
  const history = useMemo<Array<{ date: string; value: number }>>(() => {
    if (!isOpen) return [];
    if (historicalData && historicalData.length > 0) return historicalData;

    // Données mock déterministes (évite Math.random / Date.now → lint purity)
    const points = 30;
    const seed =
      kpi.label.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
      (typeof kpi.value === 'number' ? Math.round(kpi.value) : 0);

    const base = typeof kpi.value === 'number' ? kpi.value : (seed % 100);

    return Array.from({ length: points }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (points - 1 - i));

      const pr = ((seed * 9301 + i * 49297) % 233280) / 233280; // [0..1)
      const jitter = Math.floor((pr - 0.5) * 50); // ~[-25..+25]

      return {
        date: date.toISOString().split('T')[0],
        value: Math.max(0, Math.round(base + jitter)),
      };
    });
  }, [isOpen, historicalData, kpi.label, kpi.value]);

  // Préparer les données pour Recharts
  const chartData = useMemo(() => {
    return history.map((d) => {
      const date = new Date(d.date);
      return {
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        value: d.value,
        fullDate: d.date,
      };
    });
  }, [history]);

  const stats = useMemo(() => {
    if (!isOpen) return null;
    if (!history || history.length === 0) return null;
    const values = history.map((d) => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    const previous = values[values.length - 2] || current;
    const change = current - previous;
    const changePercent = previous !== 0 ? ((change / previous) * 100) : 0;

    return { avg, min, max, current, change, changePercent };
  }, [isOpen, history]);

  if (!isOpen) return null;

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
            <div className="h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: '#f1f5f9' }}
                    itemStyle={{ color: '#cbd5e1' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name={kpi.label}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
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


