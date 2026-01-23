/**
 * Barre de KPIs en temps réel pour Messages Externes
 * Indicateurs clés - inspiré de la page Analytics
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
  Mail,
  AlertCircle,
  CheckCircle2,
  Archive,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExternalMessage } from '@/lib/types/bmo.types';

interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  icon?: React.ReactNode;
}

interface MessagesExternesKPIBarProps {
  messages: ExternalMessage[];
  visible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
}

export const MessagesExternesKPIBar = React.memo(function MessagesExternesKPIBar({
  messages,
  visible = true,
  collapsed = false,
  onToggleCollapse,
  onRefresh,
}: MessagesExternesKPIBarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calcul des KPIs à partir des messages
  const kpis = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter(m => m.status === 'unread').length;
    const requiresResponse = messages.filter(m => m.requiresResponse && m.status !== 'replied').length;
    const replied = messages.filter(m => m.status === 'replied').length;
    const archived = messages.filter(m => m.status === 'archived').length;
    const urgent = messages.filter(m => m.priority === 'urgent' && m.status !== 'replied').length;
    const high = messages.filter(m => m.priority === 'high' && m.status !== 'replied').length;
    
    // Taux de réponse (ratio répondu / total nécessitant réponse)
    const totalRequiringResponse = messages.filter(m => m.requiresResponse).length;
    const responseRate = totalRequiringResponse > 0 
      ? Math.round((replied / totalRequiringResponse) * 100)
      : 100;

    return [
      {
        id: 'total',
        label: 'Total Messages',
        value: total,
        trend: 'stable' as const,
        status: 'neutral' as const,
        icon: <Mail className="h-4 w-4" />,
      },
      {
        id: 'unread',
        label: 'Non lus',
        value: unread,
        trend: unread > 0 ? 'down' as const : 'stable' as const,
        status: unread > 0 ? 'critical' as const : 'success' as const,
        icon: <AlertCircle className="h-4 w-4" />,
      },
      {
        id: 'requires_response',
        label: 'À répondre',
        value: requiresResponse,
        trend: requiresResponse > 0 ? 'down' as const : 'stable' as const,
        status: requiresResponse > 0 ? 'warning' as const : 'success' as const,
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        id: 'replied',
        label: 'Répondus',
        value: replied,
        trend: 'up' as const,
        status: 'success' as const,
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      {
        id: 'archived',
        label: 'Archivés',
        value: archived,
        trend: 'stable' as const,
        status: 'neutral' as const,
        icon: <Archive className="h-4 w-4" />,
      },
      {
        id: 'urgent',
        label: 'Urgents',
        value: urgent,
        trend: urgent > 0 ? 'down' as const : 'stable' as const,
        status: urgent > 0 ? 'critical' as const : 'success' as const,
        icon: <AlertCircle className="h-4 w-4" />,
      },
      {
        id: 'high_priority',
        label: 'Priorité haute',
        value: high,
        trend: 'stable' as const,
        status: high > 0 ? 'warning' as const : 'success' as const,
        icon: <AlertCircle className="h-4 w-4" />,
      },
      {
        id: 'response_rate',
        label: 'Taux de réponse',
        value: `${responseRate}%`,
        trend: responseRate >= 80 ? 'up' as const : responseRate >= 50 ? 'stable' as const : 'down' as const,
        status: responseRate >= 80 ? 'success' as const : responseRate >= 50 ? 'warning' as const : 'critical' as const,
      },
    ] as KPIItem[];
  }, [messages]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
    setLastUpdate(new Date());
  };

  const formatLastUpdate = useMemo(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
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
            className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
          >
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      {!collapsed && (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-px bg-slate-800/30 p-px">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
});

const KPICard = React.memo(function KPICard({ kpi }: { kpi: KPIItem }) {
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
    <div className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 truncate mb-0.5 group-hover:text-slate-400 transition-colors flex items-center gap-1">
            {kpi.icon}
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








