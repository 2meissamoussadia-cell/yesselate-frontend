/**
 * Page Vue d'ensemble des KPIs
 * VERSION OPTIMISÉE - Structure améliorée, hiérarchie visuelle claire
 * Affiche un aperçu de tous les KPIs disponibles organisés par catégorie
 */

'use client';

import React, { memo, useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Activity, DollarSign, Users, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';

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
        icon: stat.icon,
        color: stat.color,
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
      <DashboardPanel
        key={category.id}
        padding="md"
        className={cn(
          'group relative cursor-pointer min-h-[200px]',
          'hover:bg-slate-900/45 hover:border-slate-700/60 transition-colors',
          category.status === 'warning' && 'ring-1 ring-amber-500/15',
          category.status === 'critical' && 'ring-1 ring-rose-500/20'
        )}
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
          <div className="rounded-xl flex items-center justify-center bg-slate-900/40 ring-1 ring-slate-800/60 w-10 h-10">
            <CategoryIcon
              className={cn(
                'h-4 w-4 flex-shrink-0',
                category.color === 'blue' && 'text-blue-300',
                category.color === 'purple' && 'text-purple-300',
                category.color === 'emerald' && 'text-emerald-300'
              )}
              style={{ width: '1rem', height: '1rem', minWidth: '1rem', minHeight: '1rem', maxWidth: '1rem', maxHeight: '1rem' }}
            />
          </div>
          <Badge className={cn(statusColors[category.status], "text-white text-xs")}>
            {category.count} KPIs
          </Badge>
        </div>

        {/* Title et description */}
        <h3 className="font-bold text-white mb-2 text-lg">{category.title}</h3>
        <p className="text-slate-300 mb-4 text-sm">{category.description}</p>

        {/* Indicateurs clés */}
        {category.indicators && category.indicators.length > 0 && (
          <div className="space-y-2 mb-4 pt-4 border-t border-slate-700/50">
            {category.indicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{indicator.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{indicator.value}</span>
                  <span
                    className={cn(
                      'text-xs',
                      indicator.trendType === 'up' && 'text-green-400',
                      indicator.trendType === 'down' && 'text-red-400',
                      indicator.trendType === 'neutral' && 'text-slate-400'
                    )}
                  >
                    {indicator.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to action */}
        <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors text-sm">
          <span>Voir les détails</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform h-4 w-4" />
        </div>
      </DashboardPanel>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <DashboardPageLayout maxWidth="xl" padding="md">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
              Vue d'ensemble des KPIs
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Tous les indicateurs de performance disponibles organisés par catégorie
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <DashboardSection
          title="Vue d'ensemble"
          icon={Activity}
        >
          <DashboardGrid columns={3} gap="md">
            {summaryStats.map((stat, index) => renderSummaryStat(stat, index))}
          </DashboardGrid>
        </DashboardSection>

        {/* KPI Categories */}
        <DashboardSection
          title="Catégories de KPIs"
          icon={BarChart3}
        >
          <DashboardGrid columns={3} gap="md">
            {kpiCategories.map(renderKpiCategory)}
          </DashboardGrid>
        </DashboardSection>

        {/* Context Section */}
        <DashboardSection
          title="À propos des KPIs"
          icon={CheckCircle}
        >
          <p className="text-slate-300 text-sm">
            Cette section présente tous les indicateurs de performance disponibles dans le système.
            Les KPIs sont organisés par catégorie pour faciliter la navigation et l'analyse.
          </p>
          <DashboardGrid columns={3} gap="md" className="mt-4">
            <DashboardPanel padding="md" className="min-h-[120px]">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-400 h-3 w-3 flex-shrink-0" style={{ width: '0.75rem', height: '0.75rem', minWidth: '0.75rem', minHeight: '0.75rem', maxWidth: '0.75rem', maxHeight: '0.75rem' }} />
                <h3 className="font-semibold text-white text-sm">KPIs Projet</h3>
              </div>
              <p className="text-slate-400 text-xs">Indicateurs spécifiques à chaque projet individuel</p>
            </DashboardPanel>
            <DashboardPanel padding="md" className="min-h-[120px]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-purple-400 h-3 w-3 flex-shrink-0" style={{ width: '0.75rem', height: '0.75rem', minWidth: '0.75rem', minHeight: '0.75rem', maxWidth: '0.75rem', maxHeight: '0.75rem' }} />
                <h3 className="font-semibold text-white text-sm">KPIs Projets</h3>
              </div>
              <p className="text-slate-300 text-xs">Vue agrégée de tous les projets</p>
            </DashboardPanel>
            <DashboardPanel padding="md" className="min-h-[120px]">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-emerald-400 h-3 w-3 flex-shrink-0" style={{ width: '0.75rem', height: '0.75rem', minWidth: '0.75rem', minHeight: '0.75rem', maxWidth: '0.75rem', maxHeight: '0.75rem' }} />
                <h3 className="font-semibold text-white text-sm">KPIs Budget</h3>
              </div>
              <p className="text-slate-300 text-xs">Suivi financier et consommation budgétaire</p>
            </DashboardPanel>
          </DashboardGrid>
        </DashboardSection>
      </DashboardPageLayout>
    </TooltipProvider>
  );
});

export default KpiOverviewPage;
