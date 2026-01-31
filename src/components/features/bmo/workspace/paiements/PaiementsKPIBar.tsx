/**
 * Barre de KPIs en temps réel pour Validation Paiements
 * Indicateurs clés avec sparklines - inspiré d'Analytics
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

interface PaiementsKPIBarProps {
  kpis: KPIItem[];
  visible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const PaiementsKPIBar = React.memo(function PaiementsKPIBar({
  kpis,
  visible = true,
  collapsed = false,
  onToggleCollapse,
  onRefresh,
  isRefreshing = false,
}: PaiementsKPIBarProps) {
  const [lastUpdate] = useState(new Date());

  const handleRefresh = () => {
    onRefresh?.();
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
            disabled={isRefreshing}
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
});

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

  const CardWrapper = kpi.onClick ? 'button' : 'div';

  return (
    <CardWrapper
      onClick={kpi.onClick}
      className={cn(
        'bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors group',
        kpi.onClick && 'cursor-pointer'
      )}
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
      {kpi.sparkline && kpi.sparkline.length > 0 && (
        <div className="flex items-end gap-0.5 h-4 mt-1.5">
          {kpi.sparkline.map((val, i) => {
            const maxVal = Math.max(...kpi.sparkline!);
            const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
            
            // Couleur uniquement sur la dernière barre (valeur actuelle)
            const barColor = i === kpi.sparkline!.length - 1
              ? statusColors[kpi.status || 'neutral'].replace('text-', 'bg-')
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
    </CardWrapper>
  );
});

// Helper pour formatter les montants
export function formatMontantKPI(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}Md`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toString();
}

