'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Wallet,
  Activity,
  Target,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react';

// ================================
// Types
// ================================
interface DirectionKPI {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon: typeof TrendingUp;
  color: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'orange';
  priority: 'high' | 'medium' | 'low';
}

interface DirectionAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
}

interface DirectionStats {
  kpis: DirectionKPI[];
  alerts: DirectionAlert[];
  lastUpdated: string;
}

// ================================
// Mock data
// ================================
const MOCK_DIRECTION_STATS: DirectionStats = {
  kpis: [
    {
      id: 'kpi-pending',
      label: 'Demandes en attente',
      value: 23,
      previousValue: 28,
      trend: 'down',
      trendValue: -17.8,
      icon: Clock,
      color: 'amber',
      priority: 'high',
    },
    {
      id: 'kpi-validated',
      label: 'Validées ce mois',
      value: 156,
      previousValue: 142,
      trend: 'up',
      trendValue: 9.8,
      icon: CheckCircle2,
      color: 'emerald',
      priority: 'medium',
    },
    {
      id: 'kpi-rejected',
      label: 'Rejetées ce mois',
      value: 12,
      previousValue: 18,
      trend: 'down',
      trendValue: -33.3,
      icon: XCircle,
      color: 'rose',
      priority: 'medium',
    },
    {
      id: 'kpi-avg-time',
      label: 'Délai moyen traitement',
      value: '2.3',
      unit: 'jours',
      previousValue: '3.1',
      trend: 'down',
      trendValue: -25.8,
      icon: Zap,
      color: 'blue',
      priority: 'high',
    },
    {
      id: 'kpi-budget',
      label: 'Budget consommé',
      value: '67%',
      previousValue: '58%',
      trend: 'up',
      trendValue: 15.5,
      icon: Wallet,
      color: 'purple',
      priority: 'medium',
    },
    {
      id: 'kpi-compliance',
      label: 'Taux de conformité',
      value: '98.2%',
      previousValue: '97.5%',
      trend: 'up',
      trendValue: 0.7,
      icon: Shield,
      color: 'emerald',
      priority: 'high',
    },
    {
      id: 'kpi-absences',
      label: 'Agents en congé',
      value: 8,
      icon: Calendar,
      color: 'orange',
      priority: 'low',
    },
    {
      id: 'kpi-sla',
      label: 'Respect SLA',
      value: '94%',
      previousValue: '91%',
      trend: 'up',
      trendValue: 3.3,
      icon: Target,
      color: 'blue',
      priority: 'high',
    },
  ],
  alerts: [
    {
      id: 'alert-1',
      severity: 'critical',
      title: '3 demandes hors délai SLA',
      description: 'Ces demandes dépassent le délai de traitement standard de 5 jours.',
      actionLabel: 'Traiter maintenant',
    },
    {
      id: 'alert-2',
      severity: 'warning',
      title: 'Budget déplacements proche limite',
      description: 'Le budget déplacements est à 89% de consommation pour ce trimestre.',
      actionLabel: 'Voir détails',
    },
    {
      id: 'alert-3',
      severity: 'info',
      title: 'Pic de congés prévu',
      description: '12 agents ont demandé des congés pour la période du 20-27 janvier.',
      actionLabel: 'Planifier',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// ================================
// Component
// ================================
interface Props {
  onAction?: (action: string) => void;
  className?: string;
}

export function RHDirectionPanel({ onAction, className }: Props) {
  const [stats, setStats] = useState<DirectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kpis' | 'alerts'>('kpis');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats(MOCK_DIRECTION_STATS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20',
    },
    orange: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/20',
    },
  };

  const severityClasses: Record<string, { bg: string; text: string; border: string; icon: typeof AlertTriangle }> = {
    critical: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/30',
      icon: XCircle,
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/30',
      icon: Activity,
    },
  };

  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70', className)}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const highPriorityKPIs = stats.kpis.filter((k) => k.priority === 'high');
  const otherKPIs = stats.kpis.filter((k) => k.priority !== 'high');

  return (
    <div className={cn('rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70', className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Tableau de bord Direction</h3>
              <p className="text-sm text-slate-400">
                Dernière mise à jour : {new Date(stats.lastUpdated).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('kpis')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'kpis'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
              type="button"
            >
              KPIs
            </button>
            <button
              onClick={() => setViewMode('alerts')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                viewMode === 'alerts'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
              type="button"
            >
              Alertes
              {stats.alerts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                  {stats.alerts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'kpis' ? (
          <div className="space-y-6">
            {/* High priority KPIs */}
            <div>
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Indicateurs prioritaires
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {highPriorityKPIs.map((kpi) => {
                  const Icon = kpi.icon;
                  const colors = colorClasses[kpi.color];

                  return (
                    <div
                      key={kpi.id}
                      className={cn(
                        'p-4 rounded-xl border transition-all hover:shadow-md',
                        colors.bg,
                        colors.border
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={cn('w-4 h-4', colors.text)} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                          {kpi.label}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{kpi.value}</span>
                          {kpi.unit && <span className="text-sm text-slate-400">{kpi.unit}</span>}
                        </div>

                        {kpi.trend && kpi.trendValue !== undefined && (
                          <div
                            className={cn(
                              'flex items-center gap-0.5 text-xs font-medium',
                              kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-rose-600' : 'text-slate-400'
                            )}
                          >
                            {kpi.trend === 'up' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : kpi.trend === 'down' ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            {Math.abs(kpi.trendValue).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other KPIs */}
            <div>
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Autres indicateurs
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {otherKPIs.map((kpi) => {
                  const Icon = kpi.icon;
                  const colors = colorClasses[kpi.color];

                  return (
                    <div
                      key={kpi.id}
                      className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn('w-4 h-4', colors.text)} />
                        <span className="text-xs text-slate-400 truncate">{kpi.label}</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-semibold">{kpi.value}</span>
                        {kpi.unit && <span className="text-xs text-slate-400">{kpi.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.alerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune alerte active</p>
              </div>
            ) : (
              stats.alerts.map((alert) => {
                const severity = severityClasses[alert.severity];
                const Icon = severity.icon;

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-4 rounded-xl border',
                      severity.bg,
                      severity.border
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', severity.text)} />
                      <div className="flex-1 min-w-0">
                        <h5 className={cn('font-semibold text-sm', severity.text)}>
                          {alert.title}
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {alert.description}
                        </p>
                        {alert.actionLabel && (
                          <button
                            onClick={() => onAction?.(alert.id)}
                            className={cn(
                              'mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                              severity.bg,
                              severity.text,
                              'hover:opacity-80'
                            )}
                            type="button"
                          >
                            {alert.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

