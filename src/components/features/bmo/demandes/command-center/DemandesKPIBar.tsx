/**
 * KPI Bar pour Demandes
 * 8 indicateurs workflow temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Inbox,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface DemandesKPIData {
  totalDemandes: number;
  newToday: number;
  pendingCount: number;
  urgentCount: number;
  avgResponseTime: number; // heures
  approvalRate: number; // pourcentage
  completionRate: number; // pourcentage
  satisfactionScore: number; // sur 5
  trends?: {
    total: 'up' | 'down' | 'stable';
    pending: 'up' | 'down' | 'stable';
    urgent: 'up' | 'down' | 'stable';
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
}

interface DemandesKPIBarProps {
  data: DemandesKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DemandesKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: DemandesKPIBarProps) {
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Demandes',
        value: data.totalDemandes,
        icon: Inbox,
        status: 'neutral',
        trend: data.trends?.total,
        sparkline: [85, 92, 88, 95, 98, 94, data.totalDemandes],
      },
      {
        id: 'new',
        label: 'Nouvelles (24h)',
        value: data.newToday,
        icon: Zap,
        status: data.newToday > 20 ? 'warning' : 'success',
        sparkline: [5, 8, 6, 9, 7, 10, data.newToday],
      },
      {
        id: 'pending',
        label: 'En attente',
        value: data.pendingCount,
        icon: Clock,
        status: data.pendingCount > 30 ? 'warning' : data.pendingCount > 50 ? 'critical' : 'success',
        trend: data.trends?.pending,
      },
      {
        id: 'urgent',
        label: 'Urgentes',
        value: data.urgentCount,
        icon: AlertTriangle,
        status: data.urgentCount > 10 ? 'critical' : data.urgentCount > 5 ? 'warning' : 'success',
        trend: data.trends?.urgent,
      },
      {
        id: 'response',
        label: 'Temps Réponse Moy.',
        value: data.avgResponseTime,
        icon: TrendingUp,
        status: data.avgResponseTime <= 4 ? 'success' : data.avgResponseTime <= 8 ? 'warning' : 'critical',
        suffix: 'h',
      },
      {
        id: 'approval',
        label: 'Taux Approbation',
        value: data.approvalRate,
        icon: CheckCircle,
        status: data.approvalRate >= 80 ? 'success' : data.approvalRate >= 60 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'completion',
        label: 'Taux Complétion',
        value: data.completionRate,
        icon: Target,
        status: data.completionRate >= 85 ? 'success' : data.completionRate >= 70 ? 'warning' : 'critical',
        suffix: '%',
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
          <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs Workflow</span>
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
