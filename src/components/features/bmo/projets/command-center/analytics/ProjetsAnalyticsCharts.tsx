/**
 * Analytics Charts pour Projets Command Center
 * Graphiques sophistiqués inspirés du Blocked Command Center
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Target,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TREND CHART - Évolution des projets dans le temps
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsTrendChart({ data, height = 200 }: { data: TimeSeriesPoint[]; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Évolution des projets
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>6 derniers mois</span>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={height * ratio}
              x2="100%"
              y2={height * ratio}
              stroke="rgb(51, 65, 85)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
          ))}

          {/* Line chart */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = height - ((d.value - minValue) / range) * (height * 0.9) - height * 0.05;
              return `${x}%,${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgb(52, 211, 153)"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Area fill */}
          <polygon
            points={[
              ...data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = height - ((d.value - minValue) / range) * (height * 0.9) - height * 0.05;
                return `${x}%,${y}`;
              }),
              `100%,${height}`,
              `0%,${height}`
            ].join(' ')}
            fill="url(#gradientGreen)"
            opacity="0.2"
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = height - ((d.value - minValue) / range) * (height * 0.9) - height * 0.05;
            return (
              <g key={i}>
                <circle
                  cx={`${x}%`}
                  cy={y}
                  r="4"
                  fill="rgb(52, 211, 153)"
                  className="transition-all duration-300 hover:r-6"
                />
                <circle
                  cx={`${x}%`}
                  cy={y}
                  r="8"
                  fill="rgb(52, 211, 153)"
                  opacity="0"
                  className="hover:opacity-20 cursor-pointer"
                />
              </g>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          {data.map((d, i) => (
            <span key={i} className="truncate">{d.label || d.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS DISTRIBUTION CHART - Répartition par statut
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsStatusChart({ data }: { data: ChartDataPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <PieChart className="w-4 h-4 text-blue-400" />
        Répartition par statut
      </h3>

      <div className="space-y-2">
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-medium">{item.value}</span>
                  <span className="text-slate-400 text-xs">{percentage.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    item.color || 'bg-emerald-500'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BUREAU PERFORMANCE CHART - Performance par bureau
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsBureauPerformanceChart({ data }: { data: { bureau: string; count: number; onTime: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-purple-400" />
        Performance par bureau
      </h3>

      <div className="space-y-3">
        {data.map((item, i) => {
          const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const onTimeColor = item.onTime >= 85 ? 'bg-emerald-500' : item.onTime >= 70 ? 'bg-amber-500' : 'bg-rose-500';
          
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">{item.bureau}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{item.count} projets</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className={cn(
                      'text-xs font-medium',
                      item.onTime >= 85 ? 'text-emerald-400' : item.onTime >= 70 ? 'text-amber-400' : 'text-rose-400'
                    )}>
                      {item.onTime}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-6 bg-slate-800/50 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {widthPercent > 20 && (
                      <span className="text-xs font-medium text-white">{item.count}</span>
                    )}
                  </div>
                </div>
                <div className={cn('w-16 h-6 rounded-lg flex items-center justify-center', onTimeColor, 'bg-opacity-20 border border-current')}>
                  <span className="text-xs font-medium">{item.onTime}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET HEALTH CHART - Santé financière
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsBudgetHealthChart({ 
  allocated, 
  consumed, 
  committed, 
  forecast 
}: { 
  allocated: number; 
  consumed: number; 
  committed: number; 
  forecast: number;
}) {
  const consumedPercent = (consumed / allocated) * 100;
  const committedPercent = (committed / allocated) * 100;
  const remainingPercent = 100 - consumedPercent - committedPercent;
  const overBudget = forecast > allocated;

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}Md`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    return `${(amount / 1_000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-amber-400" />
        Santé financière globale
      </h3>

      {/* Stacked Bar */}
      <div className="space-y-2">
        <div className="h-8 bg-slate-800/50 rounded-lg overflow-hidden flex">
          <div
            className="bg-rose-500 flex items-center justify-center text-xs font-medium text-white transition-all duration-500"
            style={{ width: `${consumedPercent}%` }}
          >
            {consumedPercent > 10 && `${consumedPercent.toFixed(0)}%`}
          </div>
          <div
            className="bg-amber-500 flex items-center justify-center text-xs font-medium text-white transition-all duration-500"
            style={{ width: `${committedPercent}%` }}
          >
            {committedPercent > 10 && `${committedPercent.toFixed(0)}%`}
          </div>
          <div
            className="bg-emerald-500 flex items-center justify-center text-xs font-medium text-white transition-all duration-500"
            style={{ width: `${remainingPercent}%` }}
          >
            {remainingPercent > 10 && `${remainingPercent.toFixed(0)}%`}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span className="text-slate-400">Consommé</span>
            <span className="text-slate-200 font-medium">{formatCurrency(consumed)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-slate-400">Engagé</span>
            <span className="text-slate-200 font-medium">{formatCurrency(committed)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-400">Disponible</span>
            <span className="text-slate-200 font-medium">{formatCurrency(allocated - consumed - committed)}</span>
          </div>
        </div>
      </div>

      {/* Forecast Alert */}
      {overBudget && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <div className="text-xs text-slate-300">
            Prévision de dépassement : <span className="font-medium text-rose-400">{formatCurrency(forecast - allocated)}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Budget alloué</div>
          <div className="text-lg font-bold text-slate-200">{formatCurrency(allocated)}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Prévision finale</div>
          <div className={cn(
            'text-lg font-bold',
            overBudget ? 'text-rose-400' : 'text-emerald-400'
          )}>
            {formatCurrency(forecast)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DISTRIBUTION CHART - Répartition par type
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsTypeDistributionChart({ data }: { data: ChartDataPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500', 'bg-green-500'];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <Target className="w-4 h-4 text-cyan-400" />
        Répartition par type
      </h3>

      {/* Horizontal bars */}
      <div className="space-y-2">
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-32 text-sm text-slate-400 truncate">{item.label}</div>
              <div className="flex-1 h-8 bg-slate-800/50 rounded-lg overflow-hidden relative">
                <div
                  className={cn(
                    'h-full transition-all duration-500 flex items-center px-3 justify-between',
                    colors[i % colors.length]
                  )}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 15 && (
                    <>
                      <span className="text-xs font-medium text-white">{item.value}</span>
                      <span className="text-xs font-medium text-white/80">{percentage.toFixed(0)}%</span>
                    </>
                  )}
                </div>
                {percentage <= 15 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-300">
                    {item.value} ({percentage.toFixed(0)}%)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE CHART - Jalons à venir
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsTimelineChart({ 
  milestones 
}: { 
  milestones: { id: string; title: string; date: string; status: 'pending' | 'at-risk' | 'completed'; projectTitle: string }[] 
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-orange-400" />
        Prochains jalons
      </h3>

      <div className="space-y-3">
        {milestones.map((milestone, i) => {
          const statusConfig = {
            completed: { color: 'bg-emerald-500', textColor: 'text-emerald-400', icon: CheckCircle2 },
            'at-risk': { color: 'bg-rose-500', textColor: 'text-rose-400', icon: AlertTriangle },
            pending: { color: 'bg-blue-500', textColor: 'text-blue-400', icon: Clock },
          };
          const config = statusConfig[milestone.status];
          const Icon = config.icon;

          return (
            <div key={i} className="flex gap-3">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.color, 'bg-opacity-20')}>
                  <Icon className={cn('w-4 h-4', config.textColor)} />
                </div>
                {i < milestones.length - 1 && (
                  <div className="w-px h-full bg-slate-700/50 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{milestone.title}</p>
                    <p className="text-xs text-slate-400">{milestone.projectTitle}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(milestone.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEAM UTILIZATION CHART - Utilisation des équipes
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsTeamUtilizationChart({ 
  teams 
}: { 
  teams: { name: string; utilization: number; available: number; projects: number }[] 
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <Users className="w-4 h-4 text-green-400" />
        Utilisation des équipes
      </h3>

      <div className="space-y-3">
        {teams.map((team, i) => {
          const isOverloaded = team.utilization > 90;
          const isUnderutilized = team.utilization < 60;
          
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{team.name}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">{team.projects} projets</span>
                  <span className={cn(
                    'font-medium',
                    isOverloaded ? 'text-rose-400' : isUnderutilized ? 'text-amber-400' : 'text-emerald-400'
                  )}>
                    {team.utilization}%
                  </span>
                </div>
              </div>
              
              <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isOverloaded ? 'bg-rose-500' : isUnderutilized ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${Math.min(team.utilization, 100)}%` }}
                />
                {team.utilization > 100 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                  </div>
                )}
              </div>
              
              {team.available > 0 && (
                <div className="text-xs text-slate-400">
                  {team.available}% disponible
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS CHARTS WRAPPER - Composant wrapper pour afficher plusieurs graphiques
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsAnalyticsCharts() {
  // Données mock pour les graphiques (à remplacer par des données réelles)
  const trendData = [
    { date: '2024-01', value: 45, label: 'Janv' },
    { date: '2024-02', value: 52, label: 'Févr' },
    { date: '2024-03', value: 48, label: 'Mars' },
    { date: '2024-04', value: 55, label: 'Avr' },
    { date: '2024-05', value: 58, label: 'Mai' },
    { date: '2024-06', value: 62, label: 'Juin' },
  ];

  const statusData = [
    { label: 'En cours', value: 18, color: 'bg-emerald-500' },
    { label: 'Planification', value: 8, color: 'bg-blue-500' },
    { label: 'En retard', value: 5, color: 'bg-rose-500' },
    { label: 'Terminés', value: 32, color: 'bg-slate-500' },
  ];

  const typeData = [
    { label: 'Infrastructure', value: 12 },
    { label: 'Bâtiment', value: 18 },
    { label: 'Réhabilitation', value: 8 },
    { label: 'Urbanisme', value: 6 },
    { label: 'Environnement', value: 4 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trend Chart */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <ProjetsTrendChart data={trendData} />
      </div>

      {/* Status Distribution */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <ProjetsStatusChart data={statusData} />
      </div>

      {/* Type Distribution */}
      <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <ProjetsTypeDistributionChart data={typeData} />
      </div>
    </div>
  );
}

