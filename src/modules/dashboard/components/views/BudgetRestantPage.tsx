/**
 * Page Budget Restant
 * Vue du budget restant disponible
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Wallet, TrendingDown, AlertCircle, DollarSign, FolderOpen, Building2 } from 'lucide-react';
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
import type { BudgetRestantData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/cn';

export const BudgetRestantPage = memo(function BudgetRestantPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<BudgetRestantData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalRestant: 0,
        parProjet: 0,
        parCategorie: 0,
        critique: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredBudgetRestant = useMemo(() => {
    if (!data?.budgetRestant) return [];
    if (!searchQuery.trim()) return data.budgetRestant;
    
    const query = searchQuery.toLowerCase();
    return data.budgetRestant.filter(item => 
      (item.projet && item.projet.toLowerCase().includes(query)) ||
      item.categorie.toLowerCase().includes(query) ||
      item.bureau.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Projet', 'Catégorie', 'Bureau', 'Budget initial', 'Budget consommé', 'Budget restant', 'Pourcentage restant', 'Critique'];
    const rows = filteredBudgetRestant.map(item => [
      item.projet || '',
      item.categorie,
      item.bureau,
      formatMoneyEUR(item.budgetInitial),
      formatMoneyEUR(item.budgetConsomme),
      formatMoneyEUR(item.budgetRestant),
      `${item.pourcentageRestant.toFixed(1)}%`,
      item.isCritique ? 'Oui' : 'Non',
    ]);
    exportToCSV(rows, headers, `budget-restant-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredBudgetRestant]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredBudgetRestant, `budget-restant-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredBudgetRestant]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total restant',
      value: formatMoneyEUR(stats.totalRestant),
      color: stats.totalRestant > 0 ? 'emerald' : 'rose',
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
    {
      id: 'critique',
      label: 'Projets critiques',
      value: stats.critique,
      color: 'rose',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredBudgetRestant[0]>['columns'] = useMemo(() => [
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
      key: 'budgetRestant',
      label: 'Budget restant',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row) => (
        <span className={cn(
          'font-semibold tabular-nums',
          row.isCritique ? 'text-rose-400' : 'text-emerald-300'
        )}>
          {formatMoneyEUR(value)}
        </span>
      ),
    },
    {
      key: 'pourcentageRestant',
      label: '% Restant',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row) => (
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            'font-semibold tabular-nums',
            value < 10 ? 'text-rose-400' : value < 30 ? 'text-amber-400' : 'text-emerald-400'
          )}>
            {value.toFixed(1)}%
          </span>
          <div className="w-16 bg-slate-800/60 rounded-full overflow-hidden h-1">
            <div
              className={cn(
                'h-full transition-all duration-500',
                value < 10 ? 'bg-rose-500' : value < 30 ? 'bg-amber-500' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'isCritique',
      label: 'Statut',
      sortable: true,
      render: (value: boolean) => (
        <div className="flex items-center gap-1">
          {value ? (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          ) : (
            <Wallet className="h-4 w-4 text-emerald-400" />
          )}
          <span className={cn(
            'text-sm font-medium',
            value ? 'text-rose-400' : 'text-emerald-400'
          )}>
            {value ? 'Critique' : 'OK'}
          </span>
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
          description={error.message || 'Impossible de charger les données de budget restant'}
          icon={Wallet}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Budget Restant" description="Budget disponible restant par projet et catégorie">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Détail du budget restant</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un projet, catégorie ou bureau..."
                totalCount={data?.budgetRestant.length || 0}
                resultsCount={filteredBudgetRestant.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredBudgetRestant.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune donnée trouvée" : "Aucune donnée de budget restant"}
              description={
                searchQuery
                  ? `Aucun budget restant ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune donnée de budget restant disponible."
              }
              icon={Wallet}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredBudgetRestant}
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
