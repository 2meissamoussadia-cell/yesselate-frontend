/**
 * KPI Bar pour Equipements
 * 8 indicateurs équipements temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Wrench,
  DollarSign,
  AlertTriangle,
  Percent,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface EquipementsKPIData {
  totalEquipment: number;
  availableCount: number;
  utilizationRate: number; // pourcentage
  maintenanceCost: number; // montant
  outOfServiceCount: number;
  avgAge: number; // années
  maintenanceCompliance: number; // pourcentage
  depreciationRate: number; // pourcentage
  trends?: {
    total: 'up' | 'down' | 'stable';
    utilization: 'up' | 'down' | 'stable';
    maintenance: 'up' | 'down' | 'stable';
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

interface EquipementsKPIBarProps {
  data: EquipementsKPIData;
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

export function EquipementsKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
}: EquipementsKPIBarProps) {
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'total',
        label: 'Total Équipements',
        value: data.totalEquipment,
        icon: Package,
        status: 'neutral',
        trend: data.trends?.total,
        sparkline: [420, 445, 432, 458, 465, 452, data.totalEquipment],
      },
      {
        id: 'available',
        label: 'Disponibles',
        value: data.availableCount,
        icon: CheckCircle,
        status: 'success',
        sparkline: [280, 295, 288, 302, 310, 298, data.availableCount],
      },
      {
        id: 'utilization',
        label: 'Taux Utilisation',
        value: data.utilizationRate,
        icon: Percent,
        status: data.utilizationRate >= 70 ? 'success' : data.utilizationRate >= 50 ? 'warning' : 'critical',
        trend: data.trends?.utilization,
        suffix: '%',
      },
      {
        id: 'maintenance',
        label: 'Coût Maintenance',
        value: formatCurrency(data.maintenanceCost),
        icon: DollarSign,
        status: 'neutral',
        trend: data.trends?.maintenance,
        suffix: 'XOF',
      },
      {
        id: 'out-of-service',
        label: 'Hors Service',
        value: data.outOfServiceCount,
        icon: AlertTriangle,
        status: data.outOfServiceCount === 0 ? 'success' : data.outOfServiceCount <= 5 ? 'warning' : 'critical',
      },
      {
        id: 'age',
        label: 'Âge Moyen',
        value: data.avgAge.toFixed(1),
        icon: Wrench,
        status: data.avgAge <= 3 ? 'success' : data.avgAge <= 5 ? 'warning' : 'critical',
        suffix: 'ans',
      },
      {
        id: 'compliance',
        label: 'Conformité Maintenance',
        value: data.maintenanceCompliance,
        icon: CheckCircle,
        status: data.maintenanceCompliance >= 95 ? 'success' : data.maintenanceCompliance >= 85 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'depreciation',
        label: 'Taux Dépréciation',
        value: data.depreciationRate.toFixed(1),
        icon: TrendingDown,
        status: 'neutral',
        suffix: '%',
      },
    ];
  }, [data]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs Équipements</span>
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
