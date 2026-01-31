/**
 * KPI Bar pour Projets en Cours
 * 8 indicateurs clés en temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export interface ProjetsKPIData {
  totalProjects: number;
  activeProjects: number;
  completedThisMonth: number;
  delayedProjects: number;
  budgetHealth: number; // pourcentage
  teamUtilization: number; // pourcentage
  avgCompletionRate: number; // pourcentage
  onTimeDelivery: number; // pourcentage
  trends?: {
    totalProjects: 'up' | 'down' | 'stable';
    activeProjects: 'up' | 'down' | 'stable';
    delayedProjects: 'up' | 'down' | 'stable';
    budgetHealth: 'up' | 'down' | 'stable';
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

interface ProjetsKPIBarProps {
  data: ProjetsKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ================================
// COMPONENT
// ================================

export function ProjetsKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: ProjetsKPIBarProps) {
  // Construire les KPIs
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Projets',
        value: data.totalProjects,
        icon: Briefcase,
        status: 'neutral',
        trend: data.trends?.totalProjects,
        sparkline: [45, 52, 48, 55, 58, 54, data.totalProjects],
      },
      {
        id: 'active',
        label: 'Actifs',
        value: data.activeProjects,
        icon: Target,
        status: data.activeProjects > 20 ? 'warning' : 'success',
        trend: data.trends?.activeProjects,
        sparkline: [12, 15, 18, 16, 19, 17, data.activeProjects],
      },
      {
        id: 'completed',
        label: 'Terminés ce mois',
        value: data.completedThisMonth,
        icon: CheckCircle,
        status: data.completedThisMonth >= 5 ? 'success' : 'warning',
      },
      {
        id: 'delayed',
        label: 'En retard',
        value: data.delayedProjects,
        icon: AlertTriangle,
        status: data.delayedProjects > 5 ? 'critical' : data.delayedProjects > 0 ? 'warning' : 'success',
        trend: data.trends?.delayedProjects,
      },
      {
        id: 'budget',
        label: 'Santé Budget',
        value: data.budgetHealth,
        icon: DollarSign,
        status: data.budgetHealth >= 80 ? 'success' : data.budgetHealth >= 60 ? 'warning' : 'critical',
        trend: data.trends?.budgetHealth,
        suffix: '%',
      },
      {
        id: 'team',
        label: 'Utilisation Équipes',
        value: data.teamUtilization,
        icon: Users,
        status: data.teamUtilization >= 70 && data.teamUtilization <= 90 ? 'success' : 'warning',
        suffix: '%',
      },
      {
        id: 'completion',
        label: 'Taux Complétion',
        value: data.avgCompletionRate,
        icon: TrendingUp,
        status: data.avgCompletionRate >= 75 ? 'success' : data.avgCompletionRate >= 50 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'delivery',
        label: 'Livraison à Temps',
        value: data.onTimeDelivery,
        icon: Clock,
        status: data.onTimeDelivery >= 85 ? 'success' : data.onTimeDelivery >= 70 ? 'warning' : 'critical',
        suffix: '%',
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

