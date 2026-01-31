/**
 * Barre de KPIs en temps réel pour Alertes
 * Indicateurs clés avec sparklines - inspiré de Gouvernance/Analytics
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AlertsKPIItem {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  onClick?: () => void;
}

interface AlertsKPIBarProps {
  visible?: boolean;
  collapsed?: boolean;
  stats?: {
    critical?: number;
    warning?: number;
    sla?: number;
    blocked?: number;
    acknowledged?: number;
    resolved?: number;
    avgResponseTime?: number;
    avgResolutionTime?: number;
    total?: number;
  };
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
  onKPIClick?: (kpiId: string) => void;
  isRefreshing?: boolean;
}

export function AlertsKPIBar({
  visible = true,
  collapsed = false,
  stats,
  onToggleCollapse,
  onRefresh,
  onKPIClick,
  isRefreshing = false,
}: AlertsKPIBarProps) {
  const [lastUpdate] = useState(new Date());

  const formatLastUpdate = useMemo(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // KPIs dynamiques basés sur les stats
  const kpis: AlertsKPIItem[] = useMemo(() => [
    {
      id: 'critical',
      label: 'Critiques',
      value: stats?.critical ?? 0,
      trend: stats?.critical && stats.critical > 0 ? 'up' : 'stable',
      status: stats?.critical && stats.critical > 0 ? 'critical' : 'neutral',
      onClick: () => onKPIClick?.('critical'),
    },
    {
      id: 'warning',
      label: 'Avertissements',
      value: stats?.warning ?? 0,
      trend: 'stable',
      status: stats?.warning && stats.warning > 0 ? 'warning' : 'neutral',
      onClick: () => onKPIClick?.('warning'),
    },
    {
      id: 'sla',
      label: 'SLA dépassés',
      value: stats?.sla ?? 0,
      trend: 'down',
      trendValue: '-2',
      status: stats?.sla && stats.sla > 0 ? 'warning' : 'neutral',
      onClick: () => onKPIClick?.('sla'),
    },
    {
      id: 'blocked',
      label: 'Bloqués',
      value: stats?.blocked ?? 0,
      status: stats?.blocked && stats.blocked > 0 ? 'warning' : 'neutral',
      onClick: () => onKPIClick?.('blocked'),
    },
    {
      id: 'acknowledged',
      label: 'Acquittées',
      value: stats?.acknowledged ?? 0,
      trend: 'up',
      trendValue: '+5',
      status: 'neutral',
      onClick: () => onKPIClick?.('acknowledged'),
    },
    {
      id: 'resolved',
      label: 'Résolues',
      value: stats?.resolved ?? 0,
      trend: 'up',
      trendValue: '+12',
      status: 'success',
      sparkline: [35, 38, 42, 45, 48, 52, stats?.resolved ?? 55],
      onClick: () => onKPIClick?.('resolved'),
    },
    {
      id: 'response-time',
      label: 'Temps réponse',
      value: stats?.avgResponseTime ? `${stats.avgResponseTime}m` : '15m',
      trend: 'down',
      trendValue: '-3m',
      status: 'success',
      sparkline: [25, 22, 20, 18, 17, 16, 15],
    },
    {
      id: 'resolution-time',
      label: 'Temps résolution',
      value: stats?.avgResolutionTime ? `${stats.avgResolutionTime}h` : '4h',
      trend: 'stable',
      status: 'neutral',
    },
  ], [stats, onKPIClick]);

  if (!visible) return null;

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Indicateurs en temps réel
          </span>
          <span className="text-xs text-slate-600">Mise à jour: {formatLastUpdate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
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
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      {!collapsed && (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-px bg-slate-800/30 p-px">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

function KPICard({ kpi }: { kpi: AlertsKPIItem }) {
  const TrendIcon =
    kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;

  const statusColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    neutral: 'text-slate-300',
  };

  const trendColors = {
    up: kpi.status === 'critical' ? 'text-red-400' : 'text-emerald-400',
    down: kpi.status === 'critical' ? 'text-emerald-400' : 'text-emerald-400',
    stable: 'text-slate-400',
  };

  return (
    <button
      onClick={kpi.onClick}
      className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors cursor-pointer group text-left w-full"
    >
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
        {kpi.trend && (
          <div className={cn('mt-0.5', trendColors[kpi.trend])}>
            <TrendIcon className="h-3.5 w-3.5" />
          </div>
        )}
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
    </button>
  );
}

