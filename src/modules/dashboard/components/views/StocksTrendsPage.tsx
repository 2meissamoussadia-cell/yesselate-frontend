/**
 * Page Stocks Tendances
 * Analyse des tendances des stocks
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { TrendingUp, BarChart3, LineChart, TrendingDown, Package, Calendar } from 'lucide-react';
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
import type { StocksTrendsData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/cn';

export const StocksTrendsPage = memo(function StocksTrendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<StocksTrendsData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        tendanceGlobale: 0,
        rotationMoyenne: 0,
        articlesCroissants: 0,
        articlesDecroissants: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredTendances = useMemo(() => {
    if (!data?.tendances) return [];
    if (!searchQuery.trim()) return data.tendances;
    
    const query = searchQuery.toLowerCase();
    return data.tendances.filter(tendance => 
      tendance.article.toLowerCase().includes(query) ||
      tendance.categorie.toLowerCase().includes(query) ||
      tendance.periode.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Article', 'Catégorie', 'Période', 'Quantité initiale', 'Quantité actuelle', 'Variation %', 'Tendance', 'Rotation'];
    const rows = filteredTendances.map(tendance => [
      tendance.article,
      tendance.categorie,
      tendance.periode,
      tendance.quantiteInitiale.toString(),
      tendance.quantiteActuelle.toString(),
      `${tendance.variation > 0 ? '+' : ''}${tendance.variation.toFixed(1)}%`,
      tendance.tendance === 'up' ? '↑' : tendance.tendance === 'down' ? '↓' : '→',
      tendance.rotation.toFixed(2),
    ]);
    exportToCSV(rows, headers, `stocks-trends-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredTendances]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredTendances, `stocks-trends-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredTendances]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'tendance-globale',
      label: 'Tendance globale',
      value: `${stats.tendanceGlobale > 0 ? '+' : ''}${stats.tendanceGlobale.toFixed(1)}%`,
      color: stats.tendanceGlobale > 0 ? 'emerald' : 'rose',
      trend: stats.tendanceGlobale > 0 ? '+0%' : '-0%',
    },
    {
      id: 'rotation-moyenne',
      label: 'Rotation moyenne',
      value: stats.rotationMoyenne.toFixed(2),
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'articles-croissants',
      label: 'Articles croissants',
      value: stats.articlesCroissants,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'articles-decroissants',
      label: 'Articles décroissants',
      value: stats.articlesDecroissants,
      color: 'rose',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredTendances[0]>['columns'] = useMemo(() => [
    {
      key: 'article',
      label: 'Article',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" />
          <span className="font-medium text-slate-200">{value}</span>
        </div>
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
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-slate-400" />
          <span className="text-slate-300 text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'quantiteInitiale',
      label: 'Quantité initiale',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-300">{value}</span>
      ),
    },
    {
      key: 'quantiteActuelle',
      label: 'Quantité actuelle',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{value}</span>
      ),
    },
    {
      key: 'variation',
      label: 'Variation',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row) => {
        const isPositive = value > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            {row.tendance === 'up' ? (
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            ) : row.tendance === 'down' ? (
              <TrendingDown className="h-3 w-3 text-rose-400" />
            ) : (
              <BarChart3 className="h-3 w-3 text-slate-400" />
            )}
            <span className={cn(
              'font-semibold tabular-nums',
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {isPositive ? '+' : ''}{value.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'rotation',
      label: 'Rotation',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-blue-300">{value.toFixed(2)}</span>
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
          description={error.message || 'Impossible de charger les tendances des stocks'}
          icon={LineChart}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Stocks Tendances" description="Analyse des tendances des stocks">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Graphiques de tendances</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un article..."
                totalCount={data?.tendances.length || 0}
                resultsCount={filteredTendances.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredTendances.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune tendance trouvée" : "Aucune tendance disponible"}
              description={
                searchQuery
                  ? `Aucune tendance ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune donnée de tendance disponible."
              }
              icon={LineChart}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredTendances}
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

export default StocksTrendsPage;
