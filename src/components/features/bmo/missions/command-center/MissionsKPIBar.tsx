/**
 * KPI Bar pour Missions Terrain
 * 8 indicateurs terrain temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface MissionsKPIData {
  totalMissions: number;
  activeMissions: number;
  teamsOnField: number;
  avgDuration: number; // jours
  completionRate: number; // pourcentage
  onTimeDelivery: number; // pourcentage
  avgCost: number; // montant
  satisfactionScore: number; // sur 5
  trends?: {
    total: 'up' | 'down' | 'stable';
    active: 'up' | 'down' | 'stable';
    completion: 'up' | 'down' | 'stable';
    satisfaction: 'up' | 'down' | 'stable';
  };
}

interface KPI {
  id: string;
  label: string;
  value: string | number;
  icon: React.ElementType;
  status: 'success' | 'warning' | 'critical' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
  suffix?: string;
  prefix?: string;
}

interface MissionsKPIBarProps {
  data: MissionsKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
}

export function MissionsKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: MissionsKPIBarProps) {
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Missions',
        value: data.totalMissions,
        icon: Compass,
        status: 'neutral',
        trend: data.trends?.total,
        sparkline: [45, 52, 48, 55, 58, 54, data.totalMissions],
      },
      {
        id: 'active',
        label: 'Actives',
        value: data.activeMissions,
        icon: Target,
        status: data.activeMissions > 20 ? 'warning' : 'success',
        trend: data.trends?.active,
        sparkline: [12, 15, 13, 18, 16, 14, data.activeMissions],
      },
      {
        id: 'teams',
        label: 'Équipes Terrain',
        value: data.teamsOnField,
        icon: Users,
        status: data.teamsOnField > 0 ? 'success' : 'neutral',
      },
      {
        id: 'duration',
        label: 'Durée Moyenne',
        value: data.avgDuration.toFixed(1),
        icon: Clock,
        status: data.avgDuration <= 3 ? 'success' : data.avgDuration <= 7 ? 'warning' : 'critical',
        suffix: 'j',
      },
      {
        id: 'completion',
        label: 'Taux Complétion',
        value: data.completionRate,
        icon: CheckCircle,
        status: data.completionRate >= 90 ? 'success' : data.completionRate >= 75 ? 'warning' : 'critical',
        trend: data.trends?.completion,
        suffix: '%',
      },
      {
        id: 'on-time',
        label: 'Livraison à Temps',
        value: data.onTimeDelivery,
        icon: TrendingUp,
        status: data.onTimeDelivery >= 85 ? 'success' : data.onTimeDelivery >= 70 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'cost',
        label: 'Coût Moyen',
        value: formatCurrency(data.avgCost),
        icon: DollarSign,
        status: 'neutral',
        suffix: 'XOF',
      },
      {
        id: 'satisfaction',
        label: 'Satisfaction',
        value: data.satisfactionScore.toFixed(1),
        icon: TrendingUp,
        status: data.satisfactionScore >= 4.5 ? 'success' : data.satisfactionScore >= 3.5 ? 'warning' : 'critical',
        trend: data.trends?.satisfaction,
        suffix: '/5',
      },
    ];
  }, [data]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs Terrain</span>
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
                  {kpi.prefix && <span className="text-xs text-slate-400">{kpi.prefix}</span>}
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

