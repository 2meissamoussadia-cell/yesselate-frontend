/**
 * Barre de KPIs en temps réel pour Analytics
 * Indicateurs clés - inspiré de la page Gouvernance
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
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';

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
    id: 'kpis-total',
    label: 'KPIs Actifs',
    value: 24,
    trend: 'stable',
    status: 'neutral',
  },
  {
    id: 'performance-score',
    label: 'Score Performance',
    value: '87%',
    trend: 'up',
    trendValue: '+3%',
    status: 'success',
    sparkline: [72, 75, 78, 82, 85, 86, 87],
  },
  {
    id: 'alerts-active',
    label: 'Alertes Actives',
    value: 8,
    trend: 'down',
    trendValue: '-2',
    status: 'warning',
  },
  {
    id: 'budget-execution',
    label: 'Exécution Budget',
    value: '72%',
    trend: 'up',
    trendValue: '+5%',
    status: 'success',
    sparkline: [55, 58, 62, 65, 68, 70, 72],
  },
  {
    id: 'sla-compliance',
    label: 'Conformité SLA',
    value: '94%',
    trend: 'stable',
    status: 'success',
  },
  {
    id: 'reports-generated',
    label: 'Rapports Générés',
    value: 45,
    trend: 'up',
    trendValue: '+12',
    status: 'neutral',
  },
  {
    id: 'trends-detected',
    label: 'Tendances',
    value: 12,
    trend: 'stable',
    status: 'neutral',
  },
  {
    id: 'bureaux-tracked',
    label: 'Bureaux Suivis',
    value: 8,
    trend: 'stable',
    status: 'neutral',
  },
];

interface AnalyticsKPIBarProps {
  visible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
}

export const AnalyticsKPIBar = React.memo(function AnalyticsKPIBar({
  visible = true,
  collapsed = false,
  onToggleCollapse,
  onRefresh,
}: AnalyticsKPIBarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
    setLastUpdate(new Date()); // ✅ Mettre à jour le timestamp
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
          {mockKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
});

const KPICard = React.memo(function KPICard({ kpi }: { kpi: KPIItem }) {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  
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
    openDetailPanel('kpi', kpi.id, {
      name: kpi.label,
      value: kpi.value,
      trend: kpi.trend,
      trendValue: kpi.trendValue,
      status: kpi.status,
      sparkline: kpi.sparkline,
    });
    
    // Ou ouvrir directement la modal complète:
    // openModal('kpi-detail', { kpiId: kpi.id });
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

