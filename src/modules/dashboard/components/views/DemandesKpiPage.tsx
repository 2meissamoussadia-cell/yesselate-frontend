/**
 * Page KPIs Demandes
 * Vue détaillée des indicateurs de performance des flux internes et demandes
 */

'use client';

import React, { useCallback, memo, useMemo, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  FileText,
  Hourglass,
  Zap,
  BarChart3,
  Users,
  Building2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparklineChart } from '../shared/SparklineChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';

interface DemandeKPI {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
  sparkline?: number[];
  description?: string;
}

interface Goulet {
  id: string;
  processus: string;
  tempsMoyen: number;
  volume: number;
  impact: 'high' | 'medium' | 'low';
}

interface Blocage {
  id: string;
  type: string;
  count: number;
  priorite: 'critique' | 'haute' | 'moyenne';
  bureau: string;
}

function DemandesKpiPage() {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const [searchQuery, setSearchQuery] = useState('');

  const handleKPIClick = useCallback((kpi: DemandeKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        delta: kpi.trend,
        tone: kpi.color === 'emerald' ? 'ok' : kpi.color === 'amber' || kpi.color === 'red' ? 'warn' : 'info',
        trend: kpi.trendDirection === 'up' ? 'up' : kpi.trendDirection === 'down' ? 'down' : 'neutral',
        icon: kpi.icon,
      },
    });
  }, [openModal]);

  // KPIs principaux avec sparklines
  const demandeKPIs: DemandeKPI[] = [
    {
      id: '1',
      label: 'Volume total',
      value: 247,
      trend: '+12',
      trendDirection: 'up',
      icon: FileText,
      color: 'blue',
      sparkline: [210, 220, 225, 230, 235, 242, 247],
      description: 'Nombre total de demandes traitées',
    },
    {
      id: '2',
      label: 'Taux de validation',
      value: '89%',
      trend: '+3%',
      trendDirection: 'up',
      icon: CheckCircle,
      color: 'emerald',
      sparkline: [83, 84, 85, 86, 87, 88, 89],
      description: 'Pourcentage de demandes validées',
    },
    {
      id: '3',
      label: 'Temps moyen de traitement',
      value: '2.4j',
      trend: '-0.3j',
      trendDirection: 'down',
      icon: Clock,
      color: 'emerald',
      sparkline: [3.2, 3.0, 2.9, 2.8, 2.7, 2.6, 2.4],
      description: 'Délai moyen de traitement en jours',
    },
    {
      id: '4',
      label: 'Blocages actifs',
      value: 5,
      trend: '-2',
      trendDirection: 'down',
      icon: AlertTriangle,
      color: 'amber',
      sparkline: [9, 8, 7, 7, 6, 6, 5],
      description: 'Demandes bloquées nécessitant intervention',
    },
    {
      id: '5',
      label: 'En attente de validation',
      value: 28,
      trend: '-5',
      trendDirection: 'down',
      icon: Hourglass,
      color: 'amber',
      sparkline: [38, 36, 34, 32, 31, 29, 28],
      description: 'Demandes en attente de validation',
    },
    {
      id: '6',
      label: 'Taux de rejet',
      value: '8%',
      trend: '-1%',
      trendDirection: 'down',
      icon: XCircle,
      color: 'emerald',
      sparkline: [12, 11, 10, 10, 9, 9, 8],
      description: 'Pourcentage de demandes rejetées',
    },
  ];

  // Goulets d'étranglement
  const goulets: Goulet[] = [
    {
      id: 'g1',
      processus: 'Validation Budget',
      tempsMoyen: 4.5,
      volume: 45,
      impact: 'high',
    },
    {
      id: 'g2',
      processus: 'Validation Juridique',
      tempsMoyen: 3.2,
      volume: 32,
      impact: 'medium',
    },
    {
      id: 'g3',
      processus: 'Approbation Direction',
      tempsMoyen: 5.8,
      volume: 18,
      impact: 'high',
    },
    {
      id: 'g4',
      processus: 'Revue Technique',
      tempsMoyen: 2.1,
      volume: 56,
      impact: 'low',
    },
  ];

  // Blocages critiques
  const blocages: Blocage[] = [
    {
      id: 'b1',
      type: 'Validation manquante',
      count: 8,
      priorite: 'critique',
      bureau: 'BF',
    },
    {
      id: 'b2',
      type: 'Documentation incomplète',
      count: 5,
      priorite: 'haute',
      bureau: 'BJ',
    },
    {
      id: 'b3',
      type: 'Budget non alloué',
      count: 3,
      priorite: 'critique',
      bureau: 'BMO',
    },
    {
      id: 'b4',
      type: 'Conflit de priorités',
      count: 2,
      priorite: 'moyenne',
      bureau: 'BF',
    },
  ];

  // Filtrer les blocages selon la recherche
  const filteredBlocages = useMemo(() => {
    if (!searchQuery.trim()) return blocages;
    const query = searchQuery.toLowerCase();
    return blocages.filter(
      (b) =>
        b.type.toLowerCase().includes(query) ||
        b.bureau.toLowerCase().includes(query)
    );
  }, [searchQuery, blocages]);

  // Fonctions d'export
  const handleExportCSV = useCallback(() => {
    const headers = ['Type', 'Bureau', 'Nombre', 'Priorité'];
    const rows = filteredBlocages.map(b => [
      b.type,
      b.bureau,
      b.count.toString(),
      b.priorite,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blocages-kpis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredBlocages]);

  const handleExportJSON = useCallback(() => {
    const data = filteredBlocages.map(b => ({
      type: b.type,
      bureau: b.bureau,
      count: b.count,
      priorite: b.priorite,
    }));
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blocages-kpis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredBlocages]);

  // Distribution par type
  const distributionParType = [
    { type: 'Demandes RH', count: 89, percentage: 36, color: 'blue' },
    { type: 'Validation BC', count: 67, percentage: 27, color: 'purple' },
    { type: 'Décisions', count: 45, percentage: 18, color: 'emerald' },
    { type: 'Projets', count: 34, percentage: 14, color: 'amber' },
    { type: 'Autres', count: 12, percentage: 5, color: 'slate' },
  ];

  // Performance par bureau
  const performanceBureau = [
    { bureau: 'BMO', volume: 95, validation: 92, tempsMoyen: 2.1 },
    { bureau: 'BF', volume: 78, validation: 87, tempsMoyen: 2.8 },
    { bureau: 'BJ', volume: 74, validation: 89, tempsMoyen: 2.5 },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fadeIn min-w-0 overflow-hidden">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">KPIs Flux & Demandes</h1>
            <p className="text-slate-300 text-sm sm:text-base break-words">Suivi du volume, validation, temps moyen, goulets et blocages</p>
          </div>
          <div className="flex-shrink-0">
            <ExportButton
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              label="Exporter"
            />
          </div>
        </div>

        {/* Recherche */}
        <div className="max-w-md">
          <SearchFilter
            placeholder="Rechercher un blocage ou bureau..."
            value={searchQuery}
            onChange={setSearchQuery}
            totalCount={blocages.length}
            resultsCount={filteredBlocages.length}
          />
        </div>

        {/* KPIs principaux */}
        <section className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 break-words">
            <Activity className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <span className="min-w-0">Indicateurs clés</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
            {demandeKPIs.map((kpi) => {
              const Icon = kpi.icon;
              const isPositive = (kpi.trendDirection === 'up' && (kpi.id === '1' || kpi.id === '2')) || 
                               (kpi.trendDirection === 'down' && (kpi.id === '3' || kpi.id === '4' || kpi.id === '5' || kpi.id === '6'));
              const isNegative = !isPositive && kpi.trendDirection !== 'neutral';

              return (
                <Tooltip key={kpi.id}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleKPIClick(kpi)}
                      className={cn(
                        'rounded-xl p-5 border-2 transition-all duration-300 cursor-pointer',
                        'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                        kpi.color === 'blue' && 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/50 hover:border-blue-400',
                        kpi.color === 'emerald' && 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 hover:border-emerald-400',
                        kpi.color === 'amber' && 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/50 hover:border-amber-400',
                        kpi.color === 'red' && 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/50 hover:border-red-400',
                        kpi.color === 'purple' && 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/50 hover:border-purple-400'
                      )}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleKPIClick(kpi);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                            kpi.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                            kpi.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                            kpi.color === 'amber' && 'bg-amber-500/20 text-amber-400',
                            kpi.color === 'red' && 'bg-red-500/20 text-red-400',
                            kpi.color === 'purple' && 'bg-purple-500/20 text-purple-400'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-400 truncate">{kpi.label}</p>
                            <Info className="h-3 w-3 text-slate-500 flex-shrink-0" />
                          </div>
                          <p className="text-2xl font-bold text-white">{kpi.value}</p>
                        </div>
                      </div>

                      {/* Sparkline */}
                      {kpi.sparkline && (
                        <div className="mb-2">
                          <SparklineChart
                            data={kpi.sparkline}
                            color={kpi.color}
                            width={60}
                            height={20}
                          />
                        </div>
                      )}

                      <div
                        className={cn(
                          'flex items-center justify-between text-xs',
                          isPositive && 'text-emerald-400',
                          isNegative && 'text-red-400',
                          !isPositive && !isNegative && 'text-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-1 font-medium">
                          {kpi.trendDirection !== 'neutral' && (
                            <>
                              {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{kpi.trend}</span>
                            </>
                          )}
                        </div>
                        <span className="text-slate-400 text-[10px]">Cliquer pour détails</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{kpi.label}</p>
                      {kpi.description && (
                        <p className="text-xs text-slate-300">{kpi.description}</p>
                      )}
                      <p className="text-xs text-slate-300 pt-1 border-t border-slate-700">
                        Cliquez pour voir les détails et l'historique
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </section>

      {/* Distribution par type */}
      <section className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 break-words">
          <BarChart3 className="h-5 w-5 text-purple-400 flex-shrink-0" />
          <span className="min-w-0">Distribution par type</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 min-w-0">
          {distributionParType.map((item) => (
            <div
              key={item.type}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4"
            >
              <p className="text-xs text-slate-300 mb-2">{item.type}</p>
              <p className="text-2xl font-bold text-white mb-1">{item.count}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-300">{item.percentage}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    item.color === 'blue' && 'bg-blue-500',
                    item.color === 'purple' && 'bg-purple-500',
                    item.color === 'emerald' && 'bg-emerald-500',
                    item.color === 'amber' && 'bg-amber-500',
                    item.color === 'slate' && 'bg-slate-500'
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Goulets d'étranglement */}
      <section className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 break-words">
          <Zap className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <span className="min-w-0">Goulets d'étranglement</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
          {goulets.map((goulet) => (
            <div
              key={goulet.id}
              className={cn(
                'rounded-xl p-4 sm:p-5 border-2 min-w-0 overflow-hidden',
                goulet.impact === 'high' && 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30',
                goulet.impact === 'medium' && 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30',
                goulet.impact === 'low' && 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30'
              )}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1 break-words">{goulet.processus}</h3>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300 min-w-0">
                    <span className="break-words">{goulet.volume} demandes</span>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    goulet.impact === 'high' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                    goulet.impact === 'medium' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                    goulet.impact === 'low' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  )}
                >
                  Impact {goulet.impact === 'high' ? 'Élevé' : goulet.impact === 'medium' ? 'Moyen' : 'Faible'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-white font-medium">Temps moyen: {goulet.tempsMoyen} jours</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blocages critiques */}
      <section className="min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 break-words">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="min-w-0">Blocages actifs</span>
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
            {filteredBlocages.filter(b => b.priorite === 'critique').length > 0 && (
              <AnimatedBadge variant="critical" pulse>
                {filteredBlocages.filter(b => b.priorite === 'critique').length} critique{filteredBlocages.filter(b => b.priorite === 'critique').length > 1 ? 's' : ''}
              </AnimatedBadge>
            )}
            {searchQuery && (
              <span className="text-sm text-slate-300">
                {filteredBlocages.length} résultat{filteredBlocages.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {filteredBlocages.length === 0 ? (
          <EmptyState
            variant="search"
            title={searchQuery ? "Aucun blocage trouvé" : "Aucun blocage actif"}
            description={searchQuery ? `Aucun blocage ne correspond à "${searchQuery}"` : "Aucun blocage n'est actuellement actif"}
            action={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Effacer la recherche
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
            {filteredBlocages.map((blocage) => (
            <div
              key={blocage.id}
              className={cn(
                'rounded-xl p-5 border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer',
                'hover:shadow-lg hover:shadow-black/20',
                blocage.priorite === 'critique' && 'border-red-500/50 bg-red-500/5 hover:border-red-400',
                blocage.priorite === 'haute' && 'border-amber-500/50 bg-amber-500/5 hover:border-amber-400',
                blocage.priorite === 'moyenne' && 'border-slate-500/50 hover:border-slate-400'
              )}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-1">{blocage.type}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Building2 className="h-3 w-3" />
                    <span>{blocage.bureau}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-2xl font-bold text-white">{blocage.count}</span>
                  <AnimatedBadge
                    variant={blocage.priorite === 'critique' ? 'critical' : blocage.priorite === 'haute' ? 'warning' : 'info'}
                    pulse={blocage.priorite === 'critique'}
                  >
                    {blocage.priorite === 'critique' ? 'Critique' : blocage.priorite === 'haute' ? 'Haute' : 'Moyenne'}
                  </AnimatedBadge>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Performance par bureau */}
      <section className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 break-words">
          <Users className="h-5 w-5 text-purple-400 flex-shrink-0" />
          <span className="min-w-0">Performance par bureau</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
          {performanceBureau.map((perf) => (
            <div
              key={perf.bureau}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 min-w-0 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4 min-w-0">
                <Building2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <h3 className="text-sm sm:text-base font-semibold text-white break-words min-w-0">{perf.bureau}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300">Volume</span>
                    <span className="text-sm font-semibold text-white">{perf.volume}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300">Taux de validation</span>
                    <span className="text-sm font-semibold text-emerald-400">{perf.validation}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${perf.validation}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300">Temps moyen</span>
                    <span className="text-sm font-semibold text-white">{perf.tempsMoyen}j</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>
    </TooltipProvider>
  );
}

export default memo(DemandesKpiPage);

