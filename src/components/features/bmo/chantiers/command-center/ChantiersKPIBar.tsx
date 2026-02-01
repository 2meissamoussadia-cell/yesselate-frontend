/**
 * KPI Bar pour Chantiers
 * 8 indicateurs construction temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Construction,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  DollarSign,
  Shield,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ChantiersKPIData {
  totalChantiers: number;
  activeChantiers: number;
  avgProgress: number; // pourcentage
  budgetUsed: number; // pourcentage
  delayedCount: number;
  safetyScore: number; // sur 100
  qualityScore: number; // sur 100
  complianceRate: number; // pourcentage
  trends?: {
    total: 'up' | 'down' | 'stable';
    active: 'up' | 'down' | 'stable';
    progress: 'up' | 'down' | 'stable';
    safety: 'up' | 'down' | 'stable';
  };
}

interface KPI {
  id: string;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  status: 'success' | 'warning' | 'critical' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
  suffix?: string;
}

interface ChantiersKPIBarProps {
  data: ChantiersKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChantiersKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: ChantiersKPIBarProps) {
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Chantiers',
        value: data.totalChantiers,
        icon: Construction,
        status: 'neutral',
        trend: data.trends?.total,
        sparkline: [32, 38, 35, 42, 45, 40, data.totalChantiers],
      },
      {
        id: 'active',
        label: 'Actifs',
        value: data.activeChantiers,
        icon: Target,
        status: data.activeChantiers > 15 ? 'warning' : 'success',
        trend: data.trends?.active,
        sparkline: [18, 22, 20, 25, 23, 21, data.activeChantiers],
      },
      {
        id: 'progress',
        label: 'Avancement Moyen',
        value: data.avgProgress,
        icon: TrendingUp,
        status: data.avgProgress >= 75 ? 'success' : data.avgProgress >= 50 ? 'warning' : 'critical',
        trend: data.trends?.progress,
        suffix: '%',
      },
      {
        id: 'budget',
        label: 'Budget Utilisé',
        value: data.budgetUsed,
        icon: DollarSign,
        status: data.budgetUsed <= 90 ? 'success' : data.budgetUsed <= 100 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'delayed',
        label: 'En retard',
        value: data.delayedCount,
        icon: AlertTriangle,
        status: data.delayedCount === 0 ? 'success' : data.delayedCount <= 3 ? 'warning' : 'critical',
      },
      {
        id: 'safety',
        label: 'Score Sécurité',
        value: data.safetyScore,
        icon: Shield,
        status: data.safetyScore >= 90 ? 'success' : data.safetyScore >= 75 ? 'warning' : 'critical',
        trend: data.trends?.safety,
        suffix: '/100',
      },
      {
        id: 'quality',
        label: 'Score Qualité',
        value: data.qualityScore,
        icon: Award,
        status: data.qualityScore >= 85 ? 'success' : data.qualityScore >= 70 ? 'warning' : 'critical',
        suffix: '/100',
      },
      {
        id: 'compliance',
        label: 'Taux Conformité',
        value: data.complianceRate,
        icon: Award,
        status: data.complianceRate >= 95 ? 'success' : data.complianceRate >= 85 ? 'warning' : 'critical',
        suffix: '%',
      },
    ];
  }, [data]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs Chantiers</span>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-400 transition-colors"
          >
            <span>{collapsed ? 'Afficher' : 'Masquer'}</span>
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="grid grid-cols-8 gap-px bg-slate-800/30">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;

            return (
              <div
                key={kpi.id}
                className="bg-slate-900/60 px-3 py-2.5 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5',
                      kpi.status === 'success' && 'text-emerald-400',
                      kpi.status === 'warning' && 'text-amber-400',
                      kpi.status === 'critical' && 'text-rose-400',
                      kpi.status === 'neutral' && 'text-slate-400'
                    )}
                  />
                  <span className="text-xs text-slate-400 truncate">{kpi.label}</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      'text-lg font-semibold',
                      kpi.status === 'success' && 'text-emerald-400',
                      kpi.status === 'warning' && 'text-amber-400',
                      kpi.status === 'critical' && 'text-rose-400',
                      kpi.status === 'neutral' && 'text-slate-200'
                    )}
                  >
                    {kpi.value}
                  </span>
                  {kpi.suffix && <span className="text-xs text-slate-400">{kpi.suffix}</span>}
                </div>

                {kpi.sparkline ? (
                  <div className="flex items-end gap-px h-6 mt-1">
                    {kpi.sparkline.map((value, index) => {
                      const maxValue = Math.max(...kpi.sparkline!);
                      const height = (value / maxValue) * 100;
                      return (
                        <div
                          key={index}
                          className={cn(
                            'flex-1 rounded-t',
                            kpi.status === 'success' && 'bg-emerald-400/30',
                            kpi.status === 'warning' && 'bg-amber-400/30',
                            kpi.status === 'critical' && 'bg-rose-400/30',
                            kpi.status === 'neutral' && 'bg-slate-600/30'
                          )}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                ) : kpi.trend ? (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendIcon
                      className={cn(
                        'h-3 w-3',
                        kpi.trend === 'up' && 'text-emerald-400',
                        kpi.trend === 'down' && 'text-rose-400',
                        kpi.trend === 'stable' && 'text-slate-400'
                      )}
                    />
                  </div>
                ) : (
                  <div className="h-6" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

