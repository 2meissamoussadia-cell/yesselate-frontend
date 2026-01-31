/**
 * Barre de KPIs en temps réel pour Délégations
 * Indicateurs clés - inspiré de la page Analytics
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
import { useDelegationsCommandCenterStore } from '@/lib/stores/delegationsCommandCenterStore';

interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
}

// Données de démonstration - en production, ces données viendraient d'une API
const mockKPIs: KPIItem[] = [
  {
    id: 'delegations-active',
    label: 'Délégations Actives',
    value: 0,
    trend: 'stable',
    status: 'neutral',
  },
  {
    id: 'delegations-expired',
    label: 'Expirées',
    value: 0,
    trend: 'stable',
    status: 'neutral',
  },
  {
    id: 'delegations-revoked',
    label: 'Révoquées',
    value: 0,
    trend: 'stable',
    status: 'neutral',
  },
  {
    id: 'delegations-suspended',
    label: 'Suspendues',
    value: 0,
    trend: 'stable',
    status: 'neutral',
  },
  {
    id: 'delegations-expiring',
    label: 'Expirant bientôt',
    value: 0,
    trend: 'up',
    trendValue: '+0',
    status: 'warning',
  },
  {
    id: 'performance-score',
    label: 'Score Performance',
    value: '0%',
    trend: 'stable',
    status: 'success',
    sparkline: [85, 87, 86, 88, 89, 88, 90],
  },
  {
    id: 'alerts-active',
    label: 'Alertes',
    value: 0,
    trend: 'stable',
    status: 'neutral',
  },
  {
    id: 'usage-total',
    label: 'Usage Total',
    value: 0,
    trend: 'stable',
    status: 'neutral',
  },
];

interface DelegationStats {
  active?: number;
  expired?: number;
  revoked?: number;
  suspended?: number;
  expiring?: number;
  performanceScore?: number;
  alerts?: number;
}

interface DelegationsKPIBarProps {
  visible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
  kpis?: KPIItem[];
  stats?: DelegationStats | null;
}

export const DelegationsKPIBar = React.memo(function DelegationsKPIBar({
  visible = true,
  collapsed = false,
  onToggleCollapse,
  onRefresh,
  kpis: providedKPIs,
  stats,
}: DelegationsKPIBarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mettre à jour les KPIs avec les stats réelles
  const kpis = useMemo(() => {
    if (!stats) return mockKPIs;
    
    return mockKPIs.map((kpi) => {
      switch (kpi.id) {
        case 'delegations-active':
          return { ...kpi, value: stats.active || 0 };
        case 'delegations-expired':
          return { ...kpi, value: stats.expired || 0 };
        case 'delegations-revoked':
          return { ...kpi, value: stats.revoked || 0 };
        case 'delegations-suspended':
          return { ...kpi, value: stats.suspended || 0 };
        case 'delegations-expiring':
          return { 
            ...kpi, 
            value: stats.expiringSoon || 0,
            status: (stats.expiringSoon || 0) > 0 ? 'warning' : 'neutral',
          };
        case 'usage-total':
          return { ...kpi, value: stats.totalUsage || 0 };
        default:
          return kpi;
      }
    });
  }, [stats]);

  const finalKPIs = providedKPIs || kpis;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
    setLastUpdate(new Date());
  };

  const formatLastUpdate = useMemo(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
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
          {finalKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
});

const KPICard = React.memo(function KPICard({ kpi }: { kpi: KPIItem }) {
  const { openDetailPanel, openModal } = useDelegationsCommandCenterStore();
  
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

  const handleClick = () => {
    // Ouvrir le panneau latéral pour vue rapide
    openDetailPanel('stat', kpi.id, {
      name: kpi.label,
      value: kpi.value,
      trend: kpi.trend,
      trendValue: kpi.trendValue,
      status: kpi.status,
      sparkline: kpi.sparkline,
    });
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors cursor-pointer group"
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
});

