/**
 * ContentRouter pour Analytics
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  PieChart,
  Target,
  LineChart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FluentCard, FluentCardContent } from '@/components/ui/fluent-card';
import {
  useAnalyticsDashboard,
  useKpis,
  useAlerts,
  useTrends,
  useBureauxPerformance,
} from '@/lib/api/hooks/useAnalytics';
import { InteractiveChart, ChartGrid, ChartGridItem } from '../charts';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';
import { FinancialView } from './FinancialView';
import { formatFCFA } from '@/lib/utils/format-currency';
import { calculateFinancialPerformance } from '@/lib/data/analytics';
import { bureaux as bureauxList } from '@/lib/data';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const AnalyticsContentRouter = React.memo(function AnalyticsContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Dashboard par défaut pour la vue overview
  if (category === 'overview') {
    return <OverviewDashboard />;
  }

  // Performance view
  if (category === 'performance') {
    return <PerformanceView subCategory={subCategory} />;
  }

  // Alerts view
  if (category === 'alerts') {
    return <AlertsView subCategory={subCategory} />;
  }

  // Financial view
  if (category === 'financial') {
    return <FinancialView subCategory={subCategory} />;
  }

  // Trends view
  if (category === 'trends') {
    return <TrendsView subCategory={subCategory} />;
  }

  // Reports view
  if (category === 'reports') {
    return <ReportsView subCategory={subCategory} />;
  }

  // KPIs view
  if (category === 'kpis') {
    return <KPIsView subCategory={subCategory} />;
  }

  // Comparison view
  if (category === 'comparison') {
    return <ComparisonView subCategory={subCategory} />;
  }

  // Bureaux view
  if (category === 'bureaux') {
    return <BureauxView subCategory={subCategory} />;
  }

  // Autres vues (placeholder)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overview Dashboard
// ================================
const OverviewDashboard = React.memo(function OverviewDashboard() {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: dashboardData, isLoading, error } = useAnalyticsDashboard();
  const { data: kpisData } = useKpis();
  const { data: alertsData } = useAlerts({ status: ['critical', 'warning'] });
  const { data: trendsData } = useTrends();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">Erreur de chargement</p>
          <p className="text-sm text-slate-400">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }

  const kpis = kpisData?.kpis || [];
  const alerts = alertsData?.alerts || [];
  const trends = trendsData?.trends || [];

  const metrics = [
    {
      id: 'kpis-total',
      label: 'KPIs Actifs',
      value: kpis.length.toString(),
      change: '+2',
      trend: 'up' as const,
      icon: Target,
      color: 'blue',
    },
    {
      id: 'performance',
      label: 'Performance Globale',
      value: dashboardData?.stats?.avgPerformance ? `${dashboardData.stats.avgPerformance}%` : '87%',
      change: '+3%',
      trend: 'up' as const,
      icon: Activity,
      color: 'emerald',
    },
    {
      id: 'alerts',
      label: 'Alertes Actives',
      value: alerts.length.toString(),
      change: alerts.length > 5 ? '+' + (alerts.length - 5) : '-2',
      trend: alerts.length > 5 ? 'up' as const : 'down' as const,
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      id: 'trends',
      label: 'Tendances Suivies',
      value: trends.length.toString(),
      change: '+3',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const recentReports = [
    {
      id: '1',
      title: 'Rapport Hebdomadaire Performance',
      date: 'Il y a 2 heures',
      status: 'success' as const,
    },
    {
      id: '2',
      title: 'Analyse Budgétaire Q4',
      date: 'Il y a 1 jour',
      status: 'warning' as const,
    },
    {
      id: '3',
      title: 'Comparaison Bureaux - Décembre',
      date: 'Il y a 2 jours',
      status: 'success' as const,
    },
  ];

  // Use real trends data when available
  const displayTrends = (trends || []).slice(0, 3).map((t) => ({
    id: t.id,
    metric: t.metric,
    current: t.current,
    previous: t.previous,
    trend: t.trend,
    unit: t.unit,
  }));

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          const colorClasses = {
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          };

          const handleMetricClick = () => {
            if (metric.id === 'kpis-total') {
              // Naviguer vers la vue KPIs
              // ou ouvrir stats modal
              openModal('stats');
            } else if (metric.id === 'alerts') {
              // Naviguer vers la vue Alertes ou ouvrir directement
              openModal('stats');
            } else if (metric.id === 'performance') {
              openModal('stats');
            } else if (metric.id === 'trends') {
              openModal('stats');
            }
          };

          return (
            <div
              key={metric.id}
              onClick={handleMetricClick}
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

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Rapports Récents</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => openModal('report', { reportId: report.id })}
                className="p-3 rounded-lg border border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {report.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{report.date}</p>
                  </div>
                  <Badge
                    variant={report.status === 'success' ? 'default' : 'warning'}
                    className="text-xs"
                  >
                    {report.status === 'success' ? 'Complet' : 'En cours'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Tendances</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {displayTrends.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aucune tendance disponible</p>
            ) : (
              displayTrends.map((trend) => {
                const isPositive = trend.trend === 'up';
                const diff = Math.abs(trend.current - (trend.previous || 0));
                const percentChange = trend.previous && trend.previous > 0
                  ? ((diff / trend.previous) * 100).toFixed(1)
                  : trend.current > 0 ? '100' : '0';

                const handleTrendClick = () => {
                  // Ouvrir le panneau latéral ou modal pour voir les détails de la tendance
                  openDetailPanel('kpi', trend.id, {
                    name: trend.metric,
                    value: trend.current,
                    unit: trend.unit,
                    trend: trend.trend,
                    previous: trend.previous,
                  });
                };

                return (
                  <div 
                    key={trend.id} 
                    onClick={handleTrendClick}
                    className="space-y-2 cursor-pointer hover:bg-slate-800/30 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">{trend.metric}</p>
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-sm font-medium text-emerald-400">
                          {percentChange}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-200">
                        {trend.current}
                        {trend.unit && (
                          <span className="text-sm text-slate-400 ml-1">{trend.unit}</span>
                        )}
                      </span>
                      <span className="text-sm text-slate-400">
                        vs {trend.previous}
                        {trend.unit}
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                        style={{
                          width: `${(trend.current / (trend.current + trend.previous)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nouveau Rapport', icon: PieChart, color: 'purple' },
          { label: 'Exporter Données', icon: LineChart, color: 'blue' },
          { label: 'Comparer Bureaux', icon: Users, color: 'emerald' },
          { label: 'Voir Alertes', icon: AlertTriangle, color: 'amber' },
        ].map((action, idx) => {
          const Icon = action.icon;
          const colorClasses = {
            purple: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300',
            blue: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300',
            emerald: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300',
            amber: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300',
          };
          return (
            <button
              key={idx}
              className={cn(
                'p-4 rounded-xl border transition-all text-left group',
                colorClasses[action.color as keyof typeof colorClasses]
              )}
            >
              <Icon className="w-5 h-5 mb-2" />
              <p className="text-sm font-medium">
                {action.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ================================
// Performance View
// ================================
const PerformanceView = React.memo(function PerformanceView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: kpisData, isLoading, error } = useKpis();

  // Hooks must be called before any conditional returns
  const allKpis = kpisData?.kpis || [];
  
  // Filter KPIs based on subcategory
  const filteredKPIs = useMemo(() => {
    if (!Array.isArray(allKpis)) return [];
    if (subCategory === 'all') return allKpis;
    if (subCategory === 'critical') return allKpis.filter((k) => k.status === 'critical');
    if (subCategory === 'warning') return allKpis.filter((k) => k.status === 'warning');
    return allKpis.filter((k) => k.status === 'success');
  }, [allKpis, subCategory]);

  // Configuration selon subCategory
  const config = useMemo(() => {
    if (subCategory === 'critical') {
      return {
        title: 'KPIs Critiques',
        description: 'Indicateurs nécessitant une attention immédiate',
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
      };
    }
    if (subCategory === 'warning') {
      return {
        title: 'KPIs en Attention',
        description: 'Indicateurs nécessitant une surveillance particulière',
        icon: AlertTriangle,
        color: 'amber',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400',
      };
    }
    if (subCategory === 'success') {
      return {
        title: 'KPIs Performants',
        description: 'Indicateurs atteignant ou dépassant les objectifs',
        icon: CheckCircle2,
        color: 'emerald',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
      };
    }
    return {
      title: 'KPIs Performance',
      description: 'Vue d\'ensemble de tous les indicateurs de performance',
      icon: Target,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    };
  }, [subCategory]);

  const Icon = config.icon;

  // Statistiques spécifiques au filtre
  const stats = useMemo(() => {
    const kpis = filteredKPIs;
    const avgValue = kpis.length > 0
      ? kpis.reduce((sum, k) => {
          const val = typeof k.value === 'number' ? k.value : parseFloat(String(k.value)) || 0;
          return sum + val;
        }, 0) / kpis.length
      : 0;
    
    const avgTarget = kpis.length > 0
      ? kpis.reduce((sum, k) => {
          const tgt = typeof k.target === 'number' ? k.target : parseFloat(String(k.target || 0)) || 0;
          return sum + tgt;
        }, 0) / kpis.length
      : 0;
    
    const avgPercentage = avgTarget > 0 ? (avgValue / avgTarget) * 100 : 0;
    
    const categories = kpis.reduce((acc: Record<string, number>, k) => {
      const cat = k.category || 'autre';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return {
      total: kpis.length,
      avgValue: avgValue.toFixed(1),
      avgTarget: avgTarget.toFixed(1),
      avgPercentage: avgPercentage.toFixed(1),
      categories,
      categoriesCount: Object.keys(categories).length,
    };
  }, [filteredKPIs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300">Erreur de chargement des KPIs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header contextuel */}
      <div className={cn('p-6 rounded-xl border', config.bgColor, config.borderColor)}>
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg', config.bgColor)}>
            <Icon className={cn('w-8 h-8', config.textColor)} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-200 mb-2">{config.title}</h2>
            <p className="text-slate-400">{config.description}</p>
          </div>
          <Badge variant={subCategory === 'critical' ? 'urgent' : subCategory === 'warning' ? 'warning' : 'default'} className="text-lg px-4 py-2">
            {stats.total} KPI{stats.total > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Total KPIs</p>
                <p className="text-2xl font-bold text-slate-200">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </FluentCardContent>
        </FluentCard>

        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Valeur moyenne</p>
                <p className="text-2xl font-bold text-slate-200">{stats.avgValue}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </FluentCardContent>
        </FluentCard>

        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Objectif moyen</p>
                <p className="text-2xl font-bold text-slate-200">{stats.avgTarget}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </FluentCardContent>
        </FluentCard>

        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Performance moyenne</p>
                <p className="text-2xl font-bold text-slate-200">{stats.avgPercentage}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-400" />
            </div>
          </FluentCardContent>
        </FluentCard>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mt-1">
            {filteredKPIs.length} indicateur{filteredKPIs.length > 1 ? 's' : ''} • {stats.categoriesCount} catégorie{stats.categoriesCount > 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant="default" className="text-xs">
          {subCategory === 'all' ? 'Tous' : subCategory}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKPIs.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400">
            Aucun KPI trouvé pour ce filtre
          </div>
        ) : (
          filteredKPIs.map((kpi) => {
            const value = typeof kpi.value === 'number' ? kpi.value : parseFloat(String(kpi.value));
            const target = typeof kpi.target === 'number' ? kpi.target : parseFloat(String(kpi.target || value));
            const percentage = target > 0 ? (value / target) * 100 : 100;
            const isAboveTarget = value >= target;

            const handleKPIClick = () => {
              // Ouvrir le panneau latéral pour vue rapide
              openDetailPanel('kpi', kpi.id, {
                name: kpi.name,
                value: kpi.value,
                unit: kpi.unit,
                target: kpi.target,
                status: kpi.status,
                category: kpi.category,
              });
              
              // Ou ouvrir directement la modal complète:
              // openModal('kpi-detail', { kpiId: kpi.id });
            };

            return (
              <div
                key={kpi.id}
                onClick={handleKPIClick}
                className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-slate-300">{kpi.name}</p>
                  <Badge
                    variant={kpi.status === 'success' ? 'default' : 'warning'}
                    className="text-xs"
                  >
                    {kpi.status === 'success'
                      ? 'OK'
                      : kpi.status === 'warning'
                      ? 'Attention'
                      : 'Critique'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-slate-200">{kpi.value}</span>
                  {kpi.unit && <span className="text-sm text-slate-400">{kpi.unit}</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Objectif: {target}
                      {kpi.unit}
                    </span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-all',
                        isAboveTarget
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      )}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Visualisations</h3>
        <ChartGrid
          columns={2}
          charts={[
            {
              id: 'perf-trend',
              title: 'Évolution des performances',
              span: 2,
              chartProps: {
                data: filteredKPIs.slice(0, 7).map((kpi, idx) => ({
                  name: `J-${6 - idx}`,
                  value: ((kpi as any).current ?? kpi.value ?? 0) - Math.random() * 10,
                  target: kpi.target,
                })),
                type: 'area',
                dataKeys: ['value', 'target'],
                colors: ['#3b82f6', '#f59e0b'],
                showTrend: true,
                enableExport: true,
              },
            },
            {
              id: 'status-distribution',
              title: 'Distribution par statut',
              chartProps: {
                data: [
                  {
                    name: 'Critique',
                    value: Array.isArray(allKpis) ? allKpis.filter((k) => k.status === 'critical').length : 0,
                  },
                  {
                    name: 'Attention',
                    value: Array.isArray(allKpis) ? allKpis.filter((k) => k.status === 'warning').length : 0,
                  },
                  {
                    name: 'OK',
                    value: Array.isArray(allKpis) ? allKpis.filter((k) => k.status === 'success').length : 0,
                  },
                ],
                type: 'pie',
                colors: ['#ef4444', '#f59e0b', '#10b981'],
                showLegend: true,
              },
            },
            {
              id: 'category-performance',
              title: 'Performance par catégorie',
              chartProps: {
                data: [
                  { name: 'Opérationnel', value: 85 },
                  { name: 'Financier', value: 92 },
                  { name: 'Qualité', value: 78 },
                  { name: 'Conformité', value: 88 },
                ],
                type: 'bar',
                colors: ['#3b82f6'],
                showGrid: true,
              },
            },
          ]}
        />
      </div>
    </div>
  );
});

// ================================
// Alerts View
// ================================
const AlertsView = React.memo(function AlertsView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: alertsData, isLoading, error } = useAlerts();

  // Hooks must be called before any conditional returns
  const filteredAlerts = useMemo(() => {
    const alerts = alertsData?.alerts || [];
    if (!Array.isArray(alerts)) return [];
    
    if (subCategory === 'all') {
      return alerts;
    }
    
    if (subCategory === 'critical') {
      return alerts.filter((a) => a.severity === 'critical');
    }
    
    if (subCategory === 'warning') {
      return alerts.filter((a) => a.severity === 'warning');
    }
    
    if (subCategory === 'resolved') {
      return alerts.filter((a: any) => a.status === 'resolved');
    }
    
    // Par défaut, retourner toutes les alertes
    return alerts;
  }, [alertsData?.alerts, subCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300">Erreur de chargement des alertes</p>
        </div>
      </div>
    );
  }

  const handleAlertClick = (alert: any) => {
    openDetailPanel('alert', alert.id, {
      title: alert.title,
      message: (alert as any).message,
      severity: alert.severity,
      category: (alert as any).category,
      status: (alert as any).status,
      createdAt: (alert as any).createdAt,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune alerte disponible</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      alert.severity === 'critical'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    )}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-slate-200 mb-1">{alert.title}</h4>
                    {(alert as any).message && (
                      <p className="text-sm text-slate-400 line-clamp-2">{(alert as any).message}</p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    alert.severity === 'critical'
                      ? 'destructive'
                      : alert.severity === 'warning'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {(alert as any).category && <span>Catégorie: {(alert as any).category}</span>}
                {(alert as any).createdAt && <span>{(alert as any).createdAt}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

// ================================
// Financial View - Importé depuis FinancialView.tsx
// ================================

// ================================
// Trends View
// ================================
const TrendsView = React.memo(function TrendsView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel } = useAnalyticsCommandCenterStore();
  const { data: trendsData, isLoading } = useTrends();

  // Extraire les trends de manière inconditionnelle
  const trends = trendsData?.trends || [];

  // Filtrer les trends selon la sous-catégorie - DOIT être appelé avant tout return
  const filteredTrends = useMemo(() => {
    if (subCategory === 'all') {
      return trends;
    }
    if (!Array.isArray(trends)) return [];
    if (subCategory === 'positive') {
      return trends.filter((t: any) => t.trend === 'up');
    }
    if (subCategory === 'negative') {
      return trends.filter((t: any) => t.trend === 'down');
    }
    if (subCategory === 'stable') {
      return trends.filter((t: any) => t.trend === 'stable');
    }
    return trends;
  }, [trends, subCategory]);

  // Maintenant on peut faire les returns conditionnels
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const handleTrendClick = (trend: any) => {
    openDetailPanel('kpi', trend.id, {
      name: trend.metric,
      value: trend.current,
      unit: trend.unit,
      trend: trend.trend,
      previous: trend.previous,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {filteredTrends.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {subCategory === 'positive' && 'Aucune tendance positive disponible'}
              {subCategory === 'negative' && 'Aucune tendance négative disponible'}
              {subCategory === 'stable' && 'Aucune tendance stable disponible'}
              {subCategory !== 'positive' && subCategory !== 'negative' && subCategory !== 'stable' && 'Aucune tendance disponible'}
            </p>
          </div>
        ) : (
          filteredTrends.map((trend) => {
            const isPositive = trend.trend === 'up';
            const diff = Math.abs(trend.current - trend.previous);
            const percentChange = trend.previous > 0
              ? ((diff / trend.previous) * 100).toFixed(1)
              : '0';

            return (
              <div
                key={trend.id}
                onClick={() => handleTrendClick(trend)}
                className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-semibold text-slate-200">{trend.metric}</p>
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {percentChange}%
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-200">
                    {trend.current}
                    {trend.unit && <span className="text-sm text-slate-400 ml-1">{trend.unit}</span>}
                  </span>
                  <span className="text-sm text-slate-400">
                    vs {trend.previous}
                    {trend.unit}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

// ================================
// Reports View
// ================================
const ReportsView = React.memo(function ReportsView({ subCategory }: { subCategory: string }) {
  const { openModal } = useAnalyticsCommandCenterStore();

  const reports = [
    {
      id: '1',
      title: 'Rapport Hebdomadaire Performance',
      date: 'Il y a 2 heures',
      status: 'success' as const,
      category: 'performance',
    },
    {
      id: '2',
      title: 'Analyse Budgétaire Q4',
      date: 'Il y a 1 jour',
      status: 'warning' as const,
      category: 'financial',
    },
    {
      id: '3',
      title: 'Comparaison Bureaux - Décembre',
      date: 'Il y a 2 jours',
      status: 'success' as const,
      category: 'comparison',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => openModal('report', { reportId: report.id })}
            className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-slate-200 mb-1">{report.title}</h4>
                <p className="text-sm text-slate-400">{report.date}</p>
                {report.category && (
                  <Badge variant="default" className="mt-2 text-xs">
                    {report.category}
                  </Badge>
                )}
              </div>
              <Badge
                variant={report.status === 'success' ? 'default' : 'warning'}
                className="text-xs"
              >
                {report.status === 'success' ? 'Complet' : 'En cours'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ================================
// KPIs View
// ================================
const KPIsView = React.memo(function KPIsView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel } = useAnalyticsCommandCenterStore();
  const { data: kpisData, isLoading } = useKpis();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const kpis = kpisData?.kpis || [];

  const handleKPIClick = (kpi: any) => {
    openDetailPanel('kpi', kpi.id, {
      name: kpi.name || kpi.label,
      value: kpi.value,
      unit: kpi.unit,
      target: kpi.target,
      status: kpi.status,
      category: kpi.category,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const value = typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value;

          return (
            <div
              key={kpi.id}
              onClick={() => handleKPIClick(kpi)}
              className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-slate-300">{kpi.name || (kpi as any).label}</p>
                <Badge
                  variant={kpi.status === 'success' ? 'default' : 'warning'}
                  className="text-xs"
                >
                  {kpi.status === 'success'
                    ? 'OK'
                    : kpi.status === 'warning'
                    ? 'Attention'
                    : 'Critique'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-slate-200">{value}</span>
                {kpi.unit && <span className="text-sm text-slate-400">{kpi.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ================================
// Comparison View
// ================================
const ComparisonView = React.memo(function ComparisonView({ subCategory }: { subCategory: string }) {
  const { openModal } = useAnalyticsCommandCenterStore();
  const { data: bureauPerfData } = useBureauxPerformance();

  const handleOpenComparison = () => {
    openModal('comparison', { 
      selectedBureaux: bureauPerfData?.bureaux?.slice(0, 5).map(b => b.bureauCode) || []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Comparaisons & Benchmarks</h2>
          <p className="text-slate-400 text-sm">
            Comparez les performances et métriques financières entre bureaux
          </p>
        </div>
        <button
          onClick={handleOpenComparison}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Ouvrir la comparaison
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Fonctionnalités disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-slate-200">Performance</h4>
            </div>
            <p className="text-sm text-slate-400">
              Comparez les scores, taux de validation, conformité SLA et délais moyens entre bureaux
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h4 className="font-semibold text-slate-200">Financier</h4>
            </div>
            <p className="text-sm text-slate-400">
              Analysez les budgets, revenus, dépenses et marges de chaque bureau
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// ================================
// Bureaux View
// ================================
const BureauxView = React.memo(function BureauxView({ subCategory }: { subCategory: string }) {
  const { openModal, openDetailPanel } = useAnalyticsCommandCenterStore();
  const { data: bureauxData, isLoading } = useBureauxPerformance();
  
  // Hooks must be called before any conditional returns
  const bureauPerf = useMemo(() => {
    if (!bureauxData?.bureaux) return [];
    return bureauxData.bureaux;
  }, [bureauxData]);

  const financialPerf = useMemo(() => calculateFinancialPerformance(), []);

  // Filtrer selon la sous-catégorie
  const filteredBureaux = useMemo(() => {
    if (subCategory === 'all') return bureauPerf;
    // Filtrer par code de bureau si nécessaire
    return bureauPerf.filter((b: any) => {
      const bureauInfo = bureauxList.find((bu: any) => bu.code === b.bureauCode);
      if (subCategory === 'btp' && bureauInfo?.code?.includes('BTP')) return true;
      if (subCategory === 'bj' && bureauInfo?.code?.includes('BJ')) return true;
      if (subCategory === 'bs' && bureauInfo?.code?.includes('BS')) return true;
      return false;
    });
  }, [bureauPerf, subCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const handleBureauClick = (bureauCode: string) => {
    const perf = bureauPerf.find((b: any) => b.bureauCode === bureauCode);
    const financial = financialPerf.find((b: any) => b.bureauCode === bureauCode);
    const bureauInfo = bureauxList.find((b: any) => b.code === bureauCode);

    if (perf) {
      openDetailPanel('kpi', bureauCode, {
        name: bureauInfo?.name || bureauCode,
        code: bureauCode,
        performance: perf,
        financial: financial,
        icon: bureauInfo?.icon,
      });
    }
  };

  const handleCompareBureaux = (bureauCode: string) => {
    openModal('comparison', { 
      selectedBureaux: [bureauCode]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{filteredBureaux.length}</div>
              <div className="text-xs text-slate-400">Bureaux actifs</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">
                {filteredBureaux.length > 0 
                  ? Math.round(filteredBureaux.reduce((sum: number, b: any) => sum + b.score, 0) / filteredBureaux.length)
                  : 0}
              </div>
              <div className="text-xs text-slate-400">Score moyen</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">
                {Array.isArray(filteredBureaux) && filteredBureaux.length > 0
                  ? filteredBureaux.reduce((sum: number, b: any) => sum + (b.totalDemands || 0), 0)
                  : 0}
              </div>
              <div className="text-xs text-slate-400">Total demandes</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">
                {filteredBureaux.length > 0
                  ? Math.round(
                      filteredBureaux.reduce((sum: number, b: any) => sum + b.validationRate, 0) / 
                      filteredBureaux.length
                    )
                  : 0}%
              </div>
              <div className="text-xs text-slate-400">Taux validation moyen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des bureaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBureaux.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun bureau disponible</p>
          </div>
        ) : (
          filteredBureaux.map((bureau: any) => {
            const bureauInfo = bureauxList.find((b: any) => b.code === bureau.bureauCode);
            const financial = financialPerf.find((b: any) => b.bureauCode === bureau.bureauCode);
            
            return (
              <div
                key={bureau.bureauCode}
                className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-2xl">
                      {bureauInfo?.icon || '🏢'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-lg">{bureau.bureauCode}</h3>
                      <p className="text-xs text-slate-400">{bureau.bureauName}</p>
                    </div>
                  </div>
                  <Badge 
                    className={cn(
                      'text-xs font-semibold',
                      bureau.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      bureau.score >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    )}
                  >
                    {bureau.score}
                  </Badge>
                </div>

                {/* Métriques principales */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400 mb-1">Total</div>
                      <div className="text-sm font-semibold text-slate-200">{bureau.totalDemands}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400 mb-1">Validées</div>
                      <div className="text-sm font-semibold text-emerald-400">{bureau.validated}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400 mb-1">En attente</div>
                      <div className="text-sm font-semibold text-amber-400">{bureau.pending}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400 mb-1">Retard</div>
                      <div className="text-sm font-semibold text-red-400">{bureau.overdue}</div>
                    </div>
                  </div>

                  {/* Barre de progression validation */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Taux de validation</span>
                      <span className="text-slate-300 font-medium">{bureau.validationRate}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className={cn(
                          'h-2 rounded-full transition-all',
                          bureau.validationRate >= 80 ? 'bg-emerald-500' :
                          bureau.validationRate >= 60 ? 'bg-amber-500' :
                          'bg-red-500'
                        )}
                        style={{ width: `${bureau.validationRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Barre de progression SLA */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Conformité SLA</span>
                      <span className="text-slate-300 font-medium">{bureau.slaCompliance}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className={cn(
                          'h-2 rounded-full transition-all',
                          bureau.slaCompliance >= 90 ? 'bg-emerald-500' :
                          bureau.slaCompliance >= 75 ? 'bg-amber-500' :
                          'bg-red-500'
                        )}
                        style={{ width: `${bureau.slaCompliance}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Informations financières */}
                {financial && (
                  <div className="border-t border-slate-700 pt-3 mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400">Budget utilisé</span>
                      <span className="text-slate-300 font-medium">{financial.budgetUtilization}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2">
                      <div 
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          financial.budgetUtilization >= 90 ? 'bg-red-500' :
                          financial.budgetUtilization >= 75 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        )}
                        style={{ width: `${financial.budgetUtilization}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Résultat net</span>
                      <span className={cn(
                        'font-medium',
                        financial.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {financial.netResult >= 0 ? '+' : ''}{formatFCFA(financial.netResult)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                  <button
                    onClick={() => handleBureauClick(bureau.bureauCode)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                  >
                    Voir détails
                  </button>
                  <button
                    onClick={() => handleCompareBureaux(bureau.bureauCode)}
                    className="px-3 py-1.5 text-xs font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
                    title="Comparer avec d'autres bureaux"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

