/**
 * Page Vue d'ensemble des KPIs
 * VERSION OPTIMISÉE - Structure améliorée, hiérarchie visuelle claire
 * Affiche un aperçu de tous les KPIs disponibles organisés par catégorie
 */

'use client';

import React from 'react';
import { BarChart3, TrendingUp, Target, Activity, DollarSign, Users, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface KpiCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
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
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'purple';
}

export default function KpiOverviewPage() {
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

  const renderSummaryStat = (stat: SummaryStat, index: number) => {
    const StatIcon = stat.icon;
    const isPositive = stat.trendType === 'up';
    const isNegative = stat.trendType === 'down';
    const isNeutral = stat.trendType === 'neutral';

    return (
      <div
        key={index}
        className={cn(
          "bg-gradient-to-br rounded-xl p-6 border-2 shadow-lg",
          stat.color === 'blue' && "from-blue-500/20 to-blue-600/10 border-blue-500/50",
          stat.color === 'emerald' && "from-emerald-500/20 to-emerald-600/10 border-emerald-500/50",
          stat.color === 'purple' && "from-purple-500/20 to-purple-600/10 border-purple-500/50"
        )}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center text-white",
              stat.color === 'blue' && "bg-blue-600",
              stat.color === 'emerald' && "bg-emerald-600",
              stat.color === 'purple' && "bg-purple-600"
            )}
          >
            <StatIcon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-lg text-slate-300 font-medium">{stat.label}</p>
            <p className="text-4xl font-extrabold text-white">{stat.value}</p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            isPositive && "text-green-400",
            isNegative && "text-red-400",
            isNeutral && "text-slate-400"
          )}
        >
          {!isNeutral && (
            <>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4 rotate-180" />
              )}
              <span>{stat.trend} ce mois</span>
            </>
          )}
          {isNeutral && <span>{stat.trend}</span>}
        </div>
      </div>
    );
  };

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
          "bg-gradient-to-br rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all cursor-pointer group",
          category.color === 'blue' && "from-blue-500/20 to-blue-600/10 border-blue-500/50 hover:border-blue-400",
          category.color === 'purple' && "from-purple-500/20 to-purple-600/10 border-purple-500/50 hover:border-purple-400",
          category.color === 'emerald' && "from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 hover:border-emerald-400"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white",
              category.color === 'blue' && "bg-blue-600",
              category.color === 'purple' && "bg-purple-600",
              category.color === 'emerald' && "bg-emerald-600"
            )}
          >
            <CategoryIcon className="w-6 h-6" />
          </div>
          <Badge className={cn(statusColors[category.status], "text-white")}>
            {category.count} KPIs
          </Badge>
        </div>

        {/* Title et description */}
        <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{category.description}</p>

        {/* Indicateurs clés */}
        {category.indicators && category.indicators.length > 0 && (
          <div className="space-y-2 mb-4 pt-4 border-t border-slate-700/50">
            {category.indicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{indicator.label}</span>
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
        <div className="flex items-center gap-2 text-sm text-slate-300 group-hover:text-white transition-colors">
          <span>Voir les détails</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Vue d'ensemble des KPIs</h1>
        <p className="text-slate-400 text-lg">Tous les indicateurs de performance disponibles organisés par catégorie</p>
      </div>

      {/* Stats Summary */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {summaryStats.map(renderSummaryStat)}
        </div>
      </section>

      {/* KPI Categories */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Catégories de KPIs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCategories.map(renderKpiCategory)}
        </div>
      </section>

      {/* Context Section */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          À propos des KPIs
        </h2>
        <p className="text-slate-300">
          Cette section présente tous les indicateurs de performance disponibles dans le système.
          Les KPIs sont organisés par catégorie pour faciliter la navigation et l'analyse.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">KPIs Projet</h3>
            </div>
            <p className="text-sm text-slate-400">Indicateurs spécifiques à chaque projet individuel</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">KPIs Projets</h3>
            </div>
            <p className="text-sm text-slate-400">Vue agrégée de tous les projets</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">KPIs Budget</h3>
            </div>
            <p className="text-sm text-slate-400">Suivi financier et consommation budgétaire</p>
          </div>
        </div>
      </section>
    </div>
  );
}
