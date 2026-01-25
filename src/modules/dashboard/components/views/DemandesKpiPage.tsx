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
  Building2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';

interface DemandeKPI {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
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

export const DemandesKpiPage = memo(function DemandesKpiPage() {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const [searchQuery, setSearchQuery] = useState('');

  const handleKPIClick = useCallback((kpi: DemandeKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        trend: typeof kpi.trend === 'string' ? parseFloat(kpi.trend.replace(/[^\d.-]/g, '')) || 0 : 0,
        trendType: kpi.trendDirection,
        tone: kpi.color === 'emerald' ? 'ok' : kpi.color === 'amber' || kpi.color === 'red' ? 'warn' : 'info',
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

  // Helper pour mapper les couleurs de manière sûre
  const mapColorToKPICardColor = useCallback((color: DemandeKPI['color']): KPICardData['color'] => {
    switch (color) {
      case 'red':
        return 'rose';
      case 'blue':
      case 'emerald':
      case 'amber':
      case 'purple':
        return color;
      default:
        return 'blue';
    }
  }, []);

  // Convertir demandeKPIs au format KPICardData
  const demandeKPIsData: KPICardData[] = useMemo(() => {
    return demandeKPIs.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      trend: typeof kpi.trend === 'string' ? parseFloat(kpi.trend.replace(/[^\d.-]/g, '')) || 0 : 0,
      trendType: kpi.trendDirection,
      icon: kpi.icon,
      color: mapColorToKPICardColor(kpi.color),
      description: kpi.description,
      sparkline: kpi.sparkline,
      onClick: () => handleKPIClick(kpi),
    }));
  }, [demandeKPIs, handleKPIClick, mapColorToKPICardColor]);

  return (
    <TooltipProvider delayDuration={200}>
      <DashboardPageLayout maxWidth="xl" padding="md">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
              KPIs Flux & Demandes
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Suivi du volume, validation, temps moyen, goulets et blocages
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-full sm:w-[360px]">
              <SearchFilter
                placeholder="Rechercher un blocage ou bureau..."
                value={searchQuery}
                onChange={setSearchQuery}
                totalCount={blocages.length}
                resultsCount={filteredBlocages.length}
              />
            </div>
            <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
          </div>
        </div>

        {/* KPIs principaux */}
        <DashboardSection
          title="Indicateurs clés"
          icon={Activity}
        >
          <DashboardGrid columns={3} gap="md">
            {demandeKPIsData.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} size="md" />
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Distribution par type */}
        <DashboardSection
          title="Distribution par type"
          icon={BarChart3}
        >
          <DashboardGrid columns={5} gap="md">
            {distributionParType.map((item) => (
              <DashboardPanel key={item.type} padding="md">
                <p className="text-slate-300 text-xs mb-2">{item.type}</p>
                <p className="font-bold text-white tabular-nums text-xl mb-2">{item.count}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 tabular-nums text-xs">{item.percentage}%</span>
                </div>
                <div className="bg-slate-800/60 rounded-full overflow-hidden h-1">
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
              </DashboardPanel>
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Goulets d'étranglement */}
        <DashboardSection
          title="Goulets d'étranglement"
          icon={Zap}
        >
          <DashboardGrid columns={2} gap="md">
            {goulets.map((goulet) => (
              <DashboardPanel
                key={goulet.id}
                padding="md"
                className="relative hover:bg-slate-900/40 hover:border-slate-700/60 transition-colors"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 top-0 h-0.5',
                    goulet.impact === 'high' && 'bg-rose-400/80',
                    goulet.impact === 'medium' && 'bg-amber-400/80',
                    goulet.impact === 'low' && 'bg-blue-400/80'
                  )}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-1">{goulet.processus}</h3>
                    <div className="flex items-center text-slate-300 text-xs">
                      <span>{goulet.volume} demandes</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'rounded-full font-medium text-xs px-2 py-1',
                      goulet.impact === 'high' && 'bg-red-500/20 text-red-300 border border-red-500/30',
                      goulet.impact === 'medium' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                      goulet.impact === 'low' && 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    )}
                  >
                    Impact {goulet.impact === 'high' ? 'Élevé' : goulet.impact === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-amber-400 h-4 w-4" />
                  <span className="text-white font-medium text-sm">Temps moyen: {goulet.tempsMoyen} jours</span>
                </div>
              </DashboardPanel>
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Blocages critiques */}
        <DashboardSection
          title="Blocages actifs"
          icon={AlertTriangle}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              {filteredBlocages.filter((b) => b.priorite === 'critique').length > 0 && (
                <AnimatedBadge variant="critical" pulse>
                  {filteredBlocages.filter((b) => b.priorite === 'critique').length} critique
                  {filteredBlocages.filter((b) => b.priorite === 'critique').length > 1 ? 's' : ''}
                </AnimatedBadge>
              )}
              {searchQuery && (
                <span className="text-slate-300 text-sm">
                  {filteredBlocages.length} résultat{filteredBlocages.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          }
        >
          {filteredBlocages.length === 0 ? (
            <EmptyState
              variant="search"
              title={searchQuery ? 'Aucun blocage trouvé' : 'Aucun blocage actif'}
              description={
                searchQuery
                  ? `Aucun blocage ne correspond à "${searchQuery}"`
                  : "Aucun blocage n'est actuellement actif"
              }
              action={
                searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    Effacer la recherche
                  </button>
                )
              }
            />
          ) : (
            <DashboardGrid columns={2} gap="md">
              {filteredBlocages.map((blocage) => (
                <button
                  key={blocage.id}
                  type="button"
                  onClick={() => {
                    // TODO: Implémenter la navigation vers le détail du blocage
                  }}
                  className={cn(
                    'relative rounded-2xl border border-slate-800/60 bg-slate-900/30',
                    'text-left transition-colors duration-200',
                    'hover:bg-slate-900/45 hover:border-slate-700/60',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                    blocage.priorite === 'critique' && 'ring-1 ring-rose-500/20',
                    blocage.priorite === 'haute' && 'ring-1 ring-amber-500/15'
                  )}
                  style={{ padding: '1rem' }}
                  aria-label={`Blocage: ${blocage.type} - ${blocage.count} occurrence(s) - Priorité ${blocage.priorite}`}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 top-0 h-0.5',
                      blocage.priorite === 'critique' && 'bg-rose-400/80',
                      blocage.priorite === 'haute' && 'bg-amber-400/80',
                      blocage.priorite === 'moyenne' && 'bg-slate-300/50'
                    )}
                  />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm mb-1">{blocage.type}</h3>
                      <div className="flex items-center text-slate-300 text-sm gap-2">
                        <Building2 className="h-3 w-3" />
                        <span>{blocage.bureau}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-white tabular-nums text-xl">{blocage.count}</span>
                      <EnterpriseBadge
                        variant={blocage.priorite === 'critique' ? 'critique' : blocage.priorite === 'haute' ? 'haute' : 'moyenne'}
                        size="sm"
                      >
                        {blocage.priorite === 'critique' ? 'Critique' : blocage.priorite === 'haute' ? 'Haute' : 'Moyenne'}
                      </EnterpriseBadge>
                    </div>
                  </div>
                </button>
              ))}
            </DashboardGrid>
          )}
        </DashboardSection>

        {/* Performance par bureau */}
        <DashboardSection
          title="Performance par bureau"
          icon={Users}
        >
          <DashboardGrid columns={3} gap="md">
            {performanceBureau.map((perf) => (
              <DashboardPanel key={perf.bureau} padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="text-purple-400 h-4 w-4 flex-shrink-0" />
                  <h3 className="font-semibold text-white text-sm">{perf.bureau}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-xs">Volume</span>
                      <span className="font-semibold text-white tabular-nums text-sm">{perf.volume}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-xs">Taux de validation</span>
                      <span className="font-semibold text-emerald-300 tabular-nums text-sm">{perf.validation}%</span>
                    </div>
                    <div className="bg-slate-800/60 rounded-full overflow-hidden h-1">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${perf.validation}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-xs">Temps moyen</span>
                      <span className="font-semibold text-white tabular-nums text-sm">{perf.tempsMoyen}j</span>
                    </div>
                  </div>
                </div>
              </DashboardPanel>
            ))}
          </DashboardGrid>
        </DashboardSection>
      </DashboardPageLayout>
    </TooltipProvider>
  );
});

export default DemandesKpiPage;
