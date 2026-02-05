/**
 * Page Budget Analyse
 * Analyse approfondie du budget avec tendances et comparaisons
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, TrendingDown, PieChart, AlertTriangle } from 'lucide-react';
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
import type { BudgetAnalyseData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/cn';

export const BudgetAnalysePage = memo(function BudgetAnalysePage() {
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<BudgetAnalyseData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        variance: 0,
        tendance: 0,
        ecartType: 0,
        projetsSurBudget: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    if (!data?.analyses) return;
    const headers = ['Projet', 'Catégorie', 'Période', 'Budget initial', 'Budget consommé', 'Budget prévu', 'Variance', 'Variance %', 'Tendance'];
    const rows = data.analyses.map(analyse => [
      analyse.projet || '',
      analyse.categorie,
      analyse.periode,
      formatMoneyEUR(analyse.budgetInitial),
      formatMoneyEUR(analyse.budgetConsomme),
      formatMoneyEUR(analyse.budgetPrevu),
      formatMoneyEUR(analyse.variance),
      `${analyse.variancePourcentage.toFixed(1)}%`,
      analyse.tendance === 'up' ? '↑' : analyse.tendance === 'down' ? '↓' : '→',
    ]);
    exportToCSV(rows, headers, `budget-analyse-${new Date().toISOString().split('T')[0]}.csv`);
  }, [data]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    if (!data?.analyses) return;
    exportToJSON(data.analyses, `budget-analyse-${new Date().toISOString().split('T')[0]}.json`);
  }, [data]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'variance',
      label: 'Variance',
      value: formatMoneyEUR(stats.variance),
      color: stats.variance > 0 ? 'rose' : 'emerald',
      trend: stats.variance > 0 ? '+0%' : '-0%',
    },
    {
      id: 'tendance',
      label: 'Tendance',
      value: `${stats.tendance > 0 ? '+' : ''}${stats.tendance.toFixed(1)}%`,
      color: stats.tendance > 0 ? 'rose' : 'emerald',
      trend: stats.tendance > 0 ? '+0%' : '-0%',
    },
    {
      id: 'ecart-type',
      label: 'Écart-type',
      value: formatMoneyEUR(stats.ecartType),
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'sur-budget',
      label: 'Projets sur budget',
      value: stats.projetsSurBudget,
      color: 'rose',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  type AnalyseRow = BudgetAnalyseData['analyses'][number];
  const columns: DashboardDataTableProps<AnalyseRow>['columns'] = useMemo(() => [
    {
      key: 'projet',
      label: 'Projet',
      sortable: true,
      render: (value) => value ? (
        <span className="text-slate-200 font-medium">{value}</span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300">{value}</span>
      ),
    },
    {
      key: 'periode',
      label: 'Période',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300 text-sm">{value}</span>
      ),
    },
    {
      key: 'budgetConsomme',
      label: 'Consommé',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-blue-300">{formatMoneyEUR(value)}</span>
      ),
    },
    {
      key: 'budgetPrevu',
      label: 'Prévu',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{formatMoneyEUR(value)}</span>
      ),
    },
    {
      key: 'variance',
      label: 'Variance',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => {
        const isPositive = value > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-rose-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-emerald-400" />
            )}
            <span className={cn(
              'font-semibold tabular-nums',
              isPositive ? 'text-rose-400' : 'text-emerald-400'
            )}>
              {formatMoneyEUR(Math.abs(value))}
            </span>
          </div>
        );
      },
    },
    {
      key: 'variancePourcentage',
      label: 'Variance %',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => {
        const isPositive = value > 0;
        return (
          <span className={cn(
            'font-semibold tabular-nums',
            isPositive ? 'text-rose-400' : 'text-emerald-400'
          )}>
            {isPositive ? '+' : ''}{value.toFixed(1)}%
          </span>
        );
      },
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
          up: '↑ Hausse',
          down: '↓ Baisse',
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
  ], []);
  
  if (isLoading) {
    return <DashboardPageSkeleton />;
  }
  
  if (error) {
    return (
      <DashboardPageLayout>
        <EmptyState
          title="Erreur de chargement"
          description={error.message || 'Impossible de charger les analyses budgétaires'}
          icon={BarChart3}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Budget Analyse" description="Analyse approfondie avec tendances et comparaisons">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Analyses et tendances</h3>
            <ExportButton 
              onExportCSV={handleExportCSV} 
              onExportJSON={handleExportJSON} 
            />
          </div>

          {!data?.analyses || data.analyses.length === 0 ? (
            <EmptyState
              title="Aucune analyse disponible"
              description="Il n'y a actuellement aucune analyse budgétaire disponible."
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
