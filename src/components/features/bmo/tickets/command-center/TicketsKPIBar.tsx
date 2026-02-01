/**
 * KPI Bar pour Tickets Clients
 * 8 indicateurs support temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Zap,
  Target,
  ThumbsUp,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface TicketsKPIData {
  totalTickets: number;
  newToday: number;
  avgFirstResponseTime: number; // minutes
  avgResolutionTime: number; // heures
  firstContactResolution: number; // pourcentage
  satisfactionScore: number; // sur 5
  ticketsInSLA: number; // pourcentage
  reopenRate: number; // pourcentage
  trends?: {
    total: 'up' | 'down' | 'stable';
    firstResponse: 'up' | 'down' | 'stable';
    resolution: 'up' | 'down' | 'stable';
    satisfaction: 'up' | 'down' | 'stable';
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

interface TicketsKPIBarProps {
  data: TicketsKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function TicketsKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: TicketsKPIBarProps) {
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Tickets',
        value: data.totalTickets,
        icon: MessageSquare,
        status: 'neutral',
        trend: data.trends?.total,
        sparkline: [125, 138, 132, 145, 148, 142, data.totalTickets],
      },
      {
        id: 'new',
        label: 'Nouveaux (24h)',
        value: data.newToday,
        icon: Zap,
        status: data.newToday > 30 ? 'warning' : 'success',
        sparkline: [8, 12, 10, 15, 11, 13, data.newToday],
      },
      {
        id: 'first-response',
        label: '1ère Réponse Moy.',
        value: data.avgFirstResponseTime,
        icon: Clock,
        status: data.avgFirstResponseTime <= 15 ? 'success' : data.avgFirstResponseTime <= 30 ? 'warning' : 'critical',
        trend: data.trends?.firstResponse,
        suffix: 'min',
      },
      {
        id: 'resolution',
        label: 'Résolution Moy.',
        value: data.avgResolutionTime.toFixed(1),
        icon: Target,
        status: data.avgResolutionTime <= 8 ? 'success' : data.avgResolutionTime <= 24 ? 'warning' : 'critical',
        trend: data.trends?.resolution,
        suffix: 'h',
      },
      {
        id: 'fcr',
        label: '1er Contact Résolu',
        value: data.firstContactResolution,
        icon: Target,
        status: data.firstContactResolution >= 70 ? 'success' : data.firstContactResolution >= 50 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'satisfaction',
        label: 'Satisfaction',
        value: data.satisfactionScore.toFixed(1),
        icon: ThumbsUp,
        status: data.satisfactionScore >= 4.5 ? 'success' : data.satisfactionScore >= 3.5 ? 'warning' : 'critical',
        trend: data.trends?.satisfaction,
        suffix: '/5',
      },
      {
        id: 'sla',
        label: 'Tickets dans SLA',
        value: data.ticketsInSLA,
        icon: TrendingUp,
        status: data.ticketsInSLA >= 95 ? 'success' : data.ticketsInSLA >= 85 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'reopen',
        label: 'Taux Réouverture',
        value: data.reopenRate.toFixed(1),
        icon: RotateCcw,
        status: data.reopenRate <= 5 ? 'success' : data.reopenRate <= 10 ? 'warning' : 'critical',
        suffix: '%',
      },
    ];
  }, [data]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs Support</span>
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

