/**
 * Page Performance Budget
 * Vue des indicateurs de performance budgétaire
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, FolderOpen, Building2 } from 'lucide-react';
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
import type { PerformanceBudgetData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/utils';

export const PerformanceBudgetPage = memo(function PerformanceBudgetPage() {
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<PerformanceBudgetData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalAlloue: 0,
        totalConsomme: 0,
        pourcentage: 0,
        reste: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    if (!data?.budget) return;
    const headers = ['Projet', 'Catégorie', 'Budget alloué', 'Budget consommé', 'Budget restant', 'Pourcentage'];
    const rows = data.budget.map(item => [
      item.projet || '',
      item.categorie,
      formatMoneyEUR(item.budgetAlloue),
      formatMoneyEUR(item.budgetConsomme),
      formatMoneyEUR(item.budgetRestant),
      `${item.pourcentage.toFixed(1)}%`,
    ]);
    exportToCSV(rows, headers, `performance-budget-${new Date().toISOString().split('T')[0]}.csv`);
  }, [data]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    if (!data?.budget) return;
    exportToJSON(data.budget, `performance-budget-${new Date().toISOString().split('T')[0]}.json`);
  }, [data]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'alloue',
      label: 'Total alloué',
      value: formatMoneyEUR(stats.totalAlloue),
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'consomme',
      label: 'Total consommé',
      value: formatMoneyEUR(stats.totalConsomme),
      color: 'amber',
      trend: '+0%',
    },
    {
      id: 'pourcentage',
      label: 'Pourcentage',
      value: `${stats.pourcentage.toFixed(1)}%`,
      color: stats.pourcentage > 80 ? 'rose' : stats.pourcentage > 60 ? 'amber' : 'emerald',
      trend: '+0%',
    },
    {
      id: 'reste',
      label: 'Reste',
      value: formatMoneyEUR(stats.reste),
      color: stats.reste > 0 ? 'emerald' : 'rose',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<NonNullable<typeof data>['budget'][number]>['columns'] = useMemo(() => [
    {
      key: 'projet',
      label: 'Projet',
      sortable: true,
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-slate-400" />
          <span className="text-slate-200">{value}</span>
        </div>
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
      key: 'budgetAlloue',
      label: 'Budget alloué',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{formatMoneyEUR(value)}</span>
      ),
    },
    {
      key: 'budgetConsomme',
      label: 'Budget consommé',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-amber-300">{formatMoneyEUR(value)}</span>
      ),
    },
    {
      key: 'budgetRestant',
      label: 'Budget restant',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-emerald-300">{formatMoneyEUR(value)}</span>
      ),
    },
    {
      key: 'pourcentage',
      label: 'Pourcentage',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            'font-semibold tabular-nums',
            value > 80 ? 'text-rose-400' : value > 60 ? 'text-amber-400' : 'text-emerald-400'
          )}>
            {value.toFixed(1)}%
          </span>
          <div className="w-16 bg-slate-800/60 rounded-full overflow-hidden h-1">
            <div
              className={cn(
                'h-full transition-all duration-500',
                value > 80 ? 'bg-rose-500' : value > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      ),
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
          description={error.message || 'Impossible de charger les indicateurs de performance budgétaire'}
          icon={DollarSign}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Performance Budget" description="Indicateurs de performance budgétaire">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Détail budgétaire</h3>
            <ExportButton 
              onExportCSV={handleExportCSV} 
              onExportJSON={handleExportJSON} 
            />
          </div>

          {!data?.budget || data.budget.length === 0 ? (
            <EmptyState
              title="Aucune donnée budgétaire"
              description="Il n'y a actuellement aucune donnée budgétaire disponible."
              icon={DollarSign}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={data.budget}
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

export default PerformanceBudgetPage;
