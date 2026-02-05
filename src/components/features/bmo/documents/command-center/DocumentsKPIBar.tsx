/**
 * KPI Bar pour Documents
 * 8 indicateurs documentaires temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  HardDrive,
  Download,
  Share2,
  Eye,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface DocumentsKPIData {
  totalDocuments: number;
  newThisMonth: number;
  storageUsed: number; // Go
  storageLimit: number; // Go
  avgAccessTime: number; // secondes
  totalDownloads: number;
  sharedDocuments: number;
  pendingApproval: number;
  trends?: {
    total: 'up' | 'down' | 'stable';
    downloads: 'up' | 'down' | 'stable';
    shared: 'up' | 'down' | 'stable';
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

interface DocumentsKPIBarProps {
  data: DocumentsKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DocumentsKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: DocumentsKPIBarProps) {
  const storagePercent = (data.storageUsed / data.storageLimit) * 100;

  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Documents',
        value: data.totalDocuments,
        icon: FileText,
        status: 'neutral',
        trend: data.trends?.total,
        sparkline: [3200, 3450, 3300, 3680, 3800, 3650, data.totalDocuments],
      },
      {
        id: 'new',
        label: 'Nouveaux (mois)',
        value: data.newThisMonth,
        icon: TrendingUp,
        status: 'success',
        sparkline: [120, 145, 132, 158, 165, 152, data.newThisMonth],
      },
      {
        id: 'storage',
        label: 'Stockage',
        value: `${data.storageUsed}/${data.storageLimit}`,
        icon: HardDrive,
        status: storagePercent >= 90 ? 'critical' : storagePercent >= 75 ? 'warning' : 'success',
        suffix: 'Go',
      },
      {
        id: 'access',
        label: 'Temps Accès Moy.',
        value: data.avgAccessTime.toFixed(1),
        icon: Clock,
        status: data.avgAccessTime <= 2 ? 'success' : data.avgAccessTime <= 5 ? 'warning' : 'critical',
        suffix: 's',
      },
      {
        id: 'downloads',
        label: 'Téléchargements',
        value: data.totalDownloads,
        icon: Download,
        status: 'neutral',
        trend: data.trends?.downloads,
      },
      {
        id: 'shared',
        label: 'Partagés',
        value: data.sharedDocuments,
        icon: Share2,
        status: 'neutral',
        trend: data.trends?.shared,
      },
      {
        id: 'views',
        label: 'Consultations',
        value: Math.floor(data.totalDownloads * 2.5),
        icon: Eye,
        status: 'neutral',
      },
      {
        id: 'pending',
        label: 'En attente',
        value: data.pendingApproval,
        icon: Clock,
        status: data.pendingApproval > 20 ? 'warning' : 'success',
      },
    ];
  }, [data, storagePercent]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs Documents</span>
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

