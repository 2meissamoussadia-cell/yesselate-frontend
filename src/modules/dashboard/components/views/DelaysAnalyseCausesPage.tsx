/**
 * Page Analyse des Causes de Retards
 * Analyse approfondie des causes des retards
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingDown, AlertCircle, PieChart, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  DashboardDataTable,
  type DashboardDataTableProps,
  DashboardPageSkeleton,
} from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { useDashboardData } from '../../hooks/useDashboardData';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import type { DelaysAnalyseCausesData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';

export const DelaysAnalyseCausesPage = memo(function DelaysAnalyseCausesPage() {
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<DelaysAnalyseCausesData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        causesIdentifiees: 0,
        causesRecurrentes: 0,
        projetsAffectes: 0,
        tendance: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    if (!data?.analyses) return;
    const headers = ['Cause', 'Occurrences', 'Projets affectés', 'Impact moyen (jours)', 'Tendance', 'Actions correctives'];
    const rows = data.analyses.map(analyse => [
      analyse.cause,
      analyse.occurrences.toString(),
      analyse.projetsAffectes.toString(),
      analyse.impactMoyen.toString(),
      analyse.tendance === 'up' ? '↑' : analyse.tendance === 'down' ? '↓' : '→',
      (analyse.actionsCorrectives || []).join('; '),
    ]);
    exportToCSV(rows, headers, `analyse-causes-retards-${new Date().toISOString().split('T')[0]}.csv`);
  }, [data]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    if (!data?.analyses) return;
    exportToJSON(data.analyses, `analyse-causes-retards-${new Date().toISOString().split('T')[0]}.json`);
  }, [data]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'causes-identifiees',
      label: 'Causes identifiées',
      value: stats.causesIdentifiees,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'causes-recurrentes',
      label: 'Causes récurrentes',
      value: stats.causesRecurrentes,
      color: 'amber',
      trend: '+0%',
    },
    {
      id: 'projets-affectes',
      label: 'Projets affectés',
      value: stats.projetsAffectes,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'tendance',
      label: 'Tendance',
      value: `${stats.tendance > 0 ? '+' : ''}${stats.tendance.toFixed(1)}%`,
      color: stats.tendance > 0 ? 'emerald' : 'rose',
      trend: stats.tendance > 0 ? '-0%' : '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<NonNullable<typeof data>['analyses'][number]>['columns'] = useMemo(() => [
    {
      key: 'cause',
      label: 'Cause',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-slate-200">{value}</span>
      ),
    },
    {
      key: 'occurrences',
      label: 'Occurrences',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{value}</span>
      ),
    },
    {
      key: 'projetsAffectes',
      label: 'Projets affectés',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-rose-300">{value}</span>
      ),
    },
    {
      key: 'impactMoyen',
      label: 'Impact moyen',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <Clock className="h-3 w-3 text-amber-400" />
          <span className="font-semibold tabular-nums text-amber-300">{value}j</span>
        </div>
      ),
    },
    {
      key: 'tendance',
      label: 'Tendance',
      sortable: true,
      render: (value: 'up' | 'down' | 'stable') => {
        const icons = {
          up: <TrendingUp className="h-4 w-4 text-rose-400" />,
          down: <TrendingDown className="h-4 w-4 text-emerald-400" />,
          stable: <BarChart3 className="h-4 w-4 text-slate-400" />,
        };
        const labels = {
          up: '↑ Augmentation',
          down: '↓ Diminution',
          stable: '→ Stable',
        };
        return (
          <div className="flex items-center gap-1">
            {icons[value]}
            <span className="text-sm text-slate-300">{labels[value]}</span>
          </div>
        );
      },
    },
    {
      key: 'actionsCorrectives',
      label: 'Actions correctives',
      sortable: false,
      render: (value: string[] | undefined) => {
        if (!value || value.length === 0) return <span className="text-slate-500">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((action, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {action}
              </span>
            ))}
            {value.length > 2 && (
              <span className="text-xs text-slate-500">+{value.length - 2}</span>
            )}
          </div>
        );
      },
    },
  ], []);
  
  if (isLoading) {
    return <DashboardPageSkeleton />;
  }
  
  if (error) {
    return (
      <DashboardPageLayout>
        <EmptyState
          title="Erreur de chargement"
          description={error.message || 'Impossible de charger l\'analyse des causes'}
          icon={BarChart3}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      {/* Redistribution : accès au module Alertes > Projets > Retards */}
      <div className="mb-4 rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-slate-400">Accès module :</span>
        <Link
          href="/maitre-ouvrage/alerts/projets/retards"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/60 hover:text-slate-100 transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          Centre d&apos;alertes — Retards projets
          <ExternalLink className="h-3 w-3 text-slate-500" />
        </Link>
      </div>
      <DashboardSection title="Analyse des Causes de Retards" description="Analyse approfondie des causes des retards">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Analyse des causes</h3>
            <ExportButton 
              onExportCSV={handleExportCSV} 
              onExportJSON={handleExportJSON} 
            />
          </div>

          {!data?.analyses || data.analyses.length === 0 ? (
            <EmptyState
              title="Aucune analyse disponible"
              description="Il n'y a actuellement aucune analyse de causes de retards disponible."
              icon={BarChart3}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={data.analyses}
              columns={columns}
              pagination
              pageSize={20}
              searchable={true}
            />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});

export default DelaysAnalyseCausesPage;
