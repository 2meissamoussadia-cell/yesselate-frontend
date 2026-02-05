/**
 * Page Stocks Vue d'Ensemble
 * Vue d'ensemble des stocks et inventaires
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Package, TrendingUp, AlertTriangle, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import type { StocksOverviewData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/cn';

export const StocksOverviewPage = memo(function StocksOverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<StocksOverviewData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalArticles: 0,
        valeurTotale: 0,
        articlesFaibles: 0,
        articlesCritiques: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredStocks = useMemo(() => {
    if (!data?.stocks) return [];
    if (!searchQuery.trim()) return data.stocks;
    
    const query = searchQuery.toLowerCase();
    return data.stocks.filter(stock => 
      stock.article.toLowerCase().includes(query) ||
      stock.categorie.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Article', 'Catégorie', 'Quantité', 'Quantité min', 'Quantité max', 'Valeur unitaire', 'Valeur totale', 'Statut', 'Dernier mouvement'];
    const rows = filteredStocks.map(stock => [
      stock.article,
      stock.categorie,
      stock.quantite.toString(),
      stock.quantiteMin.toString(),
      stock.quantiteMax.toString(),
      formatMoneyEUR(stock.valeurUnitaire),
      formatMoneyEUR(stock.valeurTotale),
      stock.statut === 'normal' ? 'Normal' : stock.statut === 'faible' ? 'Faible' : 'Critique',
      stock.dernierMouvement ? new Date(stock.dernierMouvement).toLocaleDateString('fr-FR') : '',
    ]);
    exportToCSV(rows, headers, `stocks-overview-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredStocks]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredStocks, `stocks-overview-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredStocks]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total-articles',
      label: 'Total articles',
      value: stats.totalArticles,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'valeur-totale',
      label: 'Valeur totale',
      value: formatMoneyEUR(stats.valeurTotale),
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'articles-faibles',
      label: 'Stocks faibles',
      value: stats.articlesFaibles,
      color: 'amber',
      trend: '+0%',
    },
    {
      id: 'articles-critiques',
      label: 'Stocks critiques',
      value: stats.articlesCritiques,
      color: 'rose',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredStocks[0]>['columns'] = useMemo(() => [
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
      key: 'quantite',
      label: 'Quantité',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row) => {
        const pourcentage = row.quantiteMax > 0 ? (value / row.quantiteMax) * 100 : 0;
        return (
          <div className="flex flex-col items-end gap-1">
            <span className={cn(
              'font-semibold tabular-nums',
              row.statut === 'critique' ? 'text-rose-400' : row.statut === 'faible' ? 'text-amber-400' : 'text-slate-200'
            )}>
              {value}
            </span>
            <div className="w-16 bg-slate-800/60 rounded-full overflow-hidden h-1">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  row.statut === 'critique' ? 'bg-rose-500' : row.statut === 'faible' ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(pourcentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'quantiteMin',
      label: 'Min',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="text-slate-400 text-sm tabular-nums">{value}</span>
      ),
    },
    {
      key: 'quantiteMax',
      label: 'Max',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="text-slate-400 text-sm tabular-nums">{value}</span>
      ),
    },
    {
      key: 'valeurTotale',
      label: 'Valeur totale',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-emerald-300">{formatMoneyEUR(value)}</span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value: 'normal' | 'faible' | 'critique') => {
        const icons = {
          normal: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          faible: <AlertTriangle className="h-4 w-4 text-amber-400" />,
          critique: <AlertCircle className="h-4 w-4 text-rose-400" />,
        };
        const labels = {
          normal: 'Normal',
          faible: 'Faible',
          critique: 'Critique',
        };
        const colors = {
          normal: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          faible: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
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
  ], []);
  
  if (isLoading) {
    return <DashboardPageSkeleton />;
  }
  
  if (error) {
    return (
      <DashboardPageLayout>
        <EmptyState
          title="Erreur de chargement"
          description={error.message || 'Impossible de charger les stocks'}
          icon={Package}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Stocks Vue d'Ensemble" description="Vue globale des stocks et inventaires">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des stocks</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un article..."
                totalCount={data?.stocks.length || 0}
                resultsCount={filteredStocks.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredStocks.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucun stock trouvé" : "Aucun stock disponible"}
              description={
                searchQuery
                  ? `Aucun stock ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucun stock disponible."
              }
              icon={Package}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredStocks}
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

export default StocksOverviewPage;
