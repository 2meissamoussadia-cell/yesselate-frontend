/**
 * KPI Bar pour Ressources (RH)
 * 8 indicateurs RH temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  UserCheck,
  UserMinus,
  DollarSign,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface RessourcesKPIData {
  totalEmployees: number;
  activeEmployees: number;
  turnoverRate: number; // pourcentage
  attendanceRate: number; // pourcentage
  avgSatisfaction: number; // sur 5
  avgPerformance: number; // sur 100
  hrCostPerEmployee: number; // montant
  avgRecruitmentTime: number; // jours
  trends?: {
    total: 'up' | 'down' | 'stable';
    turnover: 'up' | 'down' | 'stable';
    attendance: 'up' | 'down' | 'stable';
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

interface RessourcesKPIBarProps {
  data: RessourcesKPIData;
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

export function RessourcesKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: RessourcesKPIBarProps) {
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Employés',
        value: data.totalEmployees,
        icon: Users,
        status: 'neutral',
        trend: data.trends?.total,
        sparkline: [185, 192, 188, 195, 198, 194, data.totalEmployees],
      },
      {
        id: 'active',
        label: 'Actifs',
        value: data.activeEmployees,
        icon: UserCheck,
        status: 'success',
        sparkline: [175, 180, 178, 185, 188, 184, data.activeEmployees],
      },
      {
        id: 'turnover',
        label: 'Taux Turnover',
        value: data.turnoverRate.toFixed(1),
        icon: UserMinus,
        status: data.turnoverRate <= 10 ? 'success' : data.turnoverRate <= 15 ? 'warning' : 'critical',
        trend: data.trends?.turnover,
        suffix: '%',
      },
      {
        id: 'attendance',
        label: 'Taux Présence',
        value: data.attendanceRate,
        icon: UserCheck,
        status: data.attendanceRate >= 95 ? 'success' : data.attendanceRate >= 90 ? 'warning' : 'critical',
        trend: data.trends?.attendance,
        suffix: '%',
      },
      {
        id: 'satisfaction',
        label: 'Satisfaction Moy.',
        value: data.avgSatisfaction.toFixed(1),
        icon: TrendingUp,
        status: data.avgSatisfaction >= 4.5 ? 'success' : data.avgSatisfaction >= 3.5 ? 'warning' : 'critical',
        trend: data.trends?.satisfaction,
        suffix: '/5',
      },
      {
        id: 'performance',
        label: 'Performance Moy.',
        value: data.avgPerformance,
        icon: Award,
        status: data.avgPerformance >= 85 ? 'success' : data.avgPerformance >= 70 ? 'warning' : 'critical',
        suffix: '/100',
      },
      {
        id: 'cost',
        label: 'Coût RH/Employé',
        value: formatCurrency(data.hrCostPerEmployee),
        icon: DollarSign,
        status: 'neutral',
        suffix: 'XOF',
      },
      {
        id: 'recruitment',
        label: 'Temps Recrutement',
        value: data.avgRecruitmentTime,
        icon: Clock,
        status: data.avgRecruitmentTime <= 30 ? 'success' : data.avgRecruitmentTime <= 60 ? 'warning' : 'critical',
        suffix: 'j',
      },
    ];
  }, [data]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs RH</span>
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

