/**
 * Page Comparaison par Période
 * Comparaison des performances entre périodes
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, FolderKanban, FileText, Clock } from 'lucide-react';
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
import type { ComparisonPeriodeData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/cn';

export const ComparisonPeriodePage = memo(function ComparisonPeriodePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<ComparisonPeriodeData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        meilleurePeriode: '',
        pirePeriode: '',
        tendance: 0,
        evolution: 0,
        moyenneScore: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredComparaisons = useMemo(() => {
    if (!data?.comparaisons) return [];
    if (!searchQuery.trim()) return data.comparaisons;
    
    const query = searchQuery.toLowerCase();
    return data.comparaisons.filter(comp => 
      comp.label.toLowerCase().includes(query) ||
      comp.periode.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Période', 'Projets', 'Demandes', 'Budget consommé', 'Retards', 'Score performance', 'Évolution %'];
    const rows = filteredComparaisons.map(comp => [
      comp.label,
      comp.projets.toString(),
      comp.demandes.toString(),
      formatMoneyEUR(comp.budgetConsomme),
      comp.retards.toString(),
      `${comp.scorePerformance.toFixed(1)}/100`,
      `${comp.evolution > 0 ? '+' : ''}${comp.evolution.toFixed(1)}%`,
    ]);
    exportToCSV(rows, headers, `comparison-periode-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredComparaisons]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredComparaisons, `comparison-periode-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredComparaisons]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'meilleure',
      label: 'Meilleure période',
      value: stats.meilleurePeriode || 'N/A',
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'pire',
      label: 'Moins performante',
      value: stats.pirePeriode || 'N/A',
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
    {
      id: 'evolution',
      label: 'Évolution',
      value: `${stats.evolution > 0 ? '+' : ''}${stats.evolution.toFixed(1)}%`,
      color: stats.evolution > 0 ? 'emerald' : 'rose',
      trend: stats.evolution > 0 ? '+0%' : '-0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredComparaisons[0]>['columns'] = useMemo(() => [
    {
      key: 'label',
      label: 'Période',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-400" />
          <span className="font-medium text-slate-200">{value}</span>
        </div>
      ),
    },
    {
      key: 'projets',
      label: 'Projets',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <FolderKanban className="h-3 w-3 text-slate-400" />
          <span className="font-semibold tabular-nums text-slate-200">{value}</span>
        </div>
      ),
    },
    {
      key: 'demandes',
      label: 'Demandes',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <FileText className="h-3 w-3 text-slate-400" />
          <span className="font-semibold tabular-nums text-slate-200">{value}</span>
        </div>
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
      key: 'retards',
      label: 'Retards',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <Clock className="h-3 w-3 text-rose-400" />
          <span className="font-semibold tabular-nums text-rose-400">{value}</span>
        </div>
      ),
    },
    {
      key: 'scorePerformance',
      label: 'Score',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            'font-semibold tabular-nums',
            value >= 80 ? 'text-emerald-400' : value >= 60 ? 'text-amber-400' : 'text-rose-400'
          )}>
            {value.toFixed(1)}/100
          </span>
          <div className="w-16 bg-slate-800/60 rounded-full overflow-hidden h-1">
            <div
              className={cn(
                'h-full transition-all duration-500',
                value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'evolution',
      label: 'Évolution',
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
          description={error.message || 'Impossible de charger les comparaisons entre périodes'}
          icon={Calendar}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Comparaison par Période" description="Analyse comparative des performances entre périodes">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Graphiques comparatifs</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher une période..."
                totalCount={data?.comparaisons.length || 0}
                resultsCount={filteredComparaisons.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredComparaisons.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune comparaison trouvée" : "Aucune comparaison disponible"}
              description={
                searchQuery
                  ? `Aucune comparaison ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune donnée de comparaison entre périodes."
              }
              icon={Calendar}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredComparaisons}
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
