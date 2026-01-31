/**
 * KPI Bar pour Finances
 * 8 indicateurs financiers temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface FinancesKPIData {
  totalRevenue: number; // montant total
  totalExpenses: number;
  netProfit: number;
  pendingAmount: number;
  overdueAmount: number;
  cashBalance: number;
  budgetUtilization: number; // pourcentage
  profitMargin: number; // pourcentage
  trends?: {
    revenue: 'up' | 'down' | 'stable';
    expenses: 'up' | 'down' | 'stable';
    profit: 'up' | 'down' | 'stable';
    cashBalance: 'up' | 'down' | 'stable';
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
  prefix?: string;
  suffix?: string;
}

interface FinancesKPIBarProps {
  data: FinancesKPIData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  currency?: string;
}

function formatCurrency(amount: number, currency: string = 'XOF'): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
}

export function FinancesKPIBar({
  data,
  collapsed = false,
  onToggleCollapse,
  currency = 'XOF',
}: FinancesKPIBarProps) {
  const kpis = useMemo<KPI[]>(() => {
    return [
      {
        id: 'revenue',
        label: 'Revenus',
        value: formatCurrency(data.totalRevenue, currency),
        icon: TrendingUp,
        status: data.totalRevenue > 0 ? 'success' : 'neutral',
        trend: data.trends?.revenue,
        sparkline: [45000, 52000, 48000, 55000, 58000, 54000, data.totalRevenue],
        suffix: currency,
      },
      {
        id: 'expenses',
        label: 'Dépenses',
        value: formatCurrency(data.totalExpenses, currency),
        icon: TrendingDown,
        status: 'neutral',
        trend: data.trends?.expenses,
        sparkline: [35000, 38000, 36000, 41000, 39000, 37000, data.totalExpenses],
        suffix: currency,
      },
      {
        id: 'profit',
        label: 'Bénéfice Net',
        value: formatCurrency(data.netProfit, currency),
        icon: DollarSign,
        status: data.netProfit > 0 ? 'success' : data.netProfit < 0 ? 'critical' : 'neutral',
        trend: data.trends?.profit,
        suffix: currency,
      },
      {
        id: 'pending',
        label: 'En attente',
        value: formatCurrency(data.pendingAmount, currency),
        icon: AlertTriangle,
        status: data.pendingAmount > 100000 ? 'warning' : 'neutral',
        suffix: currency,
      },
      {
        id: 'overdue',
        label: 'Impayés',
        value: formatCurrency(data.overdueAmount, currency),
        icon: AlertTriangle,
        status: data.overdueAmount > 50000 ? 'critical' : data.overdueAmount > 0 ? 'warning' : 'success',
        suffix: currency,
      },
      {
        id: 'cash',
        label: 'Trésorerie',
        value: formatCurrency(data.cashBalance, currency),
        icon: Wallet,
        status: data.cashBalance > 200000 ? 'success' : data.cashBalance > 50000 ? 'warning' : 'critical',
        trend: data.trends?.cashBalance,
        suffix: currency,
      },
      {
        id: 'budget',
        label: 'Utilisation Budget',
        value: data.budgetUtilization,
        icon: Target,
        status: data.budgetUtilization <= 90 ? 'success' : data.budgetUtilization <= 100 ? 'warning' : 'critical',
        suffix: '%',
      },
      {
        id: 'margin',
        label: 'Marge Bénéficiaire',
        value: data.profitMargin,
        icon: BarChart3,
        status: data.profitMargin >= 20 ? 'success' : data.profitMargin >= 10 ? 'warning' : 'critical',
        suffix: '%',
      },
    ];
  }, [data, currency]);

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">KPIs Financiers</span>
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

