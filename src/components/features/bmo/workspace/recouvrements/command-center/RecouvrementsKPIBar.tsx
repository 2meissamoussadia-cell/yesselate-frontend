/**
 * Barre de KPIs en temps réel pour Recouvrements
 * Indicateurs clés avec sparklines - inspiré d'Analytics/Gouvernance
 */

'use client';

import React, { useState, useMemo } from 'react';
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
import type { RecouvrementsStats } from '@/lib/services/recouvrementsApiService';
import { recouvrementsApiService } from '@/lib/services/recouvrementsApiService';

interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  onClick?: () => void;
}

interface RecouvrementsKPIBarProps {
  visible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
  stats?: RecouvrementsStats | null;
}

export function RecouvrementsKPIBar({
  visible = true,
  collapsed = false,
  onToggleCollapse,
  onRefresh,
  stats,
}: RecouvrementsKPIBarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate] = useState(new Date());

  const kpis: KPIItem[] = useMemo(() => {
    if (!stats) {
      // KPIs par défaut
      return [
        { id: 'total', label: 'Total créances', value: 0, trend: 'stable', status: 'neutral' },
        { id: 'pending', label: 'En attente', value: 0, trend: 'stable', status: 'warning' },
        { id: 'in_progress', label: 'En cours', value: 0, trend: 'stable', status: 'neutral' },
        { id: 'paid', label: 'Payées', value: 0, trend: 'stable', status: 'success' },
        { id: 'litige', label: 'En litige', value: 0, trend: 'stable', status: 'critical' },
        { id: 'overdue', label: 'Montant retard', value: '0 FCFA', trend: 'stable', status: 'critical' },
        { id: 'taux', label: 'Taux recouvrement', value: '0%', trend: 'stable', status: 'neutral' },
        { id: 'montant_total', label: 'Montant total', value: '0 FCFA', trend: 'stable', status: 'neutral' },
      ];
    }

    const formatMontant = (montant: number) => recouvrementsApiService.formatMontant(montant);
    const tauxStatus = stats.tauxRecouvrement >= 80 ? 'success' : stats.tauxRecouvrement >= 50 ? 'warning' : 'critical';

    return [
      {
        id: 'total',
        label: 'Total créances',
        value: stats.total,
        trend: 'stable',
        status: 'neutral',
      },
      {
        id: 'pending',
        label: 'En attente',
        value: stats.pending,
        trend: stats.pending > 0 ? 'up' : 'down',
        trendValue: stats.pending > 0 ? `+${stats.pending}` : '0',
        status: stats.pending > 10 ? 'warning' : 'success',
        sparkline: [Math.max(0, stats.pending - 5), Math.max(0, stats.pending - 3), Math.max(0, stats.pending - 1), stats.pending].filter(v => v >= 0),
      },
      {
        id: 'in_progress',
        label: 'En cours',
        value: stats.in_progress,
        trend: 'stable',
        status: 'neutral',
      },
      {
        id: 'paid',
        label: 'Payées',
        value: stats.paid,
        trend: 'up',
        trendValue: `+${stats.paid}`,
        status: 'success',
        sparkline: [Math.max(0, stats.paid - 10), Math.max(0, stats.paid - 7), Math.max(0, stats.paid - 4), Math.max(0, stats.paid - 2), stats.paid].filter(v => v >= 0),
      },
      {
        id: 'litige',
        label: 'En litige',
        value: stats.litige,
        trend: stats.litige > 0 ? 'up' : 'down',
        trendValue: stats.litige > 0 ? `+${stats.litige}` : '0',
        status: stats.litige > 0 ? 'critical' : 'success',
      },
      {
        id: 'overdue',
        label: 'Montant retard',
        value: formatMontant(stats.montantEnRetard),
        trend: stats.montantEnRetard > 0 ? 'up' : 'down',
        status: stats.montantEnRetard > 0 ? 'critical' : 'success',
      },
      {
        id: 'taux',
        label: 'Taux recouvrement',
        value: `${stats.tauxRecouvrement}%`,
        trend: stats.tauxRecouvrement >= 80 ? 'up' : stats.tauxRecouvrement >= 50 ? 'stable' : 'down',
        trendValue: stats.tauxRecouvrement >= 80 ? '+3%' : stats.tauxRecouvrement >= 50 ? '0%' : '-3%',
        status: tauxStatus,
        sparkline: [
          Math.max(0, stats.tauxRecouvrement - 10),
          Math.max(0, stats.tauxRecouvrement - 7),
          Math.max(0, stats.tauxRecouvrement - 4),
          Math.max(0, stats.tauxRecouvrement - 2),
          stats.tauxRecouvrement
        ].filter(v => v >= 0 && v <= 100),
      },
      {
        id: 'montant_total',
        label: 'Montant total',
        value: formatMontant(stats.montantTotal),
        trend: 'stable',
        status: 'neutral',
      },
    ];
  }, [stats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  const formatLastUpdate = useMemo(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

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

const KPICard = React.memo(function KPICard({ kpi }: { kpi: KPIItem }) {
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
    down: kpi.status === 'critical' ? 'text-emerald-400' : 'text-amber-400',
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
            const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
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
});

