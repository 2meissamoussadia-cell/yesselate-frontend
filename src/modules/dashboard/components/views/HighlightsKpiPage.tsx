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
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';
import { ExportButton } from '../shared/ExportButton';
import { toneToColor, parseTrendPercent } from '@lib-root/dashboard/kpi';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';
import { RiskDetailModal } from '../modals/RiskDetailModal';

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
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  const handleKPIClick = useCallback((kpi: TopKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        trend: parseTrendPercent(kpi.trend),
        trendType: kpi.trendDirection,
        tone: kpi.tone === 'success' ? 'ok' : kpi.tone === 'warning' ? 'warn' : 'crit',
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

  // Convertir topKPIs au format KPICardData
  const topKPIsData: KPICardData[] = useMemo(() => {
    return topKPIs.map((kpi) => {
      // Conversion de 'success' -> 'ok' pour compatibilité avec Tone
      const kpiTone: 'ok' | 'warn' | 'crit' | 'info' = 
        kpi.tone === 'success' ? 'ok' :
        kpi.tone === 'warning' ? 'warn' :
        kpi.tone === 'critical' ? 'crit' : 'info';
      const color = toneToColor(kpiTone);
      
      return {
        id: kpi.id,
        label: kpi.label,
        value: kpi.value,
        trend: parseTrendPercent(kpi.trend),
        trendType: kpi.trendDirection,
        icon: kpi.icon,
        color,
        description: kpi.description,
        sparkline: kpi.sparkline,
        onClick: () => handleKPIClick(kpi),
      };
    });
  }, [topKPIs, handleKPIClick]);

  return (
    <TooltipProvider delayDuration={200}>
      <DashboardPageLayout maxWidth="xl" padding="md">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
              Synthèse stratégique
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Vue d'ensemble des indicateurs clés et tendances principales
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
          </div>
        </div>

        {/* Top KPIs */}
        <DashboardSection
          title="Indicateurs clés"
          icon={Zap}
        >
          <DashboardGrid columns={3} gap="md">
            {topKPIsData.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} size="md" />
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Tendances clés */}
        <DashboardSection
          title="Tendances principales"
          icon={Activity}
        >
          <DashboardGrid columns={3} gap="md">
            {trends.map((trend) => (
              <DashboardPanel key={trend.id} padding="md" className="hover:bg-slate-950/45 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-300">{trend.label}</p>
                  {trend.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                </div>
                <p className="text-2xl font-bold text-white mb-1 tabular-nums">{trend.value}</p>
                <p className="text-xs text-slate-400">{trend.description}</p>
              </DashboardPanel>
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Risques et alertes */}
        <DashboardSection
          title="Risques et alertes critiques"
          icon={AlertTriangle}
          action={
            risks.filter(r => r.severity === 'high').length > 0 ? (
              <EnterpriseBadge variant="critique" size="sm">
                {risks.filter(r => r.severity === 'high').length} critique{risks.filter(r => r.severity === 'high').length > 1 ? 's' : ''}
              </EnterpriseBadge>
            ) : undefined
          }
        >
          <DashboardGrid columns={2} gap="md">
            {risks.map((risk) => (
              <button
                key={risk.id}
                type="button"
                onClick={() => setSelectedRisk(risk)}
                className={cn(
                  'relative rounded-2xl border border-slate-800/60 bg-slate-900/30',
                  'text-left transition-colors duration-200',
                  'hover:bg-slate-900/45 hover:border-slate-700/60',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                  risk.severity === 'high' && 'ring-1 ring-rose-500/20',
                  risk.severity === 'medium' && 'ring-1 ring-amber-500/15'
                )}
                style={{ padding: '1rem' }}
                aria-label={`Risque: ${risk.label} - ${risk.count} occurrence(s)`}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 top-0 h-0.5',
                    risk.severity === 'high' && 'bg-rose-400/80',
                    risk.severity === 'medium' && 'bg-amber-400/80',
                    risk.severity === 'low' && 'bg-blue-400/80'
                  )}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {risk.severity === 'high' && <AlertCircle className="text-red-400 animate-pulse h-4 w-4 flex-shrink-0" />}
                    {risk.severity === 'medium' && <AlertTriangle className="text-amber-400 h-4 w-4 flex-shrink-0" />}
                    {risk.severity === 'low' && <Activity className="text-blue-400 h-4 w-4 flex-shrink-0" />}
                    <p className="font-medium text-white text-sm">{risk.label}</p>
                  </div>
                  <EnterpriseBadge
                    variant={risk.severity === 'high' ? 'critique' : risk.severity === 'medium' ? 'haute' : 'moyenne'}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {risk.count}
                  </EnterpriseBadge>
                </div>
                <p className="text-slate-400 text-xs">
                  Évolution: {risk.trend === 'stable' ? 'Stable' : risk.trend}
                </p>
              </button>
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Classements */}
        <DashboardSection
          title="Classements performance"
          icon={Award}
        >
          <DashboardGrid columns={3} gap="md">
            {rankings.map((ranking) => {
              const RankingIcon = ranking.type === 'bureau' ? Building2 : ranking.type === 'region' ? Globe : Target;
              return (
                <DashboardPanel key={ranking.id} padding="md">
                  <div className="flex items-center gap-2 mb-4">
                    <RankingIcon className={cn(
                      'h-4 w-4 flex-shrink-0',
                      ranking.type === 'bureau' && 'text-blue-400',
                      ranking.type === 'region' && 'text-purple-400',
                      ranking.type === 'projet' && 'text-emerald-400'
                    )} />
                    <h3 className="font-semibold text-white text-sm">{ranking.label}</h3>
                  </div>
                  <div className="space-y-2">
                    {ranking.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300 text-xs w-6">
                            #{index + 1}
                          </span>
                          <span className="text-white text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.score}%</span>
                          {item.trend === 'up' && <TrendingUp className="text-emerald-400 h-3 w-3" />}
                          {item.trend === 'down' && <TrendingDown className="text-red-400 h-3 w-3" />}
                          {item.trend === 'neutral' && <div className="rounded-full bg-slate-500 h-3 w-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardPanel>
              );
            })}
          </DashboardGrid>
        </DashboardSection>
      </DashboardPageLayout>

      {/* Risk Detail Modal */}
      <RiskDetailModal
        isOpen={!!selectedRisk}
        onClose={() => setSelectedRisk(null)}
        risk={selectedRisk}
      />
    </TooltipProvider>
  );
});

export default HighlightsKpiPage;
