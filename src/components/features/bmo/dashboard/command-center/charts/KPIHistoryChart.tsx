/**
 * Graphique d'historique pour les KPIs
 * Affiche l'évolution temporelle avec plusieurs types de visualisation
 */

'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type ChartType = 'line' | 'area' | 'bar';

interface KPIHistoryChartProps {
  data: Array<{ date: string; value: number }>;
  type?: ChartType;
  target?: number;
  tone?: 'ok' | 'warn' | 'crit' | 'info';
  trend?: 'up' | 'down' | 'neutral';
  height?: number;
  showTarget?: boolean;
  showTrend?: boolean;
  className?: string;
}

const COLORS = {
  ok: {
    fill: 'rgba(16, 185, 129, 0.1)',
    stroke: '#10b981',
    active: '#34d399',
  },
  warn: {
    fill: 'rgba(245, 158, 11, 0.1)',
    stroke: '#f59e0b',
    active: '#fbbf24',
  },
  crit: {
    fill: 'rgba(239, 68, 68, 0.1)',
    stroke: '#ef4444',
    active: '#f87171',
  },
  info: {
    fill: 'rgba(59, 130, 246, 0.1)',
    stroke: '#3b82f6',
    active: '#60a5fa',
  },
};

export function KPIHistoryChart({
  data,
  type = 'area',
  target,
  tone = 'info',
  trend = 'neutral',
  height = 300,
  showTarget = true,
  showTrend = true,
  className,
}: KPIHistoryChartProps) {
  const colors = COLORS[tone];
  
  // Formater les données pour le graphique
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('fr-FR', { 
        month: 'short', 
        day: 'numeric' 
      }),
    }));
  }, [data]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[values.length - 1];
    const previous = values[values.length - 2] || current;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    return { min, max, avg, current, previous, change, changePercent };
  }, [data]);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/50 rounded-lg p-3 shadow-xl backdrop-blur-xl">
          <p className="text-xs text-slate-400 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-slate-200">
                  {entry.name || 'Valeur'}: {entry.value}
                </span>
              </div>
            ))}
            {target && (
              <div className="pt-1 mt-1 border-t border-slate-700/50">
                <span className="text-xs text-slate-400">Objectif: {target}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {showTarget && target && (
              <ReferenceLine
                y={target}
                stroke={colors.stroke}
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{ value: 'Objectif', position: 'right', fill: colors.stroke }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={2}
              dot={{ fill: colors.stroke, r: 4 }}
              activeDot={{ r: 6, fill: colors.active }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {showTarget && target && (
              <ReferenceLine
                y={target}
                stroke={colors.stroke}
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{ value: 'Objectif', position: 'right', fill: colors.stroke }}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#gradient-${tone})`}
              activeDot={{ r: 6, fill: colors.active }}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {showTarget && target && (
              <ReferenceLine
                y={target}
                stroke={colors.stroke}
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{ value: 'Objectif', position: 'right', fill: colors.stroke }}
              />
            )}
            <Bar
              dataKey="value"
              fill={colors.stroke}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Statistiques */}
      {showTrend && (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Actuel</p>
            <p className="text-lg font-bold text-slate-200">{stats.current.toFixed(1)}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Moyenne</p>
            <p className="text-lg font-bold text-slate-200">{stats.avg.toFixed(1)}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Min</p>
            <p className="text-lg font-bold text-slate-200">{stats.min.toFixed(1)}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Max</p>
            <p className="text-lg font-bold text-slate-200">{stats.max.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Graphique */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Indicateur de tendance */}
      {showTrend && stats.change !== 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
            {trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400" />}
            <span className="text-sm text-slate-400">Variation</span>
          </div>
          <div className={cn(
            'text-sm font-semibold',
            stats.change > 0 ? 'text-emerald-400' : stats.change < 0 ? 'text-red-400' : 'text-slate-400'
          )}>
            {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} ({stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
}


