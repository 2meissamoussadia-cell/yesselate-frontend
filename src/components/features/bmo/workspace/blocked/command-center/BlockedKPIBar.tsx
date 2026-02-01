/**
 * Barre de KPIs en temps réel pour les Blocages
 * Architecture identique au Dashboard
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  FileText,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlockedCommandCenterStore } from '@/lib/stores/blockedCommandCenterStore';

interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'stable';
  trendValue?: string;
  status: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  onClick?: () => void;
}

interface BlockedKPIBarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function BlockedKPIBar({ onRefresh, isRefreshing = false }: BlockedKPIBarProps) {
  const { kpiConfig, setKPIConfig, stats, navigate } = useBlockedCommandCenterStore();

  if (!kpiConfig.visible) return null;

  const kpis: KPIItem[] = [
    {
      id: 'total',
      label: 'Total blocages',
      value: stats?.total ?? 0,
      icon: FileText,
      trend: 'stable',
      status: 'neutral',
      onClick: () => navigate('queue'),
    },
    {
      id: 'critical',
      label: 'Critiques',
      value: stats?.critical ?? 0,
      icon: AlertCircle,
      trend: stats?.critical && stats.critical > 0 ? 'up' : 'stable',
      trendValue: stats?.critical && stats.critical > 0 ? `+${stats.critical}` : undefined,
      status: stats?.critical && stats.critical > 0 ? 'critical' : 'neutral',
      sparkline: stats?.critical ? [2, 3, 4, 3, 5, stats.critical] : undefined,
      onClick: () => navigate('critical'),
    },
    {
      id: 'high',
      label: 'Priorité haute',
      value: stats?.high ?? 0,
      icon: TrendingUp,
      trend: 'stable',
      status: stats?.high && stats.high > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'avgDelay',
      label: 'Délai moyen',
      value: `${stats?.avgDelay ?? 0}j`,
      icon: Clock,
      trend: stats?.avgDelay && stats.avgDelay > 7 ? 'up' : 'down',
      trendValue: stats?.avgDelay && stats.avgDelay > 7 ? '+' : '-',
      status: stats?.avgDelay && stats.avgDelay > 7 ? 'warning' : 'success',
      sparkline: stats?.avgDelay ? [4, 5, 6, 5, 7, stats.avgDelay] : undefined,
    },
    {
      id: 'overdueSLA',
      label: 'SLA dépassés',
      value: stats?.overdueSLA ?? 0,
      icon: Shield,
      trend: stats?.overdueSLA && stats.overdueSLA > 0 ? 'up' : 'stable',
      status: stats?.overdueSLA && stats.overdueSLA > 0 ? 'critical' : 'success',
    },
    {
      id: 'resolved',
      label: 'Résolus aujourd\'hui',
      value: stats?.resolvedToday ?? 0,
      icon: Zap,
      trend: stats?.resolvedToday && stats.resolvedToday > 0 ? 'up' : 'stable',
      trendValue: stats?.resolvedToday ? `+${stats.resolvedToday}` : undefined,
      status: stats?.resolvedToday && stats.resolvedToday > 0 ? 'success' : 'neutral',
      sparkline: [0, 1, 0, 2, 1, stats?.resolvedToday ?? 0],
      onClick: () => navigate('decisions'),
    },
    {
      id: 'bureaux',
      label: 'Bureaux impactés',
      value: stats?.byBureau?.length ?? 0,
      icon: Building2,
      trend: 'stable',
      status: 'neutral',
      onClick: () => navigate('bureaux'),
    },
    {
      id: 'amount',
      label: 'Montant bloqué',
      value: formatAmount(stats?.totalAmount ?? 0),
      icon: FileText,
      trend: 'stable',
      status: stats?.totalAmount && stats.totalAmount > 100000000 ? 'warning' : 'neutral',
    },
  ];

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Indicateurs en temps réel
          </span>
          {stats?.ts && (
            <span className="text-xs text-slate-600">
              Màj: {formatTimeAgo(stats.ts)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300"
          >
            {kpiConfig.collapsed ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      {!kpiConfig.collapsed && (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-px bg-slate-800/30 p-px">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPIItem }) {
  const TrendIcon =
    kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  const Icon = kpi.icon;

  const statusColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    neutral: 'text-slate-300',
  };

  const trendColors = {
    up: kpi.status === 'critical' ? 'text-red-400' : kpi.status === 'success' ? 'text-emerald-400' : 'text-amber-400',
    down: kpi.status === 'success' ? 'text-emerald-400' : 'text-amber-400',
    stable: 'text-slate-400',
  };

  return (
    <button
      onClick={kpi.onClick}
      disabled={!kpi.onClick}
      className={cn(
        "bg-slate-900/60 px-3 py-2 transition-colors text-left group",
        kpi.onClick && "hover:bg-slate-800/40 cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon className={cn("h-3 w-3", statusColors[kpi.status])} />
            <p className="text-xs text-slate-400 truncate group-hover:text-slate-400 transition-colors">
              {kpi.label}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-lg font-bold', statusColors[kpi.status])}>
              {kpi.value}
            </span>
            {kpi.trendValue && (
              <span className={cn('text-xs font-medium', trendColors[kpi.trend])}>
                {kpi.trendValue}
              </span>
            )}
          </div>
        </div>

        {/* Trend Icon */}
        <div className={cn('mt-0.5', trendColors[kpi.trend])}>
          <TrendIcon className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Mini Sparkline */}
      {kpi.sparkline && kpi.sparkline.length > 0 && (
        <div className="flex items-end gap-0.5 h-4 mt-1.5">
          {kpi.sparkline.map((val, i) => {
            const maxVal = Math.max(...kpi.sparkline!);
            const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
            
            // Couleur uniquement sur la dernière barre (valeur actuelle)
            const barColor = i === kpi.sparkline!.length - 1
              ? statusColors[kpi.status].replace('text-', 'bg-')
              : 'bg-slate-700/60';
            
            return (
              <div
                key={i}
                className={cn('flex-1 rounded-sm min-h-[2px]', barColor)}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
      )}
    </button>
  );
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}Md`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString('fr-FR');
}

function formatTimeAgo(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

