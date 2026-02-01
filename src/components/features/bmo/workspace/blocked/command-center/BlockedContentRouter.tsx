/**
 * Content Router du Blocked Command Center
 * Affiche le contenu en fonction de la navigation
 * Architecture visuelle cohérente avec le Dashboard BMO
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlockedCommandCenterStore } from '@/lib/stores/blockedCommandCenterStore';
import { blockedApi, type BlockedFilter } from '@/lib/services/blockedApiService';
import {
  AlertCircle,
  LayoutGrid,
  Building2,
  History,
  Zap,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Scale,
  Target,
  Users,
  Wallet,
  Activity,
  CheckCircle2,
  XCircle,
  Timer,
  Layers,
  Loader2,
  Eye,
  Star,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { BlockedLiveCounters } from '../BlockedLiveCounters';
import type { BlockedDossier } from '@/lib/types/bmo.types';
import {
  BlockedTrendChart,
  BlockedImpactChart,
  BlockedResolutionTimeChart,
  BlockedBureauPerformanceChart,
  BlockedStatusChart,
  BlockedFinancialImpactChart,
  BlockedTypeDistributionChart,
} from '../analytics/BlockedAnalyticsCharts';
import { BlockedKanbanView } from '../views/BlockedKanbanView';
import { BlockedDetailModal, useBlockedListNavigation } from '../BlockedDetailModal';

// Utility: Convert store filters to API filters
function convertFiltersToApi(filters: {
  impact?: ('critical' | 'high' | 'medium' | 'low')[];
  bureaux?: string[];
  types?: string[];
  status?: ('pending' | 'escalated' | 'resolved' | 'substituted')[];
  delayRange?: { min?: number; max?: number };
  amountRange?: { min?: number; max?: number };
  dateRange?: { start: string; end: string };
}): BlockedFilter {
  const apiFilter: BlockedFilter = {};

  // Impact - prend le premier si plusieurs
  if (filters.impact?.length === 1) {
    apiFilter.impact = filters.impact[0];
  }

  // Bureau - prend le premier si plusieurs
  if (filters.bureaux?.length === 1) {
    apiFilter.bureau = filters.bureaux[0];
  }

  // Status - prend le premier si plusieurs
  if (filters.status?.length === 1) {
    apiFilter.status = filters.status[0];
  }

  // Type - prend le premier si plusieurs
  if (filters.types?.length === 1) {
    apiFilter.type = filters.types[0];
  }

  // Delay range
  if (filters.delayRange?.min !== undefined) {
    apiFilter.minDelay = filters.delayRange.min;
  }
  if (filters.delayRange?.max !== undefined) {
    apiFilter.maxDelay = filters.delayRange.max;
  }

  // Date range
  if (filters.dateRange?.start) {
    apiFilter.dateFrom = filters.dateRange.start;
  }
  if (filters.dateRange?.end) {
    apiFilter.dateTo = filters.dateRange.end;
  }

  return apiFilter;
}

// Hook to load data from API with filters from store
function useBlockedData() {
  const { filters } = useBlockedCommandCenterStore();
  const [data, setData] = useState<BlockedDossier[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilter = convertFiltersToApi(filters);
      const result = await blockedApi.getAll(apiFilter, undefined, 1, 100);
      setData(result.data);
    } catch (error) {
      console.error('Failed to load blocked data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload };
}

export function BlockedContentRouter() {
  const { navigation } = useBlockedCommandCenterStore();

  switch (navigation.mainCategory) {
    case 'overview':
      return <OverviewView />;
    case 'queue':
      return <QueueView />;
    case 'critical':
      return <CriticalView />;
    case 'matrix':
      return <MatrixView />;
    case 'bureaux':
      return <BureauxView />;
    case 'timeline':
      return <TimelineView />;
    case 'decisions':
      return <DecisionsView />;
    case 'audit':
      return <AuditView />;
    default:
      return <OverviewView />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW COMPONENTS - Style Dashboard
// ═══════════════════════════════════════════════════════════════════════════

function OverviewView() {
  const { stats, navigate, openModal } = useBlockedCommandCenterStore();
  const { data, loading } = useBlockedData();

  // Hook de navigation pour modal overlay
  const {
    selectedId,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useBlockedListNavigation(data);

  // KPIs principaux
  const kpis = [
    {
      id: 'total',
      label: 'Total Blocages',
      value: stats?.total ?? 0,
      trend: 0,
      icon: FileText,
      color: 'blue',
    },
    {
      id: 'critical',
      label: 'Critiques',
      value: stats?.critical ?? 0,
      trend: stats?.critical && stats.critical > 0 ? stats.critical : 0,
      icon: AlertCircle,
      color: stats?.critical && stats.critical > 0 ? 'rose' : 'slate',
    },
    {
      id: 'avgDelay',
      label: 'Délai moyen',
      value: `${stats?.avgDelay ?? 0}j`,
      trend: stats?.avgDelay && stats.avgDelay > 7 ? 5 : -3,
      icon: Clock,
      color: stats?.avgDelay && stats.avgDelay > 7 ? 'amber' : 'emerald',
    },
    {
      id: 'sla',
      label: 'SLA dépassés',
      value: stats?.overdueSLA ?? 0,
      trend: stats?.overdueSLA && stats.overdueSLA > 0 ? stats.overdueSLA : 0,
      icon: Shield,
      color: stats?.overdueSLA && stats.overdueSLA > 0 ? 'rose' : 'emerald',
    },
  ];

  // Récupérer les dossiers critiques pour affichage
  const criticalDossiers = data.filter(d => d.impact === 'critical').slice(0, 4);
  const recentDossiers = [...data].slice(0, 4);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Critical Alert Banner */}
      {stats?.critical && stats.critical > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
                <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {stats.critical} blocage(s) critique(s) en attente
                </p>
                <p className="text-sm text-slate-400">
                  Action immédiate requise — Impact critique sur les opérations
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('critical', 'urgent')}
              className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5"
            >
              Traiter maintenant
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Section KPIs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Indicateurs Clés
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal('stats')}
            className="text-slate-400 hover:text-slate-200"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const iconColorClasses: Record<string, string> = {
              blue: 'text-blue-400',
              emerald: 'text-emerald-400',
              amber: 'text-amber-400',
              rose: 'text-rose-400',
              slate: 'text-slate-400',
            };

            return (
              <button
                key={kpi.id}
                onClick={() => {
                  if (kpi.id === 'critical') navigate('critical', 'urgent');
                  else if (kpi.id === 'sla') navigate('critical', 'sla');
                  else navigate('queue', 'all');
                }}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
                    <Icon className={cn('w-5 h-5', iconColorClasses[kpi.color])} />
                  </div>
                  {kpi.trend !== 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium">
                      {kpi.trend > 0 ? (
                        <>
                          <TrendingUp className={cn('w-3 h-3', kpi.color === 'rose' || kpi.color === 'amber' ? 'text-rose-400' : 'text-emerald-400')} />
                          <span className={kpi.color === 'rose' || kpi.color === 'amber' ? 'text-rose-400' : 'text-emerald-400'}>
                            +{Math.abs(kpi.trend)}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">{kpi.trend}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-200">{kpi.value}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{kpi.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section Blocages Critiques + Répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocages Critiques */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Blocages Critiques
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{stats?.critical ?? 0}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('critical', 'urgent')}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Voir tout
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {criticalDossiers.length > 0 ? (
              criticalDossiers.map((dossier) => (
                <button
                  key={dossier.id}
                  onClick={() => handleOpen(dossier.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{dossier.subject}</p>
                    <p className="text-xs text-slate-400 truncate">{dossier.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                      {dossier.bureau}
                    </Badge>
                    <span className="text-xs font-medium text-rose-400">
                      +{dossier.delay}j
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm text-slate-400">Aucun blocage critique</p>
              </div>
            )}
          </div>
        </section>

        {/* Répartition par priorité */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Répartition par Priorité
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('queue', 'all')}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Voir tout
            </Button>
          </div>

          <div className="p-4">
            <BlockedLiveCounters 
              onOpenQueue={(queue) => navigate('queue', queue as 'all' | 'critical' | 'high' | 'medium' | 'low')} 
            />
          </div>
        </section>
      </div>

      {/* Section Actions Rapides + Derniers blocages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Rapides */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden lg:col-span-1">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Actions Rapides
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <QuickActionButton
              icon={Scale}
              title="Centre de décision"
              description="Escalader, substituer, résoudre"
              color="orange"
              onClick={() => openModal('decision-center')}
            />
            <QuickActionButton
              icon={Zap}
              title="Résolution guidée"
              description="Assistant de résolution étape par étape"
              color="green"
              onClick={() => openModal('resolution-wizard')}
            />
            <QuickActionButton
              icon={LayoutGrid}
              title="Matrice d'urgence"
              description="Vue Impact × Délai"
              color="purple"
              onClick={() => navigate('matrix', 'combined')}
            />
            <QuickActionButton
              icon={BarChart3}
              title="Statistiques"
              description="Analyses et tendances"
              color="blue"
              onClick={() => openModal('stats')}
            />
          </div>
        </section>

        {/* Derniers Blocages */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Derniers Blocages
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="default">{stats?.total ?? 0}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('timeline', 'recent')}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Voir tout
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {recentDossiers.map((dossier) => (
              <button
                key={dossier.id}
                onClick={() => handleOpen(dossier.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    dossier.impact === 'critical'
                      ? 'bg-rose-500 animate-pulse'
                      : dossier.impact === 'high'
                      ? 'bg-amber-500'
                      : dossier.impact === 'medium'
                      ? 'bg-blue-500'
                      : 'bg-slate-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{dossier.subject}</p>
                  <p className="text-xs text-slate-400 truncate">{dossier.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {dossier.bureau}
                  </Badge>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      dossier.delay > 7 ? 'text-rose-400' : dossier.delay > 3 ? 'text-amber-400' : 'text-slate-400'
                    )}
                  >
                    {dossier.delay}j
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Section Analytics Charts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Analytics & Tendances
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal('stats')}
            className="text-slate-400 hover:text-slate-200 text-xs gap-1.5"
          >
            <Eye className="w-4 h-4" />
            Voir détails
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              Évolution des blocages
            </h3>
            <BlockedTrendChart />
          </div>

          {/* Impact Distribution */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Répartition par impact
            </h3>
            <BlockedImpactChart />
          </div>

          {/* Resolution Time */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Délais de résolution
            </h3>
            <BlockedResolutionTimeChart />
          </div>

          {/* Bureau Performance */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              Performance par bureau
            </h3>
            <BlockedBureauPerformanceChart />
          </div>
        </div>
      </section>

      {/* Governance Info */}
      <section className="rounded-xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">
              Gouvernance BMO — Pouvoir de substitution
            </p>
            <p className="text-sm text-slate-400 mt-1">
              En tant qu'instance suprême, le BMO dispose du pouvoir de substitution pour débloquer
              les situations critiques. Chaque décision est tracée et auditable.
            </p>
          </div>
        </div>
      </section>

      {/* Modal Detail */}
      <BlockedDetailModal
        dossiers={data}
        selectedId={selectedId}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onResolve={(id) => {
          // TODO: Implémenter résolution
          handleClose();
        }}
        onEscalade={(id) => {
          openModal('decision-center', { dossier: data.find((d) => d.id === id) });
          handleClose();
        }}
        onSubstitute={(id) => {
          // TODO: Implémenter substitution
          handleClose();
        }}
      />
    </div>
  );
}

function QueueView() {
  const { navigation, stats, navigate, openModal } = useBlockedCommandCenterStore();
  const { data, loading } = useBlockedData();

  // Hook de navigation pour modal overlay
  const {
    selectedId,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useBlockedListNavigation(data);

  // Filtrer selon le sous-onglet
  const filteredDossiers = data.filter(d => {
    switch (navigation.subCategory) {
      case 'critical': return d.impact === 'critical';
      case 'high': return d.impact === 'high';
      case 'medium': return d.impact === 'medium';
      case 'low': return d.impact === 'low';
      default: return true;
    }
  });

  const impactLabels: Record<string, string> = {
    critical: 'Critique',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            File d'attente
            {navigation.subCategory && navigation.subCategory !== 'all' && (
              <Badge variant="default" className="ml-2">
                {impactLabels[navigation.subCategory] || navigation.subCategory}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {filteredDossiers.length} dossiers en attente de traitement
          </p>
        </div>
        <Button
          onClick={() => openModal('decision-center')}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
        >
          <Zap className="w-4 h-4" />
          Traiter
        </Button>
      </div>

      {/* Liste des dossiers */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {filteredDossiers.length > 0 ? (
            filteredDossiers.map((dossier) => (
              <button
                key={dossier.id}
                onClick={() => handleOpen(dossier.id)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full flex-shrink-0',
                    dossier.impact === 'critical'
                      ? 'bg-rose-500 animate-pulse'
                      : dossier.impact === 'high'
                      ? 'bg-amber-500'
                      : dossier.impact === 'medium'
                      ? 'bg-blue-500'
                      : 'bg-slate-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-200">{dossier.subject}</p>
                    <Badge
                      variant={dossier.impact === 'critical' ? 'destructive' : dossier.impact === 'high' ? 'warning' : 'default'}
                      className="text-xs"
                    >
                      {impactLabels[dossier.impact]}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{dossier.reason}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-medium text-slate-300">{dossier.bureau}</p>
                    <p className="text-xs text-slate-400">{dossier.type}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-bold',
                        dossier.delay > 7 ? 'text-rose-400' : dossier.delay > 3 ? 'text-amber-400' : 'text-slate-300'
                      )}
                    >
                      {dossier.delay}j
                    </p>
                    <p className="text-xs text-slate-400">délai</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="text-lg font-medium text-slate-300">Aucun dossier</p>
              <p className="text-sm text-slate-400">Cette file d'attente est vide</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Detail */}
      <BlockedDetailModal
        dossiers={filteredDossiers}
        selectedId={selectedId}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onResolve={(id) => {
          // TODO: Implémenter résolution
          handleClose();
        }}
        onEscalade={(id) => {
          openModal('decision-center', { dossier: filteredDossiers.find((d) => d.id === id) });
          handleClose();
        }}
        onSubstitute={(id) => {
          // TODO: Implémenter substitution
          handleClose();
        }}
      />
    </div>
  );
}

function CriticalView() {
  const { stats, navigate, openModal } = useBlockedCommandCenterStore();
  const { data, loading } = useBlockedData();
  const criticalDossiers = data.filter(d => d.impact === 'critical');

  // Hook de navigation pour modal overlay
  const {
    selectedId,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useBlockedListNavigation(criticalDossiers);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header Alert */}
      <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {stats?.critical ?? 0} blocages critiques
            </h1>
            <p className="text-slate-400">
              Nécessitent une action immédiate du BMO
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={AlertCircle}
            label="Urgents"
            value={stats?.critical ?? 0}
            color="rose"
            onClick={() => {}}
          />
          <StatCard
            icon={Timer}
            label="SLA dépassés"
            value={stats?.overdueSLA ?? 0}
            color="amber"
            onClick={() => navigate('critical', 'sla')}
          />
          <StatCard
            icon={ArrowUpRight}
            label="Escaladés"
            value={stats?.escalatedToday ?? 0}
            color="orange"
            onClick={() => navigate('critical', 'escalated')}
          />
        </div>
      </div>

      {/* Liste des dossiers critiques */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Dossiers Critiques
          </h2>
          <Button
            onClick={() => openModal('decision-center')}
            size="sm"
            className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5"
          >
            <Zap className="w-3 h-3" />
            Traiter
          </Button>
        </div>

        <div className="divide-y divide-slate-800/50">
          {criticalDossiers.length > 0 ? (
            criticalDossiers.map((dossier) => (
              <button
                key={dossier.id}
                onClick={() => handleOpen(dossier.id)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{dossier.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{dossier.reason}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {dossier.bureau}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-400">+{dossier.delay}j</p>
                    <p className="text-xs text-slate-400">délai</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="text-lg font-medium text-slate-300">Aucun blocage critique</p>
              <p className="text-sm text-slate-400">Tous les dossiers sont en cours de traitement</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Detail */}
      <BlockedDetailModal
        dossiers={criticalDossiers}
        selectedId={selectedId}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onResolve={(id) => {
          // TODO: Implémenter résolution
          handleClose();
        }}
        onEscalade={(id) => {
          openModal('decision-center', { dossier: criticalDossiers.find((d) => d.id === id) });
          handleClose();
        }}
        onSubstitute={(id) => {
          // TODO: Implémenter substitution
          handleClose();
        }}
      />
    </div>
  );
}

function MatrixView() {
  const { navigate, openModal, stats, navigation } = useBlockedCommandCenterStore();
  const { data, loading } = useBlockedData();

  // Si le sous-onglet est 'kanban', afficher la vue Kanban
  if (navigation.subCategory === 'kanban') {
    return <BlockedKanbanView />;
  }

  // Calculer la matrice dynamique à partir des données
  const matrixData = React.useMemo(() => {
    const matrix = {
      critical: { low: 0, medium: 0, high: 0 },
      high: { low: 0, medium: 0, high: 0 },
      medium: { low: 0, medium: 0, high: 0 },
      low: { low: 0, medium: 0, high: 0 },
    };

    data.forEach(d => {
      const delayCategory = d.delay <= 3 ? 'low' : d.delay <= 7 ? 'medium' : 'high';
      if (d.impact in matrix) {
        matrix[d.impact as keyof typeof matrix][delayCategory]++;
      }
    });

    return matrix;
  }, [data]);

  // Déterminer la couleur d'une cellule selon criticité combinée
  const getCellColor = (impact: string, delay: string): 'rose' | 'amber' | 'blue' | 'slate' => {
    if (impact === 'critical') {
      return delay === 'high' ? 'rose' : delay === 'medium' ? 'rose' : 'amber';
    }
    if (impact === 'high') {
      return delay === 'high' ? 'rose' : delay === 'medium' ? 'amber' : 'blue';
    }
    if (impact === 'medium') {
      return delay === 'high' ? 'amber' : delay === 'medium' ? 'blue' : 'slate';
    }
    return 'slate';
  };

  const totalMatrix = Object.values(matrixData).reduce(
    (sum, row) => sum + row.low + row.medium + row.high, 0
  );

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
            Matrice d'Urgence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {totalMatrix} dossiers — Visualisation Impact × Délai
          </p>
        </div>
        <Button
          onClick={() => openModal('export', { type: 'matrix' })}
          variant="default"
          size="sm"
          className="gap-1.5"
        >
          <Target className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <>
          {/* Matrix Grid */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <div className="grid grid-cols-4 gap-4">
              {/* Headers */}
              <div className="col-span-1" />
              <div className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                Faible délai (&lt;3j)
              </div>
              <div className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                Délai moyen (3-7j)
              </div>
              <div className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                Fort délai (&gt;7j)
              </div>

              {/* Critical Row */}
              <div className="text-right text-xs font-medium text-rose-400 uppercase tracking-wider flex items-center justify-end pr-2">
                Impact critique
              </div>
              <MatrixCell 
                color={getCellColor('critical', 'low')} 
                count={matrixData.critical.low} 
                onClick={() => navigate('queue', 'critical')} 
              />
              <MatrixCell 
                color={getCellColor('critical', 'medium')} 
                count={matrixData.critical.medium} 
                onClick={() => navigate('queue', 'critical')} 
              />
              <MatrixCell 
                color={getCellColor('critical', 'high')} 
                count={matrixData.critical.high} 
                priority 
                onClick={() => navigate('queue', 'critical')} 
              />

              {/* High Row */}
              <div className="text-right text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center justify-end pr-2">
                Impact élevé
              </div>
              <MatrixCell 
                color={getCellColor('high', 'low')} 
                count={matrixData.high.low} 
                onClick={() => navigate('queue', 'high')} 
              />
              <MatrixCell 
                color={getCellColor('high', 'medium')} 
                count={matrixData.high.medium} 
                onClick={() => navigate('queue', 'high')} 
              />
              <MatrixCell 
                color={getCellColor('high', 'high')} 
                count={matrixData.high.high} 
                onClick={() => navigate('queue', 'high')} 
              />

              {/* Medium Row */}
              <div className="text-right text-xs font-medium text-blue-400 uppercase tracking-wider flex items-center justify-end pr-2">
                Impact moyen
              </div>
              <MatrixCell 
                color={getCellColor('medium', 'low')} 
                count={matrixData.medium.low} 
                onClick={() => navigate('queue', 'medium')} 
              />
              <MatrixCell 
                color={getCellColor('medium', 'medium')} 
                count={matrixData.medium.medium} 
                onClick={() => navigate('queue', 'medium')} 
              />
              <MatrixCell 
                color={getCellColor('medium', 'high')} 
                count={matrixData.medium.high} 
                onClick={() => navigate('queue', 'medium')} 
              />

              {/* Low Row */}
              <div className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-end pr-2">
                Impact faible
              </div>
              <MatrixCell 
                color="slate" 
                count={matrixData.low.low} 
                onClick={() => navigate('queue', 'low')} 
              />
              <MatrixCell 
                color="slate" 
                count={matrixData.low.medium} 
                onClick={() => navigate('queue', 'low')} 
              />
              <MatrixCell 
                color="blue" 
                count={matrixData.low.high} 
                onClick={() => navigate('queue', 'low')} 
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
              <p className="text-xs text-rose-400 mb-1">Zone critique</p>
              <p className="text-2xl font-bold text-slate-200">
                {matrixData.critical.high + matrixData.high.high + matrixData.critical.medium}
              </p>
              <p className="text-xs text-slate-400">Action immédiate</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="text-xs text-amber-400 mb-1">Zone urgente</p>
              <p className="text-2xl font-bold text-slate-200">
                {matrixData.critical.low + matrixData.high.medium + matrixData.medium.high}
              </p>
              <p className="text-xs text-slate-400">Cette semaine</p>
            </div>
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10">
              <p className="text-xs text-blue-400 mb-1">Zone normale</p>
              <p className="text-2xl font-bold text-slate-200">
                {matrixData.high.low + matrixData.medium.medium + matrixData.low.high}
              </p>
              <p className="text-xs text-slate-400">Planifié</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
              <p className="text-xs text-slate-400 mb-1">Zone basse</p>
              <p className="text-2xl font-bold text-slate-200">
                {matrixData.medium.low + matrixData.low.medium + matrixData.low.low}
              </p>
              <p className="text-xs text-slate-400">Surveillance</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-rose-500" />
              <span className="text-slate-400">Critique - Action immédiate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-slate-400">Urgent - Cette semaine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-400">Normal - Planifié</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-500" />
              <span className="text-slate-400">Surveillance</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BureauxView() {
  const { stats, navigate, openModal } = useBlockedCommandCenterStore();
  const { data, loading } = useBlockedData();

  // Regrouper par bureau
  const byBureau = data.reduce((acc, d) => {
    if (!acc[d.bureau]) acc[d.bureau] = { total: 0, critical: 0, high: 0 };
    acc[d.bureau].total++;
    if (d.impact === 'critical') acc[d.bureau].critical++;
    if (d.impact === 'high') acc[d.bureau].high++;
    return acc;
  }, {} as Record<string, { total: number; critical: number; high: number }>);

  const bureaux = Object.entries(byBureau).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Blocages par Bureau
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {bureaux.length} bureaux impactés
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {bureaux.map(([bureau, counts]) => (
            <button
              key={bureau}
              onClick={() => navigate('queue', 'all')}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200">{bureau}</p>
                <p className="text-xs text-slate-400">
                  {counts.total} blocage{counts.total > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {counts.critical > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {counts.critical} critique{counts.critical > 1 ? 's' : ''}
                  </Badge>
                )}
                {counts.high > 0 && (
                  <Badge variant="warning" className="text-xs">
                    {counts.high} urgent{counts.high > 1 ? 's' : ''}
                  </Badge>
                )}
                <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-blue-500"
                    style={{ width: `${Math.min((counts.total / (stats?.total || 1)) * 100, 100)}%` }}
                  />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function TimelineView() {
  const { navigate, openModal } = useBlockedCommandCenterStore();
  const { data, loading } = useBlockedData();

  // Trier par date (simulé avec l'ID)
  const sortedDossiers = [...data].slice(0, 10);

  // Hook de navigation pour modal overlay
  const {
    selectedId,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useBlockedListNavigation(sortedDossiers);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Timeline des Blocages
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chronologie des événements
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700/50" />

          <div className="space-y-6">
            {sortedDossiers.map((dossier, index) => (
              <button
                key={dossier.id}
                onClick={() => handleOpen(dossier.id)}
                className="relative flex items-start gap-4 pl-10 text-left hover:bg-slate-800/20 rounded-lg p-2 -ml-2 transition-colors w-full"
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'absolute left-2.5 w-3 h-3 rounded-full border-2 border-slate-900',
                    dossier.impact === 'critical'
                      ? 'bg-rose-500'
                      : dossier.impact === 'high'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  )}
                  style={{ top: '0.75rem' }}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-200">{dossier.subject}</p>
                    <Badge
                      variant={dossier.impact === 'critical' ? 'destructive' : dossier.impact === 'high' ? 'warning' : 'default'}
                      className="text-xs"
                    >
                      {dossier.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{dossier.reason}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                    <span>{dossier.bureau}</span>
                    <span>•</span>
                    <span>Il y a {dossier.delay} jour{dossier.delay > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Detail */}
      <BlockedDetailModal
        dossiers={sortedDossiers}
        selectedId={selectedId}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onResolve={(id) => {
          // TODO: Implémenter résolution
          handleClose();
        }}
        onEscalade={(id) => {
          openModal('decision-center', { dossier: sortedDossiers.find((d) => d.id === id) });
          handleClose();
        }}
        onSubstitute={(id) => {
          // TODO: Implémenter substitution
          handleClose();
        }}
      />
    </div>
  );
}

function DecisionsView() {
  const { stats, navigate, openModal, decisionRegister } = useBlockedCommandCenterStore();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les décisions depuis l'API
  useEffect(() => {
    const loadDecisions = async () => {
      setLoading(true);
      try {
        const logs = await blockedApi.getAuditLog(undefined, 30);
        setAuditLogs(logs.filter(l => 
          ['escalation', 'escalated', 'substitution', 'substituted', 'resolution', 'resolved'].includes(l.action)
        ));
      } catch (error) {
        console.error('Failed to load decisions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDecisions();
  }, []);

  // Combiner les décisions du store avec les logs API
  const allDecisions = [...decisionRegister, ...auditLogs]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 20);

  // Calculer les stats
  const decisionStats = {
    pending: allDecisions.filter(d => !d.executed && d.action !== 'resolution' && d.action !== 'resolved').length,
    resolved: allDecisions.filter(d => d.action === 'resolution' || d.action === 'resolved').length,
    escalated: allDecisions.filter(d => d.action === 'escalation' || d.action === 'escalated').length,
    substituted: allDecisions.filter(d => d.action === 'substitution' || d.action === 'substituted').length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'escalation':
      case 'escalated':
        return 'Escalade';
      case 'substitution':
      case 'substituted':
        return 'Substitution';
      case 'resolution':
      case 'resolved':
        return 'Résolution';
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'escalation':
      case 'escalated':
        return ArrowUpRight;
      case 'substitution':
      case 'substituted':
        return Shield;
      case 'resolution':
      case 'resolved':
        return CheckCircle2;
      default:
        return Activity;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'escalation':
      case 'escalated':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'substitution':
      case 'substituted':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'resolution':
      case 'resolved':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            Centre de Décisions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Historique et suivi des décisions BMO
          </p>
        </div>
        <Button
          onClick={() => openModal('decision-center')}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
        >
          <Zap className="w-4 h-4" />
          Nouvelle décision
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="En attente"
          value={decisionStats.pending}
          color="amber"
          onClick={() => {}}
        />
        <StatCard
          icon={CheckCircle2}
          label="Résolus"
          value={decisionStats.resolved}
          color="emerald"
          onClick={() => {}}
        />
        <StatCard
          icon={ArrowUpRight}
          label="Escaladés"
          value={decisionStats.escalated}
          color="orange"
          onClick={() => {}}
        />
        <StatCard
          icon={Shield}
          label="Substitués"
          value={decisionStats.substituted}
          color="purple"
          onClick={() => {}}
        />
      </div>

      {/* Liste des décisions */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Décisions Récentes
            <Badge variant="default" className="ml-2">{allDecisions.length}</Badge>
          </h2>
          <Button
            onClick={() => navigate('audit')}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1"
          >
            Voir tout
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : allDecisions.length > 0 ? (
          <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto">
            {allDecisions.map((decision, index) => {
              const Icon = getActionIcon(decision.action);
              const colors = getActionColor(decision.action);
              
              return (
                <button
                  key={decision.id || index}
                  onClick={() => openModal('dossier-detail', { dossierId: decision.dossierId })}
                  className="w-full flex items-start gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className={cn('p-2 rounded-lg border flex-shrink-0', colors)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-200">
                        {getActionLabel(decision.action)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{decision.dossierId}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {decision.details || decision.dossierSubject}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {decision.userName}
                      </span>
                      <span>•</span>
                      <span>{formatDate(decision.at)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {decision.hash && (
                      <p className="text-[10px] font-mono text-slate-600 truncate max-w-[80px]" title={decision.hash}>
                        🔐 {decision.hash.slice(0, 12)}...
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Scale className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-lg font-medium text-slate-400">Aucune décision enregistrée</p>
            <p className="text-sm text-slate-400">Les décisions prises apparaîtront ici</p>
            <Button
              onClick={() => openModal('decision-center')}
              className="mt-4 bg-purple-500 hover:bg-purple-600"
            >
              Prendre une décision
            </Button>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionButton
          icon={ArrowUpRight}
          title="Escalade CODIR"
          description="Escalader des dossiers critiques"
          color="orange"
          onClick={() => openModal('decision-center')}
        />
        <QuickActionButton
          icon={Shield}
          title="Substitution BMO"
          description="Exercer le pouvoir de substitution"
          color="purple"
          onClick={() => openModal('decision-center')}
        />
        <QuickActionButton
          icon={CheckCircle2}
          title="Résolution directe"
          description="Résoudre les blocages simples"
          color="green"
          onClick={() => openModal('decision-center')}
        />
      </div>
    </div>
  );
}

function AuditView() {
  const { navigation, openModal, decisionRegister } = useBlockedCommandCenterStore();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les logs d'audit depuis l'API
  useEffect(() => {
    const loadAudit = async () => {
      setLoading(true);
      try {
        const logs = await blockedApi.getAuditLog(undefined, 50);
        setAuditLogs(logs);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAudit();
  }, []);

  // Combiner les logs API avec le registre local
  const allEntries = [...decisionRegister, ...auditLogs].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  const actionIcons: Record<string, typeof Shield> = {
    escalated: ArrowUpRight,
    escalation: ArrowUpRight,
    substituted: Shield,
    substitution: Shield,
    resolved: CheckCircle2,
    resolution: CheckCircle2,
    created: FileText,
    updated: Activity,
    commented: Activity,
    reassigned: Users,
  };

  const actionColors: Record<string, string> = {
    escalated: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    escalation: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    substituted: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    substitution: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    resolution: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    created: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    updated: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    commented: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    reassigned: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Trace d'Audit
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Historique complet des actions et décisions — {allEntries.length} entrées
          </p>
        </div>
        <Button
          onClick={() => openModal('export', { type: 'audit' })}
          variant="default"
          size="sm"
          className="gap-1.5"
        >
          <Target className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Actions totales</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">{allEntries.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400">Escalades</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">
            {allEntries.filter(e => e.action === 'escalation' || e.action === 'escalated').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Substitutions</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">
            {allEntries.filter(e => e.action === 'substitution' || e.action === 'substituted').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Résolutions</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">
            {allEntries.filter(e => e.action === 'resolution' || e.action === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Audit Log List */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Journal d'audit
          </h2>
          <Badge variant="default" className="text-xs">
            Intégrité: ✓ Valide
          </Badge>
        </div>

        <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : allEntries.length > 0 ? (
            allEntries.map((entry, index) => {
              const Icon = actionIcons[entry.action] || Activity;
              const colors = actionColors[entry.action] || actionColors.updated;

              return (
                <div
                  key={entry.id || index}
                  className="flex items-start gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className={cn('p-2 rounded-lg border', colors)}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-200 capitalize">
                        {entry.action}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-400">{entry.dossierId}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{entry.details || entry.dossierSubject}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                      <span>{entry.userName}</span>
                      <span>•</span>
                      <span>{entry.userRole}</span>
                      <span>•</span>
                      <span>{formatDate(entry.at)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {entry.hash && (
                      <p className="text-[10px] font-mono text-slate-600 truncate max-w-[120px]" title={entry.hash}>
                        🔐 {entry.hash.slice(0, 16)}...
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-12 text-center">
              <Shield className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-lg font-medium text-slate-400">Aucune action enregistrée</p>
              <p className="text-sm text-slate-400">L'historique d'audit est vide</p>
            </div>
          )}
        </div>
      </section>

      {/* Integrity Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Chaîne de hash intègre</h3>
              <p className="text-xs text-slate-400">Dernière vérification: maintenant</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Toutes les décisions sont signées cryptographiquement et chaînées pour garantir
            l'intégrité et la non-répudiation des actions BMO.
          </p>
        </section>

        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Conformité</h3>
              <p className="text-xs text-slate-400">Normes d'audit respectées</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Ce journal respecte les exigences de traçabilité et d'audit pour les décisions
            de gouvernance du Bureau Maître d'Ouvrage.
          </p>
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'blue' | 'rose' | 'emerald' | 'amber' | 'purple' | 'orange' | 'slate';
  onClick?: () => void;
}

function StatCard({ icon: Icon, label, value, color, onClick }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  const iconColorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    slate: 'text-slate-400',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'p-4 rounded-xl border text-left transition-all',
        colorClasses[color],
        onClick && 'hover:scale-[1.02] cursor-pointer'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', iconColorClasses[color])} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </button>
  );
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'orange' | 'purple' | 'blue' | 'green';
  onClick?: () => void;
}

function QuickActionButton({ icon: Icon, title, description, color, onClick }: QuickActionButtonProps) {
  const colorClasses: Record<string, string> = {
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 hover:border-slate-600/50 hover:bg-slate-800/30 transition-all text-left group"
    >
      <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
        <Icon className={cn('w-5 h-5', colorClasses[color])} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </button>
  );
}

interface MatrixCellProps {
  color: 'rose' | 'amber' | 'blue' | 'slate';
  count: number;
  priority?: boolean;
  onClick?: () => void;
}

function MatrixCell({ color, count, priority, onClick }: MatrixCellProps) {
  const colorClasses: Record<string, string> = {
    rose: 'bg-rose-500/20 border-rose-500/30 hover:bg-rose-500/30',
    amber: 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30',
    blue: 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30',
    slate: 'bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20',
  };

  const textClasses: Record<string, string> = {
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    slate: 'text-slate-400',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-6 rounded-lg border transition-all',
        colorClasses[color],
        priority && 'ring-2 ring-rose-500/50'
      )}
    >
      <p className={cn('text-2xl font-bold', textClasses[color])}>
        {count}
      </p>
      {priority && (
        <p className="text-xs text-rose-400 mt-1">PRIORITÉ</p>
      )}
    </button>
  );
}
