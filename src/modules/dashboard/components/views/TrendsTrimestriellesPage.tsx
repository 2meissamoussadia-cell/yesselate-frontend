/**
 * Page Tendances Trimestrielles
 * Vue des tendances de performance par trimestre
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, FolderKanban, FileText, DollarSign, Clock } from 'lucide-react';
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
import type { TrendsTrimestriellesData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/utils';

export const TrendsTrimestriellesPage = memo(function TrendsTrimestriellesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<TrendsTrimestriellesData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalTrimestres: 0,
        moyenneScore: 0,
        meilleurTrimestre: '',
        pireTrimestre: '',
        evolutionGlobale: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredTrends = useMemo(() => {
    if (!data?.trends) return [];
    if (!searchQuery.trim()) return data.trends;
    
    const query = searchQuery.toLowerCase();
    return data.trends.filter(trend => 
      trend.label.toLowerCase().includes(query) ||
      trend.trimestre.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Trimestre', 'Projets', 'Demandes', 'Budget consommé', 'Budget prévu', 'Retards', 'Score performance', 'Évolution %', 'Tendance'];
    const rows = filteredTrends.map(trend => [
      trend.label,
      trend.projets.toString(),
      trend.demandes.toString(),
      formatMoneyEUR(trend.budgetConsomme),
      formatMoneyEUR(trend.budgetPrevu),
      trend.retards.toString(),
      `${trend.scorePerformance.toFixed(1)}/100`,
      `${trend.evolution > 0 ? '+' : ''}${trend.evolution.toFixed(1)}%`,
      trend.tendance === 'up' ? '↑' : trend.tendance === 'down' ? '↓' : '→',
    ]);
    exportToCSV(rows, headers, `trends-trimestrielles-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredTrends]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredTrends, `trends-trimestrielles-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredTrends]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total-trimestres',
      label: 'Total trimestres',
      value: stats.totalTrimestres,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'moyenne-score',
      label: 'Score moyen',
      value: `${stats.moyenneScore.toFixed(1)}/100`,
      color: stats.moyenneScore >= 80 ? 'emerald' : stats.moyenneScore >= 60 ? 'amber' : 'rose',
      trend: '+0%',
    },
    {
      id: 'meilleur-trimestre',
      label: 'Meilleur trimestre',
      value: stats.meilleurTrimestre || '-',
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'evolution',
      label: 'Évolution globale',
      value: `${stats.evolutionGlobale > 0 ? '+' : ''}${stats.evolutionGlobale.toFixed(1)}%`,
      color: stats.evolutionGlobale > 0 ? 'emerald' : 'rose',
      trend: stats.evolutionGlobale > 0 ? '+0%' : '-0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredTrends[0]>['columns'] = useMemo(() => [
    {
      key: 'label',
      label: 'Trimestre',
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
      render: (value: number, row) => {
        const isPositive = value > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            {row.tendance === 'up' ? (
              <TrendingUp className="h-3 w-3 text-rose-400" />
            ) : row.tendance === 'down' ? (
              <TrendingDown className="h-3 w-3 text-emerald-400" />
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
          description={error.message || 'Impossible de charger les tendances trimestrielles'}
          icon={Calendar}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Tendances Trimestrielles" description="Évolution de la performance par trimestre">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Tendances par trimestre</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un trimestre..."
                totalCount={data?.trends.length || 0}
                resultsCount={filteredTrends.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredTrends.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune tendance trouvée" : "Aucune tendance trimestrielle"}
              description={
                searchQuery
                  ? `Aucune tendance ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune tendance trimestrielle disponible."
              }
              icon={Calendar}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredTrends}
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
