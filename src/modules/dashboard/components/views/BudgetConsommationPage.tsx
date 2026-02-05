/**
 * Page Budget Consommation
 * Vue détaillée de la consommation budgétaire
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, PieChart, Building2, FolderOpen } from 'lucide-react';
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
import { SearchFilter } from '../shared/SearchFilter';
import { useDashboardData } from '../../hooks/useDashboardData';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import type { BudgetConsommationData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/cn';

export const BudgetConsommationPage = memo(function BudgetConsommationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<BudgetConsommationData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalConsomme: 0,
        totalBudget: 0,
        pourcentage: 0,
        parProjet: 0,
        parCategorie: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredConsommation = useMemo(() => {
    if (!data?.consommation) return [];
    if (!searchQuery.trim()) return data.consommation;
    
    const query = searchQuery.toLowerCase();
    return data.consommation.filter(item => 
      (item.projet && item.projet.toLowerCase().includes(query)) ||
      item.categorie.toLowerCase().includes(query) ||
      item.bureau.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Projet', 'Catégorie', 'Bureau', 'Budget initial', 'Budget consommé', 'Budget restant', 'Pourcentage'];
    const rows = filteredConsommation.map(item => [
      item.projet || '',
      item.categorie,
      item.bureau,
      formatMoneyEUR(item.budgetInitial),
      formatMoneyEUR(item.budgetConsomme),
      formatMoneyEUR(item.budgetRestant),
      `${item.pourcentage.toFixed(1)}%`,
    ]);
    exportToCSV(rows, headers, `budget-consommation-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredConsommation]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredConsommation, `budget-consommation-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredConsommation]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total consommé',
      value: formatMoneyEUR(stats.totalConsomme),
      color: 'blue',
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
      id: 'par-projet',
      label: 'Par projet',
      value: stats.parProjet,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'par-categorie',
      label: 'Par catégorie',
      value: stats.parCategorie,
      color: 'purple',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredConsommation[0]>['columns'] = useMemo(() => [
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
      key: 'bureau',
      label: 'Bureau',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Building2 className="h-3 w-3 text-slate-400" />
          <span className="text-slate-300">{value}</span>
        </div>
      ),
    },
    {
      key: 'budgetInitial',
      label: 'Budget initial',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{formatMoneyEUR(value)}</span>
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
      key: 'budgetRestant',
      label: 'Restant',
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
      render: (value: number, row) => (
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
          description={error.message || 'Impossible de charger les données de consommation'}
          icon={PieChart}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Budget Consommation" description="Analyse détaillée de la consommation budgétaire">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Détail de la consommation</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un projet, catégorie ou bureau..."
                totalCount={data?.consommation.length || 0}
                resultsCount={filteredConsommation.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredConsommation.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune donnée trouvée" : "Aucune donnée de consommation"}
              description={
                searchQuery
                  ? `Aucune consommation ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune donnée de consommation disponible."
              }
              icon={PieChart}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredConsommation}
              columns={columns}
              pagination
              pageSize={20}
              searchable={false}
            />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
