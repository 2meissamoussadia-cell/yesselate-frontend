/**
 * Barre de KPIs en temps réel
 * Indicateurs clés pour surveillance opérationnelle
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
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import type { KPIItem } from './types';

// Données de démonstration - en production, ces données viendraient d'une API
const mockKPIs: KPIItem[] = [
  {
    id: 'projects-active',
    label: 'Projets actifs',
    value: 24,
    trend: 'up',
    trendValue: '+2',
    status: 'neutral',
  },
  {
    id: 'budget-consumed',
    label: 'Budget consommé',
    value: '67%',
    trend: 'stable',
    status: 'success',
    sparkline: [45, 52, 58, 61, 63, 65, 67],
  },
  {
    id: 'milestones-late',
    label: 'Jalons en retard',
    value: 5,
    trend: 'down',
    trendValue: '-2',
    status: 'warning',
  },
  {
    id: 'risks-critical',
    label: 'Risques critiques',
    value: 3,
    trend: 'up',
    trendValue: '+1',
    status: 'critical',
  },
  {
    id: 'validations-pending',
    label: 'Validations en attente',
    value: 12,
    trend: 'stable',
    status: 'warning',
  },
  {
    id: 'resources-utilization',
    label: 'Taux utilisation',
    value: '84%',
    trend: 'up',
    trendValue: '+3%',
    status: 'success',
    sparkline: [72, 75, 78, 80, 82, 83, 84],
  },
  {
    id: 'alerts-unread',
    label: 'Alertes non lues',
    value: 8,
    trend: 'down',
    trendValue: '-5',
    status: 'neutral',
  },
  {
    id: 'sla-compliance',
    label: 'Conformité SLA',
    value: '96%',
    trend: 'stable',
    status: 'success',
  },
];

export function KPIBar() {
  const { kpiConfig, setKPIConfig } = useGovernanceCommandCenterStore();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!kpiConfig.visible) return null;

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Indicateurs en temps réel
          </span>
          <span className="text-xs text-slate-600">
            Mise à jour: il y a 2 min
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
          {mockKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPIItem }) {
  const TrendIcon = kpi.trend === 'up' 
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

