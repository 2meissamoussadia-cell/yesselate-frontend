/**
 * KPI Bar pour le Calendrier
 * 8 indicateurs clés en temps réel avec sparklines
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export interface CalendarKPIData {
  eventsToday: number;
  eventsWeek: number;
  eventsMonth: number;
  conflicts: number;
  overdueDeadlines: number;
  meetingsToday: number;
  completionRate: number; // pourcentage
  avgDuration: number; // en minutes
  trends?: {
    eventsToday: 'up' | 'down' | 'stable';
    eventsWeek: 'up' | 'down' | 'stable';
    conflicts: 'up' | 'down' | 'stable';
    completionRate: 'up' | 'down' | 'stable';
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

// ================================
// PROPS
// ================================

interface CalendarKPIBarProps {
  data: CalendarKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ================================
// COMPONENT
// ================================

export function CalendarKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: CalendarKPIBarProps) {
  // Construire les KPIs
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'today',
        label: 'Aujourd\'hui',
        value: data.eventsToday,
        icon: Calendar,
        status: data.eventsToday > 10 ? 'warning' : 'neutral',
        trend: data.trends?.eventsToday,
        sparkline: [3, 5, 4, 6, 8, 7, data.eventsToday],
      },
      {
        id: 'week',
        label: 'Cette semaine',
        value: data.eventsWeek,
        icon: Calendar,
        status: 'neutral',
        trend: data.trends?.eventsWeek,
        sparkline: [12, 15, 18, 20, 22, 19, data.eventsWeek],
      },
      {
        id: 'month',
        label: 'Ce mois',
        value: data.eventsMonth,
        icon: Calendar,
        status: 'neutral',
      },
      {
        id: 'conflicts',
        label: 'Conflits',
        value: data.conflicts,
        icon: AlertTriangle,
        status: data.conflicts > 5 ? 'critical' : data.conflicts > 0 ? 'warning' : 'success',
        trend: data.trends?.conflicts,
      },
      {
        id: 'overdue',
        label: 'Échéances dépassées',
        value: data.overdueDeadlines,
        icon: Clock,
        status: data.overdueDeadlines > 3 ? 'critical' : data.overdueDeadlines > 0 ? 'warning' : 'success',
      },
      {
        id: 'meetings',
        label: 'Réunions du jour',
        value: data.meetingsToday,
        icon: Users,
        status: 'neutral',
      },
      {
        id: 'completion',
        label: 'Taux de complétion',
        value: data.completionRate,
        icon: CheckCircle,
        status: data.completionRate >= 80 ? 'success' : data.completionRate >= 60 ? 'warning' : 'critical',
        trend: data.trends?.completionRate,
        suffix: '%',
      },
      {
        id: 'duration',
        label: 'Durée moyenne',
        value: data.avgDuration,
        icon: TrendingUp,
        status: 'neutral',
        suffix: 'min',
      },
    ];
  }, [data]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">
            KPIs Temps Réel
          </span>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-400 transition-colors"
          >
            <span>{collapsed ? 'Afficher' : 'Masquer'}</span>
            {collapsed ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* KPIs Grid */}
      {!collapsed && (
        <div className="grid grid-cols-8 gap-px bg-slate-800/30">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const TrendIcon =
              kpi.trend === 'up'
                ? TrendingUp
                : kpi.trend === 'down'
                ? TrendingDown
                : Minus;

            return (
              <div
                key={kpi.id}
                className="bg-slate-900/60 px-3 py-2.5 hover:bg-slate-800/60 transition-colors"
              >
                {/* Icon + Label */}
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
                  <span className="text-xs text-slate-400 truncate">
                    {kpi.label}
                  </span>
                </div>

                {/* Value */}
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
                  {kpi.suffix && (
                    <span className="text-xs text-slate-400">{kpi.suffix}</span>
                  )}
                </div>

                {/* Trend or Sparkline */}
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
                    <span
                      className={cn(
                        'text-xs',
                        kpi.trend === 'up' && 'text-emerald-400',
                        kpi.trend === 'down' && 'text-rose-400',
                        kpi.trend === 'stable' && 'text-slate-400'
                      )}
                    >
                      {kpi.trend === 'up'
                        ? '↑'
                        : kpi.trend === 'down'
                        ? '↓'
                        : '→'}
                    </span>
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

