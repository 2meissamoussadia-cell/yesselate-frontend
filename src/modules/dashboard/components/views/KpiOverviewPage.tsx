/**
 * Page Vue d'ensemble des KPIs
 * VERSION OPTIMISÉE - Structure améliorée, hiérarchie visuelle claire
 * Affiche un aperçu de tous les KPIs disponibles organisés par catégorie
 */

'use client';

import React, { memo } from 'react';
import { BarChart3, TrendingUp, Target, Activity, DollarSign, Users, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';
import { KPICard } from '@/components/features/bmo/dashboard/components';
import { DashboardPageShell } from '../shared/DashboardPageShell';
import { DashboardPanel } from '../shared/DashboardPanel';

interface KpiCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'emerald';
  count: number;
  status: 'active' | 'warning' | 'critical';
  route: string;
  indicators?: Array<{
    label: string;
    value: string;
    trend: string;
    trendType: 'up' | 'down' | 'neutral';
  }>;
}

interface SummaryStat {
  label: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'purple';
}

export const KpiOverviewPage = memo(function KpiOverviewPage() {
  const summaryStats: SummaryStat[] = [
    {
      label: 'Total KPIs',
      value: '65',
      trend: '+5',
      trendType: 'up',
      icon: Activity,
      color: 'blue',
    },
    {
      label: 'KPIs Actifs',
      value: '58',
      trend: '+3',
      trendType: 'up',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      label: 'Projets Suivis',
      value: '24',
      trend: '+2',
      trendType: 'up',
      icon: Users,
      color: 'purple',
    },
  ];

  const kpiCategories: KpiCategory[] = [
    {
      id: 'projet',
      title: 'KPIs Projet',
      description: 'Indicateurs de performance par projet individuel',
      icon: Target,
      color: 'blue',
      count: 12,
      status: 'active',
      route: '/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=projet',
      indicators: [
        { label: 'Avancement moyen', value: '78%', trend: '+2%', trendType: 'up' },
        { label: 'Projets en retard', value: '3', trend: '-1', trendType: 'down' },
      ],
    },
    {
      id: 'projets',
      title: 'KPIs Projets',
      description: 'Vue globale des indicateurs agrégés de tous les projets',
      icon: BarChart3,
      color: 'purple',
      count: 45,
      status: 'active',
      route: '/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=projets',
      indicators: [
        { label: 'Budget total', value: '12.5 Mds', trend: '+5%', trendType: 'up' },
        { label: 'Taux de conformité', value: '92%', trend: '+1%', trendType: 'up' },
      ],
    },
    {
      id: 'budget',
      title: 'KPIs Budget',
      description: 'Suivi budgétaire, consommation et conformité financière',
      icon: DollarSign,
      color: 'emerald',
      count: 8,
      status: 'active',
      route: '/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=budget',
      indicators: [
        { label: 'Budget consommé', value: '66%', trend: '+2%', trendType: 'up' },
        { label: 'Projets en alerte', value: '5', trend: '+2', trendType: 'up' },
      ],
    },
  ];

  const renderSummaryStat = (stat: SummaryStat, index: number) => (
    <KPICard
      key={`${stat.label}-${index}`}
      kpi={{
        id: `${stat.label}-${index}`,
        label: stat.label,
        value: stat.value,
        delta: `${stat.trend} ce mois`,
        trendType: stat.trendType,
        icon: stat.icon as any,
        color: stat.color as any,
      }}
      size="md"
    />
  );

  const renderKpiCategory = (category: KpiCategory) => {
    const CategoryIcon = category.icon;
    const statusColors = {
      active: 'bg-emerald-600',
      warning: 'bg-amber-600',
      critical: 'bg-red-600',
    };

    return (
      <div
        key={category.id}
        className={cn(
          'group relative rounded-2xl border border-slate-800/60 bg-slate-900/30',
          'transition-colors hover:bg-slate-900/45 hover:border-slate-700/60 cursor-pointer',
          category.status === 'warning' && 'ring-1 ring-amber-500/15',
          category.status === 'critical' && 'ring-1 ring-rose-500/20'
        )}
        style={{ padding: 'clamp(1rem, 1.5vw, 1.5rem)', minHeight: '200px' }}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 top-0 h-[2px]',
            category.color === 'blue' && 'bg-blue-400/80',
            category.color === 'purple' && 'bg-purple-400/80',
            category.color === 'emerald' && 'bg-emerald-400/80'
          )}
        />
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "rounded-xl flex items-center justify-center bg-slate-900/40 ring-1 ring-slate-800/60"
            )}
            style={{ width: 'clamp(2.5rem, 3.5vw, 3rem)', height: 'clamp(2.5rem, 3.5vw, 3rem)', minWidth: '2.5rem', minHeight: '2.5rem' }}
          >
            <CategoryIcon
              className={cn(
                category.color === 'blue' && 'text-blue-300',
                category.color === 'purple' && 'text-purple-300',
                category.color === 'emerald' && 'text-emerald-300'
              )}
              style={{ width: 'clamp(1.25rem, 1.75vw, 1.5rem)', height: 'clamp(1.25rem, 1.75vw, 1.5rem)', minWidth: '1.25rem', minHeight: '1.25rem' }}
            />
          </div>
          <Badge className={cn(statusColors[category.status], "text-white")} style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>
            {category.count} KPIs
          </Badge>
        </div>

        {/* Title et description */}
        <h3 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>{category.title}</h3>
        <p className="text-slate-300 mb-4" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>{category.description}</p>

        {/* Indicateurs clés */}
        {category.indicators && category.indicators.length > 0 && (
          <div className="space-y-2 mb-4 pt-4 border-t border-slate-700/50">
            {category.indicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center justify-between" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
                <span className="text-slate-300">{indicator.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{indicator.value}</span>
                  <span
                    className={cn(
                      indicator.trendType === 'up' && 'text-green-400',
                      indicator.trendType === 'down' && 'text-red-400',
                      indicator.trendType === 'neutral' && 'text-slate-400'
                    )}
                    style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}
                  >
                    {indicator.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to action */}
        <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
          <span>Voir les détails</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <DashboardPageShell
        title="Vue d'ensemble des KPIs"
        subtitle="Tous les indicateurs de performance disponibles organisés par catégorie"
      >
        <DashboardPanel className="p-4 sm:p-6">
          {/* Stats Summary */}
          <section className="space-y-4 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 break-words">
              <Activity className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="min-w-0">Vue d'ensemble</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
              {summaryStats.map(renderSummaryStat)}
            </div>
          </section>
        </DashboardPanel>

        <DashboardPanel className="p-4 sm:p-6">
          {/* KPI Categories */}
          <section className="space-y-4 min-w-0">
            <h2 className="font-semibold text-white flex items-center gap-2 break-words" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
              <BarChart3 className="text-purple-400 flex-shrink-0" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
              <span className="min-w-0">Catégories de KPIs</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
              {kpiCategories.map(renderKpiCategory)}
            </div>
          </section>
        </DashboardPanel>

        <DashboardPanel className="p-4 sm:p-6">
          {/* Context Section */}
          <section className="space-y-4 min-w-0 overflow-hidden">
            <h2 className="font-semibold text-white flex items-center gap-2 break-words" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
              <CheckCircle className="text-emerald-400 flex-shrink-0" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
              <span className="min-w-0">À propos des KPIs</span>
            </h2>
            <p className="text-slate-300 break-words" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
              Cette section présente tous les indicateurs de performance disponibles dans le système.
              Les KPIs sont organisés par catégorie pour faciliter la navigation et l'analyse.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 min-w-0">
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl" style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)', minHeight: '120px' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-blue-400" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
                  <h3 className="font-semibold text-white" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>KPIs Projet</h3>
                </div>
                <p className="text-slate-400" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>Indicateurs spécifiques à chaque projet individuel</p>
              </div>
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl" style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)', minHeight: '120px' }}>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="text-purple-400" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
                  <h3 className="font-semibold text-white" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>KPIs Projets</h3>
                </div>
                <p className="text-slate-300" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>Vue agrégée de tous les projets</p>
              </div>
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl" style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)', minHeight: '120px' }}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-emerald-400" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
                  <h3 className="font-semibold text-white" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>KPIs Budget</h3>
                </div>
                <p className="text-slate-300" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>Suivi financier et consommation budgétaire</p>
              </div>
            </div>
          </section>
        </DashboardPanel>
      </DashboardPageShell>
    </TooltipProvider>
  );
});

export default KpiOverviewPage;
