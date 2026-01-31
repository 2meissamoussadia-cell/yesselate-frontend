/**
 * ContentRouter pour Arbitrages & Goulots
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 * Architecture Command Center v3.0
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Scale,
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Users,
  Workflow,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2,
  Gavel,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ArbitragesAnalyticsCharts } from '../analytics/ArbitragesAnalyticsCharts';

interface ContentRouterProps {
  category: string;
  subCategory: string | null;
}

export const ArbitragesContentRouter = React.memo(function ArbitragesContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Dashboard par défaut pour la vue overview
  if (category === 'overview') {
    return <OverviewDashboard />;
  }

  // Critiques view
  if (category === 'critical') {
    return <CriticalArbitragesView />;
  }

  // En attente view
  if (category === 'pending') {
    return <PendingArbitragesView />;
  }

  // Résolus view
  if (category === 'resolved') {
    return <ResolvedArbitragesView />;
  }

  // Par catégorie
  if (category === 'categories') {
    return <CategoryView subCategory={subCategory} />;
  }

  // Autres vues (placeholder)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Scale className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} {subCategory && `- ${subCategory}`}
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
  const metrics = [
    {
      id: 'total',
      label: 'Total Arbitrages',
      value: 89,
      change: '+5',
      trend: 'up' as const,
      icon: Scale,
      color: 'slate',
    },
    {
      id: 'critical',
      label: 'Critiques',
      value: 7,
      change: '-2',
      trend: 'down' as const,
      icon: AlertCircle,
      color: 'red',
    },
    {
      id: 'pending',
      label: 'En attente',
      value: 23,
      change: '+3',
      trend: 'up' as const,
      icon: Clock,
      color: 'amber',
    },
    {
      id: 'resolved',
      label: 'Résolus ce mois',
      value: 52,
      change: '+8',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'emerald',
    },
  ];

  const categoryStats = [
    { id: 'budget', name: 'Budgétaire', count: 28, icon: Target, color: 'amber' },
    { id: 'ressources', name: 'Ressources', count: 24, icon: Users, color: 'blue' },
    { id: 'planning', name: 'Planning', count: 19, icon: Calendar, color: 'emerald' },
    { id: 'technique', name: 'Technique', count: 12, icon: Workflow, color: 'purple' },
  ];

  const bureauStats = [
    { bureau: 'DAF', count: 32 },
    { bureau: 'DRH', count: 21 },
    { bureau: 'DSI', count: 18 },
    { bureau: 'Direction', count: 18 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up' && metric.id !== 'critical';
          const colorClasses = {
            slate: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
            red: 'bg-red-500/10 text-red-400 border-red-500/30',
            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          };

          return (
            <div
              key={metric.id}
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
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
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

      {/* Categories Section */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Par catégorie d'arbitrage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800')}>
                    <Icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{cat.name}</p>
                    <p className="text-xs text-slate-400">Arbitrages</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-200">{cat.count}</span>
                  <Badge variant="outline" className="bg-slate-800/50 text-slate-400 border-slate-700">
                    Actif
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bureaux Section */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Par bureau source
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {bureauStats.map((b) => (
            <div
              key={b.bureau}
              className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30 hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <p className="text-sm text-slate-400 mb-1">{b.bureau}</p>
              <p className="text-2xl font-bold text-slate-200">{b.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/30">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Analytics & Tendances</h3>
        <ArbitragesAnalyticsCharts />
      </div>

      {/* Bloc gouvernance */}
      <div className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Gavel className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-purple-300 mb-2">
              Gouvernance des Arbitrages
            </h3>
            <p className="text-sm text-slate-300">
              Chaque décision est tracée avec motifs, parties prenantes et impacts. 
              Escalade automatique vers la DG selon les seuils définis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// ================================
// Critical Arbitrages View
// ================================
const CriticalArbitragesView = React.memo(function CriticalArbitragesView() {
  const criticalItems = [
    {
      id: 'ARB-001',
      title: 'Dépassement budget lot 4',
      category: 'Budgétaire',
      priority: 'critical',
      deadline: '2h',
      bureau: 'DAF',
    },
    {
      id: 'ARB-002',
      title: 'Conflit ressources projet X',
      category: 'Ressources',
      priority: 'critical',
      deadline: '4h',
      bureau: 'DRH',
    },
    {
      id: 'ARB-003',
      title: 'Retard planning infrastructure',
      category: 'Planning',
      priority: 'critical',
      deadline: '6h',
      bureau: 'DSI',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Arbitrages Critiques</h2>
          <p className="text-sm text-slate-400 mt-1">Décisions urgentes requises</p>
        </div>
        <Badge variant="destructive" className="text-sm">
          {criticalItems.length} critiques
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {criticalItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{item.id}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.bureau}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="text-xs mb-2">
                  Urgent
                </Badge>
                <p className="text-xs text-red-400 font-medium">
                  Échéance: {item.deadline}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ================================
// Pending Arbitrages View
// ================================
const PendingArbitragesView = React.memo(function PendingArbitragesView() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Arbitrages en attente
        </h3>
        <p className="text-slate-400">23 arbitrages en attente de traitement</p>
      </div>
    </div>
  );
});

// ================================
// Resolved Arbitrages View
// ================================
const ResolvedArbitragesView = React.memo(function ResolvedArbitragesView() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Arbitrages résolus
        </h3>
        <p className="text-slate-400">52 arbitrages résolus ce mois</p>
      </div>
    </div>
  );
});

// ================================
// Category View
// ================================
const CategoryView = React.memo(function CategoryView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Workflow className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Vue par catégorie
        </h3>
        <p className="text-slate-400">
          {subCategory ? `Filtré par: ${subCategory}` : 'Toutes les catégories'}
        </p>
      </div>
    </div>
  );
});

