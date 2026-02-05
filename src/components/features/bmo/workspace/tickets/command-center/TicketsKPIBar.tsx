/**
 * Barre de KPIs en temps réel pour Tickets
 * 8 indicateurs clés pour surveillance opérationnelle
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KPIItem {
  id: string;
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
}

// Données de démonstration - en production, ces données viendraient d'une API
const mockTicketsKPIs: KPIItem[] = [
  {
    id: 'tickets-open',
    label: 'Tickets ouverts',
    value: 42,
    trend: 'down',
    trendValue: '-5',
    status: 'success',
  },
  {
    id: 'critical-tickets',
    label: 'Critiques',
    value: 5,
    trend: 'up',
    trendValue: '+2',
    status: 'critical',
  },
  {
    id: 'avg-response-time',
    label: 'Temps réponse',
    value: '2.4h',
    trend: 'down',
    trendValue: '-15min',
    status: 'success',
    sparkline: [4.2, 3.8, 3.5, 3.0, 2.8, 2.5, 2.4],
  },
  {
    id: 'resolution-rate',
    label: 'Taux résolution',
    value: '94%',
    trend: 'up',
    trendValue: '+3%',
    status: 'success',
    sparkline: [85, 87, 89, 91, 92, 93, 94],
  },
  {
    id: 'sla-compliance',
    label: 'SLA respecté',
    value: '89%',
    trend: 'stable',
    status: 'warning',
  },
  {
    id: 'pending-tickets',
    label: 'En attente',
    value: 18,
    trend: 'up',
    trendValue: '+4',
    status: 'warning',
  },
  {
    id: 'resolved-today',
    label: 'Résolus aujourd\'hui',
    value: 28,
    trend: 'up',
    trendValue: '+8',
    status: 'success',
  },
  {
    id: 'satisfaction-score',
    label: 'Satisfaction',
    value: '4.6/5',
    trend: 'stable',
    status: 'success',
    sparkline: [4.3, 4.4, 4.4, 4.5, 4.5, 4.6, 4.6],
  },
];

interface TicketsKPIBarProps {
  visible?: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRefresh?: () => void;
}

export const TicketsKPIBar = React.memo(function TicketsKPIBar({
  visible = true,
  collapsed,
  onToggleCollapse,
  onRefresh,
}: TicketsKPIBarProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const formatLastUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  };

  if (!visible) return null;

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Indicateurs en temps réel
          </span>
          <span className="text-xs text-slate-600">
            Mise à jour: {formatLastUpdate()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300"
          >
            {collapsed ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      {!collapsed && (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-px bg-slate-800/30 p-px">
          {mockTicketsKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
});

function KPICard({ kpi }: { kpi: KPIItem }) {
  const TrendIcon =
    kpi.trend === 'up'
      ? TrendingUp
      : kpi.trend === 'down'
      ? TrendingDown
      : Minus;

  const statusColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    neutral: 'text-slate-300',
  };

  const trendColors = {
    up: kpi.status === 'critical' ? 'text-red-400' : 'text-emerald-400',
    down: kpi.status === 'critical' ? 'text-emerald-400' : kpi.status === 'success' ? 'text-emerald-400' : 'text-amber-400',
    stable: 'text-slate-400',
  };

  return (
    <div className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400 truncate mb-0.5 group-hover:text-slate-400 transition-colors">
            {kpi.label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-lg font-bold', statusColors[kpi.status || 'neutral'])}>
              {kpi.value}
            </span>
            {kpi.trendValue && (
              <span className={cn('text-xs font-medium', trendColors[kpi.trend || 'stable'])}>
                {kpi.trendValue}
              </span>
            )}
          </div>
        </div>

        {/* Trend Icon */}
        <div className={cn('mt-0.5', trendColors[kpi.trend || 'stable'])}>
          <TrendIcon className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Mini Sparkline */}
      {kpi.sparkline && (
        <div className="flex items-end gap-0.5 h-4 mt-1.5">
          {kpi.sparkline.map((val, i) => {
            const maxVal = Math.max(...kpi.sparkline!);
            const height = (val / maxVal) * 100;
            return (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-sm',
                  i === kpi.sparkline!.length - 1
                    ? statusColors[kpi.status || 'neutral'].replace('text-', 'bg-')
                    : 'bg-slate-700/60'
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export type { KPIItem };

