/**
 * Page Budget Prévisions
 * Vue des prévisions budgétaires
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';
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
import type { BudgetPrevisionsData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/utils';

export const BudgetPrevisionsPage = memo(function BudgetPrevisionsPage() {
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<BudgetPrevisionsData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalPrevu: 0,
        ceMois: 0,
        ceTrimestre: 0,
        cetteAnnee: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    if (!data?.previsions) return;
    const headers = ['Période', 'Projet', 'Catégorie', 'Budget prévu', 'Budget réalisé', 'Variance', 'Variance %'];
    const rows = data.previsions.map(prev => [
      prev.periode,
      prev.projet || '',
      prev.categorie,
      formatMoneyEUR(prev.budgetPrevu),
      prev.budgetRealise ? formatMoneyEUR(prev.budgetRealise) : '',
      prev.variance ? formatMoneyEUR(prev.variance) : '',
      prev.variancePourcentage ? `${prev.variancePourcentage.toFixed(1)}%` : '',
    ]);
    exportToCSV(rows, headers, `budget-previsions-${new Date().toISOString().split('T')[0]}.csv`);
  }, [data]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    if (!data?.previsions) return;
    exportToJSON(data.previsions, `budget-previsions-${new Date().toISOString().split('T')[0]}.json`);
  }, [data]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total prévu',
      value: formatMoneyEUR(stats.totalPrevu),
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'ce-mois',
      label: 'Ce mois',
      value: formatMoneyEUR(stats.ceMois),
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'ce-trimestre',
      label: 'Ce trimestre',
      value: formatMoneyEUR(stats.ceTrimestre),
      color: 'purple',
      trend: '+0%',
    },
    {
      id: 'cette-annee',
      label: "Cette année",
      value: formatMoneyEUR(stats.cetteAnnee),
      color: 'emerald',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  type PrevisionRow = BudgetPrevisionsData['previsions'][number];
  const columns: DashboardDataTableProps<PrevisionRow>['columns'] = useMemo(() => [
    {
      key: 'periode',
      label: 'Période',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-slate-200 font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'projet',
      label: 'Projet',
      sortable: true,
      render: (value) => value ? (
        <span className="text-slate-300">{value}</span>
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
      key: 'budgetPrevu',
      label: 'Budget prévu',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-blue-300">{formatMoneyEUR(value)}</span>
      ),
    },
    {
      key: 'budgetRealise',
      label: 'Budget réalisé',
      sortable: true,
      align: 'right' as const,
      render: (value: number | undefined) => value ? (
        <span className="font-semibold tabular-nums text-emerald-300">{formatMoneyEUR(value)}</span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
    {
      key: 'variance',
      label: 'Variance',
      sortable: true,
      align: 'right' as const,
      render: (value: number | undefined, row) => {
        if (value === undefined) return <span className="text-slate-400">-</span>;
        const isPositive = value > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-rose-400" />
            ) : (
              <TrendingUp className="h-3 w-3 text-emerald-400 rotate-180" />
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
      render: (value: number | undefined) => {
        if (value === undefined) return <span className="text-slate-400">-</span>;
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
  ], []);
  
  if (isLoading) {
    return <DashboardPageSkeleton />;
  }
  
  if (error) {
    return (
      <DashboardPageLayout>
        <EmptyState
          title="Erreur de chargement"
          description={error.message || 'Impossible de charger les prévisions budgétaires'}
          icon={Target}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Budget Prévisions" description="Prévisions budgétaires par période">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Détail des prévisions</h3>
            <ExportButton 
              onExportCSV={handleExportCSV} 
              onExportJSON={handleExportJSON} 
            />
          </div>

          {!data?.previsions || data.previsions.length === 0 ? (
            <EmptyState
              title="Aucune prévision disponible"
              description="Il n'y a actuellement aucune prévision budgétaire disponible."
              icon={Target}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={data.previsions}
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
