/**
 * Page KPIs Highlights - Synthèse stratégique
 * Vue de synthèse avec top KPIs, tendances, risques et classements
 */

'use client';

import React, { useCallback, memo, useMemo, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Award, 
  Target, 
  Activity,
  AlertCircle,
  BarChart3,
  Zap,
  Globe,
  Building2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { KPICard } from '@/components/features/bmo/dashboard/components';
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { ExportButton } from '../shared/ExportButton';
import { DashboardPageShell } from '../shared/DashboardPageShell';
import { DashboardPanel } from '../shared/DashboardPanel';

interface TopKPI {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  tone: 'success' | 'warning' | 'critical' | 'info';
  icon: LucideIcon;
  sparkline?: number[];
  description?: string;
}

interface Risk {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
  count: number;
  trend: string;
}

interface Ranking {
  id: string;
  label: string;
  type: 'bureau' | 'region' | 'projet';
  items: Array<{
    name: string;
    score: number;
    trend: 'up' | 'down' | 'neutral';
  }>;
}

export const HighlightsKpiPage = memo(function HighlightsKpiPage() {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);

  const handleKPIClick = useCallback((kpi: TopKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        delta: kpi.trend,
        tone: kpi.tone === 'success' ? 'ok' : kpi.tone === 'warning' ? 'warn' : 'crit',
        trend: kpi.trendDirection === 'up' ? 'up' : kpi.trendDirection === 'down' ? 'down' : 'neutral',
        icon: kpi.icon,
      },
    });
  }, [openModal]);

  // Top KPIs stratégiques avec données sparkline
  const topKPIs: TopKPI[] = useMemo(() => [
    {
      id: '1',
      label: 'Taux de conformité global',
      value: '94%',
      trend: '+2%',
      trendDirection: 'up',
      tone: 'success',
      icon: CheckCircle,
      sparkline: [88, 89, 90, 91, 92, 93, 94],
      description: 'Taux de conformité aux standards et processus',
    },
    {
      id: '2',
      label: 'Projets en retard',
      value: 3,
      trend: '-2',
      trendDirection: 'down',
      tone: 'success',
      icon: Target,
      sparkline: [7, 6, 5, 4, 4, 3, 3],
      description: 'Nombre de projets avec retard de planning',
    },
    {
      id: '3',
      label: 'Risques critiques',
      value: 3,
      trend: '+1',
      trendDirection: 'up',
      tone: 'critical',
      icon: AlertCircle,
      sparkline: [1, 1, 2, 2, 2, 2, 3],
      description: 'Risques nécessitant une attention immédiate',
    },
    {
      id: '4',
      label: 'Budget consommé',
      value: '67%',
      trend: '+2%',
      trendDirection: 'up',
      tone: 'warning',
      icon: BarChart3,
      sparkline: [58, 60, 62, 63, 65, 66, 67],
      description: 'Pourcentage du budget total consommé',
    },
    {
      id: '5',
      label: 'Blocages actifs',
      value: 5,
      trend: '-2',
      trendDirection: 'down',
      tone: 'warning',
      icon: AlertTriangle,
      sparkline: [9, 8, 7, 7, 6, 5, 5],
      description: 'Processus bloqués nécessitant une intervention',
    },
    {
      id: '6',
      label: 'Temps de réponse moyen',
      value: '2.4j',
      trend: '-0.3j',
      trendDirection: 'down',
      tone: 'success',
      icon: Activity,
      sparkline: [3.2, 3.0, 2.8, 2.7, 2.6, 2.5, 2.4],
      description: 'Délai moyen de traitement des demandes',
    },
  ], []);

  // Risques identifiés
  const risks: Risk[] = useMemo(() => [
    {
      id: 'r1',
      label: 'Retards projets',
      severity: 'high',
      count: 3,
      trend: '-1',
    },
    {
      id: 'r2',
      label: 'Dépassements budget',
      severity: 'high',
      count: 2,
      trend: 'stable',
    },
    {
      id: 'r3',
      label: 'Blocages processus',
      severity: 'medium',
      count: 5,
      trend: '-2',
    },
    {
      id: 'r4',
      label: 'Goulets d\'étranglement',
      severity: 'medium',
      count: 4,
      trend: '+1',
    },
  ], []);

  // Classements
  const rankings: Ranking[] = useMemo(() => [
    {
      id: 'bureaux',
      label: 'Top 3 Bureaux',
      type: 'bureau',
      items: [
        { name: 'BMO', score: 96, trend: 'up' },
        { name: 'BF', score: 92, trend: 'up' },
        { name: 'BJ', score: 89, trend: 'neutral' },
      ],
    },
    {
      id: 'regions',
      label: 'Top 3 Régions',
      type: 'region',
      items: [
        { name: 'Dakar', score: 94, trend: 'up' },
        { name: 'Thiès', score: 91, trend: 'up' },
        { name: 'Saint-Louis', score: 88, trend: 'neutral' },
      ],
    },
    {
      id: 'projets',
      label: 'Top 3 Projets',
      type: 'projet',
      items: [
        { name: 'Villa Diamniadio', score: 98, trend: 'up' },
        { name: 'Complexe Résidentiel', score: 95, trend: 'up' },
        { name: 'Infrastructure Route', score: 92, trend: 'neutral' },
      ],
    },
  ], []);

  // Tendances clés
  const trends = useMemo(() => [
    {
      id: 't1',
      label: 'Projets en cours',
      value: '78%',
      description: 'Avancement moyen',
      color: 'blue',
      trend: 'up',
    },
    {
      id: 't2',
      label: 'Validation des demandes',
      value: '89%',
      description: 'Taux de validation',
      color: 'emerald',
      trend: 'up',
    },
    {
      id: 't3',
      label: 'Conformité SLA',
      value: '94%',
      description: 'Respect des délais',
      color: 'emerald',
      trend: 'up',
    },
  ], []);

  // Fonctions d'export des données
  const handleExportCSV = useCallback(() => {
    // Préparer les données à exporter
    const exportData = [
      // Top KPIs
      ...topKPIs.map(kpi => ({
        Type: 'KPI',
        Label: kpi.label,
        Valeur: kpi.value,
        Tendance: kpi.trend,
        Direction: kpi.trendDirection,
        Statut: kpi.tone,
      })),
      // Risques
      ...risks.map(risk => ({
        Type: 'Risque',
        Label: risk.label,
        Sévérité: risk.severity,
        Nombre: risk.count,
        Tendance: risk.trend,
      })),
      // Classements
      ...rankings.flatMap(ranking => 
        ranking.items.map(item => ({
          Type: 'Classement',
          Catégorie: ranking.label,
          Nom: item.name,
          Score: item.score,
          Tendance: item.trend,
        }))
      ),
      // Tendances
      ...trends.map(trend => ({
        Type: 'Tendance',
        Label: trend.label,
        Valeur: trend.value,
        Description: trend.description,
        Couleur: trend.color,
        Direction: trend.trend,
      })),
    ];

    // Générer le CSV
    if (exportData.length === 0) return;
    
    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synthèse-stratégique-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [topKPIs, risks, rankings, trends]);

  const handleExportJSON = useCallback(() => {
    // Préparer les données à exporter
    const exportData = {
      topKPIs: topKPIs.map(kpi => ({
        label: kpi.label,
        value: kpi.value,
        trend: kpi.trend,
        trendDirection: kpi.trendDirection,
        tone: kpi.tone,
        description: kpi.description,
      })),
      risks: risks.map(risk => ({
        label: risk.label,
        severity: risk.severity,
        count: risk.count,
        trend: risk.trend,
      })),
      rankings: rankings.map(ranking => ({
        label: ranking.label,
        type: ranking.type,
        items: ranking.items,
      })),
      trends: trends.map(trend => ({
        label: trend.label,
        value: trend.value,
        description: trend.description,
        color: trend.color,
        trend: trend.trend,
      })),
      exportedAt: new Date().toISOString(),
    };

    // Générer le JSON
    const jsonContent = JSON.stringify(exportData, null, 2);
    
    // Télécharger le fichier
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synthèse-stratégique-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [topKPIs, risks, rankings, trends]);

  return (
    <TooltipProvider delayDuration={200}>
      <DashboardPageShell
        title="Synthèse stratégique"
        subtitle="Vue d'ensemble des indicateurs clés et tendances principales"
        rightSlot={
          <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
        }
      >
        <DashboardPanel className="p-4 sm:p-6">
          {/* Top KPIs */}
          <section className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 break-words">
              <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <span className="min-w-0">Indicateurs clés</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
              {topKPIs.map((kpi) => {
                const color =
                  kpi.tone === 'success'
                    ? ('emerald' as const)
                    : kpi.tone === 'warning'
                      ? ('amber' as const)
                      : kpi.tone === 'critical'
                        ? ('rose' as const)
                        : ('blue' as const);
                return (
                  <KPICard
                    key={kpi.id}
                    kpi={{
                      id: kpi.id,
                      label: kpi.label,
                      value: kpi.value,
                      delta: kpi.trend,
                      trendType: kpi.trendDirection,
                      icon: kpi.icon,
                      color,
                      description: kpi.description,
                      onClick: () => handleKPIClick(kpi),
                    }}
                    size="md"
                  />
                );
              })}
            </div>
          </section>
        </DashboardPanel>

        <DashboardPanel className="p-4 sm:p-6">
          {/* Tendances clés */}
          <section className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 break-words">
              <Activity className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="min-w-0">Tendances principales</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
              {trends.map((trend) => (
                <div
                  key={trend.id}
                  className={cn(
                    'rounded-xl p-4 sm:p-5 border border-slate-800/60 bg-slate-950/30 min-w-0 overflow-hidden',
                    'hover:bg-slate-950/45 transition-colors'
                  )}
                >
                  <div className="flex items-center justify-between mb-2 min-w-0">
                    <p className="text-sm text-slate-300 break-words min-w-0">{trend.label}</p>
                    {trend.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                  </div>
                  <p className="text-2xl font-bold text-white mb-1 tabular-nums">{trend.value}</p>
                  <p className="text-xs text-slate-400">{trend.description}</p>
                </div>
              ))}
            </div>
          </section>
        </DashboardPanel>

        <DashboardPanel className="p-4 sm:p-6">
      {/* Risques et alertes */}
      <section className="min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 break-words">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <span className="min-w-0">Risques et alertes critiques</span>
          </h2>
          {risks.filter(r => r.severity === 'high').length > 0 && (
            <AnimatedBadge variant="critical" pulse className="flex-shrink-0">
              {risks.filter(r => r.severity === 'high').length} critique{risks.filter(r => r.severity === 'high').length > 1 ? 's' : ''}
            </AnimatedBadge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className={cn(
                'relative rounded-2xl p-3 sm:p-4 border border-slate-800/60 bg-slate-900/30 min-w-0 overflow-hidden',
                'cursor-pointer transition-colors hover:bg-slate-900/45 hover:border-slate-700/60',
                risk.severity === 'high' && 'ring-1 ring-rose-500/20',
                risk.severity === 'medium' && 'ring-1 ring-amber-500/15'
              )}
              role="button"
              tabIndex={0}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 top-0 h-[2px]',
                  risk.severity === 'high' && 'bg-rose-400/80',
                  risk.severity === 'medium' && 'bg-amber-400/80',
                  risk.severity === 'low' && 'bg-blue-400/80'
                )}
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {risk.severity === 'high' && <AlertCircle className="h-4 w-4 text-red-400 animate-pulse flex-shrink-0" />}
                  {risk.severity === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />}
                  {risk.severity === 'low' && <Activity className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                  <p className="text-sm font-medium text-white break-words min-w-0">{risk.label}</p>
                </div>
                <AnimatedBadge 
                  variant={risk.severity === 'high' ? 'critical' : risk.severity === 'medium' ? 'warning' : 'info'}
                  pulse={risk.severity === 'high'}
                  className="flex-shrink-0"
                >
                  {risk.count}
                </AnimatedBadge>
              </div>
              <p className="text-xs text-slate-400 break-words">
                Évolution: {risk.trend === 'stable' ? 'Stable' : risk.trend}
              </p>
            </div>
          ))}
        </div>
      </section>
        </DashboardPanel>

        <DashboardPanel className="p-4 sm:p-6">
      {/* Classements */}
      <section className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 break-words">
          <Award className="h-5 w-5 text-yellow-400 flex-shrink-0" />
          <span className="min-w-0">Classements performance</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
          {rankings.map((ranking) => (
            <div
              key={ranking.id}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 min-w-0 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4 min-w-0">
                {ranking.type === 'bureau' && <Building2 className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                {ranking.type === 'region' && <Globe className="h-4 w-4 text-purple-400 flex-shrink-0" />}
                {ranking.type === 'projet' && <Target className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                <h3 className="text-sm font-semibold text-white break-words min-w-0">{ranking.label}</h3>
              </div>
              <div className="space-y-2 sm:space-y-3 min-w-0">
                {ranking.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors min-w-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-white break-words min-w-0">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-white">{item.score}%</span>
                      {item.trend === 'up' && (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      )}
                      {item.trend === 'down' && (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      {item.trend === 'neutral' && (
                        <div className="h-3 w-3 rounded-full bg-slate-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
        </DashboardPanel>
      </DashboardPageShell>
    </TooltipProvider>
  );
});

export default HighlightsKpiPage;
