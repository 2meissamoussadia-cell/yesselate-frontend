/**
 * Page Benchmarking
 * Comparaison avec les standards et références du secteur
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Target, TrendingUp, Award, TrendingDown, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
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
import type { ComparisonBenchmarkingData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';

export const ComparisonBenchmarkingPage = memo(function ComparisonBenchmarkingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<ComparisonBenchmarkingData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        kpisAuDessus: 0,
        kpisEnDessous: 0,
        kpisDansLaMoyenne: 0,
        scoreGlobal: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredBenchmarks = useMemo(() => {
    if (!data?.benchmarks) return [];
    if (!searchQuery.trim()) return data.benchmarks;
    
    const query = searchQuery.toLowerCase();
    return data.benchmarks.filter(bench => 
      bench.kpi.toLowerCase().includes(query) ||
      bench.secteur.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['KPI', 'Valeur actuelle', 'Valeur standard', 'Écart %', 'Statut', 'Secteur'];
    const rows = filteredBenchmarks.map(bench => [
      bench.kpi,
      bench.valeurActuelle.toString(),
      bench.valeurStandard.toString(),
      `${bench.ecart > 0 ? '+' : ''}${bench.ecart.toFixed(1)}%`,
      bench.statut === 'au-dessus' ? 'Au-dessus' : bench.statut === 'dans-la-moyenne' ? 'Dans la moyenne' : 'En-dessous',
      bench.secteur,
    ]);
    exportToCSV(rows, headers, `benchmarking-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredBenchmarks]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredBenchmarks, `benchmarking-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredBenchmarks]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'au-dessus',
      label: 'Au-dessus standard',
      value: stats.kpisAuDessus,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'en-dessous',
      label: 'En-dessous standard',
      value: stats.kpisEnDessous,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'moyenne',
      label: 'Dans la moyenne',
      value: stats.kpisDansLaMoyenne,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'score',
      label: 'Score global',
      value: `${stats.scoreGlobal}/100`,
      color: stats.scoreGlobal >= 80 ? 'emerald' : stats.scoreGlobal >= 60 ? 'amber' : 'rose',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredBenchmarks[0]>['columns'] = useMemo(() => [
    {
      key: 'kpi',
      label: 'KPI',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-slate-200">{value}</span>
      ),
    },
    {
      key: 'valeurActuelle',
      label: 'Valeur actuelle',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{value}</span>
      ),
    },
    {
      key: 'valeurStandard',
      label: 'Valeur standard',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-300">{value}</span>
      ),
    },
    {
      key: 'ecart',
      label: 'Écart',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => {
        const isPositive = value > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-rose-400" />
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
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value: 'au-dessus' | 'dans-la-moyenne' | 'en-dessous') => {
        const icons = {
          'au-dessus': <TrendingUp className="h-4 w-4 text-emerald-400" />,
          'dans-la-moyenne': <BarChart3 className="h-4 w-4 text-blue-400" />,
          'en-dessous': <TrendingDown className="h-4 w-4 text-rose-400" />,
        };
        const labels = {
          'au-dessus': 'Au-dessus',
          'dans-la-moyenne': 'Dans la moyenne',
          'en-dessous': 'En-dessous',
        };
        const colors = {
          'au-dessus': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          'dans-la-moyenne': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          'en-dessous': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
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
      key: 'secteur',
      label: 'Secteur',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300 text-sm">{value}</span>
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
          description={error.message || 'Impossible de charger les données de benchmarking'}
          icon={Target}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Benchmarking" description="Comparaison avec les standards du secteur">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Analyse de benchmarking</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un KPI..."
                totalCount={data?.benchmarks.length || 0}
                resultsCount={filteredBenchmarks.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredBenchmarks.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucun benchmark trouvé" : "Aucun benchmark disponible"}
              description={
                searchQuery
                  ? `Aucun benchmark ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune donnée de benchmarking disponible."
              }
              icon={Target}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredBenchmarks}
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
