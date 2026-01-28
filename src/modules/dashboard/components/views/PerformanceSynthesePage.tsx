/**
 * Page Performance Synthèse
 * Vue synthèse des indicateurs de performance
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, Target, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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
import type { PerformanceSyntheseData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';

export const PerformanceSynthesePage = memo(function PerformanceSynthesePage() {
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<PerformanceSyntheseData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        scoreGlobal: 0,
        kpisAtteints: 0,
        kpisEnRetard: 0,
        tendance: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    if (!data?.synthese) return;
    const headers = ['KPI', 'Valeur', 'Cible', 'Statut', 'Tendance', 'Évolution %'];
    const rows = data.synthese.map(item => [
      item.kpi,
      item.valeur.toString(),
      item.cible.toString(),
      item.statut === 'atteint' ? 'Atteint' : item.statut === 'en-retard' ? 'En retard' : 'Critique',
      item.tendance === 'up' ? '↑' : item.tendance === 'down' ? '↓' : '→',
      `${item.evolution > 0 ? '+' : ''}${item.evolution.toFixed(1)}%`,
    ]);
    exportToCSV(rows, headers, `performance-synthese-${new Date().toISOString().split('T')[0]}.csv`);
  }, [data]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    if (!data?.synthese) return;
    exportToJSON(data.synthese, `performance-synthese-${new Date().toISOString().split('T')[0]}.json`);
  }, [data]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'score',
      label: 'Score global',
      value: `${stats.scoreGlobal}/100`,
      color: stats.scoreGlobal >= 80 ? 'emerald' : stats.scoreGlobal >= 60 ? 'amber' : 'rose',
      trend: '+0%',
    },
    {
      id: 'atteints',
      label: 'KPIs atteints',
      value: stats.kpisAtteints,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'en-retard',
      label: 'KPIs en retard',
      value: stats.kpisEnRetard,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'tendance',
      label: 'Tendance',
      value: `${stats.tendance > 0 ? '+' : ''}${stats.tendance.toFixed(1)}%`,
      color: stats.tendance > 0 ? 'emerald' : 'rose',
      trend: stats.tendance > 0 ? '+0%' : '-0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<NonNullable<typeof data>['synthese'][number]>['columns'] = useMemo(() => [
    {
      key: 'kpi',
      label: 'KPI',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-slate-200">{value}</span>
      ),
    },
    {
      key: 'valeur',
      label: 'Valeur',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{value}</span>
      ),
    },
    {
      key: 'cible',
      label: 'Cible',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-300">{value}</span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value: 'atteint' | 'en-retard' | 'critique') => {
        const icons = {
          atteint: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          'en-retard': <Clock className="h-4 w-4 text-amber-400" />,
          critique: <AlertCircle className="h-4 w-4 text-rose-400" />,
        };
        const labels = {
          atteint: 'Atteint',
          'en-retard': 'En retard',
          critique: 'Critique',
        };
        const colors = {
          atteint: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          'en-retard': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          critique: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
        return (
          <div className="flex items-center gap-2">
            {icons[value]}
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[value]}`}>
              {labels[value]}
            </span>
          </div>
        );
      },
    },
    {
      key: 'evolution',
      label: 'Évolution',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row) => {
        const isPositive = value > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            {row.tendance === 'up' ? (
              <TrendingUp className="h-3 w-3 text-rose-400" />
            ) : row.tendance === 'down' ? (
              <TrendingUp className="h-3 w-3 text-emerald-400 rotate-180" />
            ) : (
              <BarChart3 className="h-3 w-3 text-slate-400" />
            )}
            <span className={cn(
              'font-semibold tabular-nums',
              isPositive ? 'text-rose-400' : 'text-emerald-400'
            )}>
              {isPositive ? '+' : ''}{value.toFixed(1)}%
            </span>
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
          description={error.message || 'Impossible de charger la synthèse de performance'}
          icon={BarChart3}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Performance Synthèse" description="Vue synthèse des indicateurs de performance">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Indicateurs de performance</h3>
            <ExportButton 
              onExportCSV={handleExportCSV} 
              onExportJSON={handleExportJSON} 
            />
          </div>

          {!data?.synthese || data.synthese.length === 0 ? (
            <EmptyState
              title="Aucune donnée de synthèse"
              description="Il n'y a actuellement aucune donnée de synthèse disponible."
              icon={BarChart3}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={data.synthese}
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
