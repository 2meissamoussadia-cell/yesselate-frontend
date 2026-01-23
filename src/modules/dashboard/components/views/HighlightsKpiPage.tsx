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
  Building2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparklineChart } from '../shared/SparklineChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { ExportButton } from '../shared/ExportButton';

interface TopKPI {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  tone: 'success' | 'warning' | 'critical' | 'info';
  icon: React.ComponentType<{ className?: string }>;
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

function HighlightsKpiPage() {
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
      <div className="p-6 space-y-6 animate-fadeIn">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Synthèse stratégique</h1>
            <p className="text-slate-400">Vue d'ensemble des indicateurs clés et tendances principales</p>
          </div>
          <ExportButton
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            label="Exporter"
          />
        </div>

        {/* Top KPIs */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Indicateurs clés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topKPIs.map((kpi) => {
              const Icon = kpi.icon;
              const isPositive = kpi.trendDirection === 'down' && kpi.tone !== 'critical';
              const isNegative = kpi.trendDirection === 'up' && (kpi.tone === 'critical' || kpi.tone === 'warning');
              
              return (
                <Tooltip key={kpi.id}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleKPIClick(kpi)}
                      className={cn(
                        'rounded-xl p-5 border-2 transition-all duration-300 cursor-pointer',
                        'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                        kpi.tone === 'success' && 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 hover:border-emerald-400',
                        kpi.tone === 'warning' && 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/50 hover:border-amber-400',
                        kpi.tone === 'critical' && 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/50 hover:border-red-400',
                        kpi.tone === 'info' && 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/50 hover:border-blue-400'
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
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                              kpi.tone === 'success' && 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30',
                              kpi.tone === 'warning' && 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30',
                              kpi.tone === 'critical' && 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30',
                              kpi.tone === 'info' && 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30'
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
                      </div>
                      
                      {/* Sparkline */}
                      {kpi.sparkline && (
                        <div className="mb-2">
                          <SparklineChart
                            data={kpi.sparkline}
                            color={kpi.tone === 'success' ? 'emerald' : kpi.tone === 'warning' ? 'amber' : kpi.tone === 'critical' ? 'red' : 'blue'}
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
                          !isPositive && !isNegative && 'text-slate-400'
                        )}
                      >
                        <div className="flex items-center gap-1 font-medium">
                          {kpi.trendDirection !== 'neutral' && (
                            <>
                              {isPositive ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <TrendingUp className="h-3 w-3" />
                              )}
                              <span>{kpi.trend}</span>
                            </>
                          )}
                          {kpi.trendDirection === 'neutral' && <span>{kpi.trend}</span>}
                        </div>
                        <span className="text-slate-500 text-[10px]">Cliquer pour détails</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{kpi.label}</p>
                      {kpi.description && (
                        <p className="text-xs text-slate-300">{kpi.description}</p>
                      )}
                      <p className="text-xs text-slate-400 pt-1 border-t border-slate-700">
                        Cliquez pour voir les détails et l'historique
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </section>

      {/* Tendances clés */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          Tendances principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trends.map((trend) => (
            <div
              key={trend.id}
              className={cn(
                'rounded-xl p-5 border bg-slate-800/40 border-slate-700/40',
                'hover:border-slate-600/60 transition-all duration-200'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">{trend.label}</p>
                {trend.trend === 'up' && (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{trend.value}</p>
              <p className="text-xs text-slate-500">{trend.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risques et alertes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Risques et alertes critiques
          </h2>
          {risks.filter(r => r.severity === 'high').length > 0 && (
            <AnimatedBadge variant="critical" pulse>
              {risks.filter(r => r.severity === 'high').length} critique{risks.filter(r => r.severity === 'high').length > 1 ? 's' : ''}
            </AnimatedBadge>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className={cn(
                'rounded-xl p-4 border-2 transition-all duration-300 hover:scale-[1.02]',
                'cursor-pointer hover:shadow-lg hover:shadow-black/20',
                risk.severity === 'high' && 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30 hover:border-red-400',
                risk.severity === 'medium' && 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30 hover:border-amber-400',
                risk.severity === 'low' && 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30 hover:border-blue-400'
              )}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {risk.severity === 'high' && <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />}
                  {risk.severity === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                  {risk.severity === 'low' && <Activity className="h-4 w-4 text-blue-400" />}
                  <p className="text-sm font-medium text-white">{risk.label}</p>
                </div>
                <AnimatedBadge 
                  variant={risk.severity === 'high' ? 'critical' : risk.severity === 'medium' ? 'warning' : 'info'}
                  pulse={risk.severity === 'high'}
                >
                  {risk.count}
                </AnimatedBadge>
              </div>
              <p className="text-xs text-slate-400">
                Évolution: {risk.trend === 'stable' ? 'Stable' : risk.trend}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Classements */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-400" />
          Classements performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rankings.map((ranking) => (
            <div
              key={ranking.id}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                {ranking.type === 'bureau' && <Building2 className="h-4 w-4 text-blue-400" />}
                {ranking.type === 'region' && <Globe className="h-4 w-4 text-purple-400" />}
                {ranking.type === 'projet' && <Target className="h-4 w-4 text-emerald-400" />}
                <h3 className="text-sm font-semibold text-white">{ranking.label}</h3>
              </div>
              <div className="space-y-3">
                {ranking.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-4">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
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
      </div>
    </TooltipProvider>
  );
}

export default memo(HighlightsKpiPage);

