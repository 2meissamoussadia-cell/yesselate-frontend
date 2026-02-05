/**
 * FinancialView.tsx
 * Vue financière détaillée pour ERP BTP
 * Affiche des données détaillées selon la sous-catégorie (budget, expenses, forecasts)
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Activity,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  PieChart,
  FileText,
  Calendar,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import {
  useAnalyticsDashboard,
} from '@/lib/api/hooks/useAnalytics';
import { InteractiveChart, ChartGrid, ChartGridItem } from '../charts';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';
import { calculateFinancialPerformance } from '@/lib/data/analytics';
import { formatFCFA } from '@/lib/utils/format-currency';
import { bureaux } from '@/lib/data';

interface FinancialViewProps {
  subCategory: string;
}

export const FinancialView = React.memo(function FinancialView({ subCategory }: FinancialViewProps) {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: dashboardData, isLoading } = useAnalyticsDashboard();

  const financialPerf = useMemo(() => calculateFinancialPerformance(), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  // Données différentes selon la sous-catégorie
  const getFinancialMetrics = () => {
    if (subCategory === 'budget') {
      return [
        {
          id: 'budget-total',
          label: 'Budget Total',
          value: '2,5 Md FCFA',
          change: '+5.2%',
          trend: 'up' as const,
          icon: DollarSign,
          color: 'emerald',
        },
        {
          id: 'budget-consomme',
          label: 'Budget Consommé',
          value: '1,875 Md FCFA',
          change: '+2.1%',
          trend: 'up' as const,
          icon: Activity,
          color: 'amber',
        },
        {
          id: 'budget-restant',
          label: 'Budget Restant',
          value: '625 M FCFA',
          change: '-3.4%',
          trend: 'down' as const,
          icon: TrendingUp,
          color: 'blue',
        },
        {
          id: 'taux-utilisation',
          label: 'Taux d\'Utilisation',
          value: '75%',
          change: '+1.2%',
          trend: 'up' as const,
          icon: BarChart3,
          color: 'purple',
        },
      ];
    }

    if (subCategory === 'expenses') {
      return [
        {
          id: 'depenses-totales',
          label: 'Dépenses Totales',
          value: '1,875 Md FCFA',
          change: '+3.5%',
          trend: 'up' as const,
          icon: Activity,
          color: 'amber',
        },
        {
          id: 'depenses-operationnelles',
          label: 'Opérationnelles',
          value: '950 M FCFA',
          change: '+2.8%',
          trend: 'up' as const,
          icon: BarChart3,
          color: 'blue',
        },
        {
          id: 'depenses-services',
          label: 'Services',
          value: '525 M FCFA',
          change: '+4.1%',
          trend: 'up' as const,
          icon: DollarSign,
          color: 'purple',
        },
        {
          id: 'cout-moyen',
          label: 'Coût Moyen/Demande',
          value: '45 M FCFA',
          change: '-1.2%',
          trend: 'down' as const,
          icon: TrendingUp,
          color: 'emerald',
        },
      ];
    }

    if (subCategory === 'forecasts') {
      return [
        {
          id: 'prevision-mois',
          label: 'Prévision Mois',
          value: '2,1 Md FCFA',
          change: '+1.8%',
          trend: 'up' as const,
          icon: BarChart3,
          color: 'purple',
        },
        {
          id: 'prevision-trimestre',
          label: 'Prévision Trimestre',
          value: '6,3 Md FCFA',
          change: '+2.3%',
          trend: 'up' as const,
          icon: TrendingUp,
          color: 'blue',
        },
        {
          id: 'tresorerie-prevue',
          label: 'Trésorerie Prévue',
          value: '850 M FCFA',
          change: '+5.1%',
          trend: 'up' as const,
          icon: DollarSign,
          color: 'emerald',
        },
        {
          id: 'marge-previsionnelle',
          label: 'Marge Prévue',
          value: '22.5%',
          change: '+0.8%',
          trend: 'up' as const,
          icon: Activity,
          color: 'amber',
        },
      ];
    }

    // Par défaut
    return [
      {
        id: 'budget',
        label: 'Budget Total',
        value: '2,5 Md FCFA',
        change: '+5.2%',
        trend: 'up' as const,
        icon: DollarSign,
        color: 'emerald',
      },
      {
        id: 'spent',
        label: 'Dépensé',
        value: '1,875 Md FCFA',
        change: '+2.1%',
        trend: 'up' as const,
        icon: Activity,
        color: 'amber',
      },
      {
        id: 'remaining',
        label: 'Restant',
        value: '625 M FCFA',
        change: '-3.4%',
        trend: 'down' as const,
        icon: TrendingUp,
        color: 'blue',
      },
      {
        id: 'forecast',
        label: 'Prévision',
        value: '2,1 Md FCFA',
        change: '+1.8%',
        trend: 'up' as const,
        icon: BarChart3,
        color: 'purple',
      },
    ];
  };

  const financialMetrics = getFinancialMetrics();

  const handleMetricClick = (metric: any) => {
    openDetailPanel('kpi', metric.id, {
      name: metric.label,
      value: metric.value,
      trend: metric.trend,
      change: metric.change,
    });
  };

  // Données pour tableaux détaillés selon la sous-catégorie
  const getDetailedTableData = () => {
    if (subCategory === 'budget') {
      return financialPerf.map((bureau) => ({
        bureau: bureau.bureauCode,
        bureauName: bureau.bureauName,
        budgetTotal: bureau.budgetTotal,
        budgetConsumed: bureau.budgetConsumed,
        budgetRemaining: bureau.budgetRemaining,
        utilization: bureau.budgetUtilization,
      }));
    }

    if (subCategory === 'expenses') {
      return financialPerf.map((bureau) => ({
        bureau: bureau.bureauCode,
        bureauName: bureau.bureauName,
        expenses: bureau.expenses,
        revenues: bureau.revenues,
        netResult: bureau.netResult,
        avgCostPerDemand: bureau.avgCostPerDemand,
        marginRate: bureau.marginRate,
      }));
    }

    if (subCategory === 'forecasts') {
      return financialPerf.map((bureau) => ({
        bureau: bureau.bureauCode,
        bureauName: bureau.bureauName,
        treasury: bureau.treasury,
        overduePayments: bureau.overduePayments,
        collectionRate: bureau.collectionRate,
        revenues: bureau.revenues,
      }));
    }

    return [];
  };

  const detailedData = getDetailedTableData();

  // Données pour graphiques
  const getChartData = () => {
    if (subCategory === 'budget') {
      return financialPerf.map((b) => ({
        name: b.bureauCode,
        'Budget Total': b.budgetTotal / 1000000, // En millions
        'Budget Consommé': b.budgetConsumed / 1000000,
        'Budget Restant': b.budgetRemaining / 1000000,
      }));
    }

    if (subCategory === 'expenses') {
      return financialPerf.map((b) => ({
        name: b.bureauCode,
        'Dépenses': b.expenses / 1000000,
        'Revenus': b.revenues / 1000000,
        'Résultat Net': b.netResult / 1000000,
      }));
    }

    if (subCategory === 'forecasts') {
      return financialPerf.map((b) => ({
        name: b.bureauCode,
        'Trésorerie': b.treasury / 1000000,
        'Revenus': b.revenues / 1000000,
        'Retards': b.overduePayments / 1000000,
      }));
    }

    return [];
  };

  const chartData = getChartData();

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';

          return (
            <div
              key={metric.id}
              onClick={() => handleMetricClick(metric)}
              className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'p-2 rounded-lg border',
                    colorClasses[metric.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-200">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Graphique comparatif */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            {subCategory === 'budget' && 'Répartition Budget par Bureau'}
            {subCategory === 'expenses' && 'Dépenses vs Revenus par Bureau'}
            {subCategory === 'forecasts' && 'Prévisions Trésorerie par Bureau'}
          </h3>
          <div className="h-80">
            <InteractiveChart
              title={subCategory === 'budget' 
                ? 'Répartition Budget par Bureau'
                : subCategory === 'expenses'
                ? 'Dépenses vs Revenus par Bureau'
                : 'Prévisions Trésorerie par Bureau'}
              data={chartData as any}
              type="bar"
              dataKeys={subCategory === 'budget' 
                ? ['Budget Total', 'Budget Consommé', 'Budget Restant']
                : subCategory === 'expenses'
                ? ['Dépenses', 'Revenus', 'Résultat Net']
                : ['Trésorerie', 'Revenus', 'Retards']}
              colors={['#10B981', '#F59E0B', '#3B82F6']}
              height={320}
            />
          </div>
        </div>
      )}

      {/* Tableau détaillé */}
      {detailedData.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200">
              {subCategory === 'budget' && 'Détail Budget par Bureau'}
              {subCategory === 'expenses' && 'Détail Dépenses par Bureau'}
              {subCategory === 'forecasts' && 'Détail Prévisions par Bureau'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  {subCategory === 'budget' && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold">Bureau</th>
                      <th className="text-right py-3 px-4 font-semibold">Budget Total</th>
                      <th className="text-right py-3 px-4 font-semibold">Consommé</th>
                      <th className="text-right py-3 px-4 font-semibold">Restant</th>
                      <th className="text-center py-3 px-4 font-semibold">Utilisation</th>
                    </>
                  )}
                  {subCategory === 'expenses' && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold">Bureau</th>
                      <th className="text-right py-3 px-4 font-semibold">Dépenses</th>
                      <th className="text-right py-3 px-4 font-semibold">Revenus</th>
                      <th className="text-right py-3 px-4 font-semibold">Résultat Net</th>
                      <th className="text-center py-3 px-4 font-semibold">Marge %</th>
                      <th className="text-right py-3 px-4 font-semibold">Coût/Demande</th>
                    </>
                  )}
                  {subCategory === 'forecasts' && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold">Bureau</th>
                      <th className="text-right py-3 px-4 font-semibold">Trésorerie</th>
                      <th className="text-right py-3 px-4 font-semibold">Revenus</th>
                      <th className="text-right py-3 px-4 font-semibold">Retards</th>
                      <th className="text-center py-3 px-4 font-semibold">Taux Recouvrement</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {detailedData.map((row: any, idx: number) => {
                  const bureauInfo = bureaux.find(b => b.code === row.bureau);
                  
                  return (
                    <tr
                      key={row.bureau}
                      onClick={() => openDetailPanel('kpi', row.bureau, row)}
                      className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{bureauInfo?.icon}</span>
                          <div>
                            <div className="font-semibold text-slate-200">{row.bureau}</div>
                            <div className="text-xs text-slate-400">{row.bureauName}</div>
                          </div>
                        </div>
                      </td>
                      {subCategory === 'budget' && (
                        <>
                          <td className="py-3 px-4 text-right font-mono text-slate-200">
                            {formatFCFA(row.budgetTotal)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-400">
                            {formatFCFA(row.budgetConsumed)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-blue-400">
                            {formatFCFA(row.budgetRemaining)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={row.utilization >= 90 ? 'urgent' : row.utilization >= 75 ? 'warning' : 'success'}
                              className="text-xs"
                            >
                              {row.utilization}%
                            </Badge>
                          </td>
                        </>
                      )}
                      {subCategory === 'expenses' && (
                        <>
                          <td className="py-3 px-4 text-right font-mono text-amber-400">
                            {formatFCFA(row.expenses)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            {formatFCFA(row.revenues)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            <span className={cn(
                              'font-semibold',
                              row.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
                            )}>
                              {formatFCFA(row.netResult)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={row.marginRate >= 20 ? 'success' : row.marginRate >= 10 ? 'warning' : 'urgent'}
                              className="text-xs"
                            >
                              {row.marginRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 text-xs">
                            {formatFCFA(row.avgCostPerDemand)}
                          </td>
                        </>
                      )}
                      {subCategory === 'forecasts' && (
                        <>
                          <td className="py-3 px-4 text-right font-mono text-blue-400">
                            {formatFCFA(row.treasury)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            {formatFCFA(row.revenues)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-red-400">
                            {formatFCFA(row.overduePayments)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={row.collectionRate >= 85 ? 'success' : row.collectionRate >= 70 ? 'warning' : 'urgent'}
                              className="text-xs"
                            >
                              {row.collectionRate}%
                            </Badge>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

