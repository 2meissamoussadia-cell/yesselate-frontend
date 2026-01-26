/**
 * Barre de KPIs en temps réel pour le Dashboard
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  trendValue?: string;
  status: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  onClick?: () => void;
}

interface DashboardKPIBarProps {
  kpis?: KPIItem[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Données de démonstration
const defaultKPIs: KPIItem[] = [
  {
    id: 'demandes',
    label: 'Demandes',
    value: 247,
    trend: 'up',
    trendValue: '+12',
    status: 'neutral',
  },
  {
    id: 'validations',
    label: 'Validations',
    value: '89%',
    trend: 'up',
    trendValue: '+3%',
    status: 'success',
    sparkline: [75, 78, 82, 85, 87, 88, 89],
  },
  {
    id: 'blocages',
    label: 'Blocages',
    value: 5,
    trend: 'down',
    trendValue: '-2',
    status: 'warning',
  },
  {
    id: 'risques',
    label: 'Risques critiques',
    value: 3,
    trend: 'up',
    trendValue: '+1',
    status: 'critical',
  },
  {
    id: 'budget',
    label: 'Budget consommé',
    value: '67%',
    trend: 'stable',
    status: 'neutral',
    sparkline: [45, 52, 58, 61, 63, 65, 67],
  },
  {
    id: 'decisions',
    label: 'Décisions en attente',
    value: 8,
    trend: 'stable',
    status: 'warning',
  },
  {
    id: 'tempsReponse',
    label: 'Temps réponse',
    value: '2.4j',
    trend: 'down',
    trendValue: '-0.3j',
    status: 'success',
  },
  {
    id: 'sla',
    label: 'Conformité SLA',
    value: '94%',
    trend: 'up',
    trendValue: '+2%',
    status: 'success',
  },
];

export function DashboardKPIBar({
  kpis = defaultKPIs,
  onRefresh,
  isRefreshing = false,
}: DashboardKPIBarProps) {
  const { kpiConfig, setKPIConfig, openModal } = useDashboardCommandCenterStore();

  // Protection : s'assurer que kpiConfig existe
  if (!kpiConfig || !kpiConfig.visible) return null;

  // Protection : s'assurer que kpis est un tableau
  const safeKPIs = Array.isArray(kpis) ? kpis : defaultKPIs;

  const handleKPIClick = (kpi: KPIItem) => {
    openModal('kpi-drilldown', { kpi });
  };

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/40 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">
            Indicateurs en temps réel
          </span>
          <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">
            Mise à jour: il y a 2 min
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={typeof onRefresh === 'function' ? onRefresh : undefined}
            disabled={typeof onRefresh !== 'function'}
            className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300 disabled:opacity-50 flex-shrink-0"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300 flex-shrink-0"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-slate-800/30 p-px min-w-0">
          {safeKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} onClick={() => handleKPIClick(kpi)} />
          ))}
        </div>
      )}
    </div>
  );
}

function KPICard({ kpi, onClick }: { kpi: KPIItem; onClick?: () => void }) {
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
    stable: 'text-slate-500',
  };

  return (
    <button
      onClick={onClick}
      className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors cursor-pointer group text-left min-w-0 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 truncate mb-0.5 group-hover:text-slate-400 transition-colors">
            {kpi.label}
          </p>
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
      {kpi.sparkline && (
        <div className="flex items-end gap-0.5 h-4 mt-1.5">
          {kpi.sparkline.map((val, i) => {
            const maxVal = Math.max(...kpi.sparkline!);
            const height = (val / maxVal) * 100;
            
            // Couleur uniquement sur la dernière barre (valeur actuelle)
            const barColor = i === kpi.sparkline!.length - 1
              ? statusColors[kpi.status].replace('text-', 'bg-')
              : 'bg-slate-700/60';
            
            return (
              <div
                key={i}
                className={cn('flex-1 rounded-sm', barColor)}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}
    </button>
  );
}

