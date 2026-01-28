/**
 * Page Performance Projets
 * Vue des indicateurs de performance des projets
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { FolderKanban, TrendingUp, Target, CheckCircle2, Clock, AlertCircle, Building2 } from 'lucide-react';
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
import type { PerformanceProjetsData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/utils';

export const PerformanceProjetsPage = memo(function PerformanceProjetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<PerformanceProjetsData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        enAvance: 0,
        enRetard: 0,
        dansLesTemps: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredProjets = useMemo(() => {
    if (!data?.projets) return [];
    if (!searchQuery.trim()) return data.projets;
    
    const query = searchQuery.toLowerCase();
    return data.projets.filter(projet => 
      projet.nom.toLowerCase().includes(query) ||
      projet.bureau.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Nom', 'Bureau', 'Progression %', 'Statut', 'Jours de retard', 'Budget consommé', 'Budget prévu'];
    const rows = filteredProjets.map(projet => [
      projet.nom,
      projet.bureau,
      `${projet.progression.toFixed(1)}%`,
      projet.statut === 'en-avance' ? 'En avance' : projet.statut === 'en-retard' ? 'En retard' : 'Dans les temps',
      projet.joursRetard?.toString() || '0',
      formatMoneyEUR(projet.budgetConsomme),
      formatMoneyEUR(projet.budgetPrevu),
    ]);
    exportToCSV(rows, headers, `performance-projets-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredProjets]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredProjets, `performance-projets-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredProjets]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total projets',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'en-avance',
      label: 'En avance',
      value: stats.enAvance,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'en-retard',
      label: 'En retard',
      value: stats.enRetard,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'dans-les-temps',
      label: 'Dans les temps',
      value: stats.dansLesTemps,
      color: 'blue',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredProjets[0]>['columns'] = useMemo(() => [
    {
      key: 'nom',
      label: 'Projet',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-blue-400" />
          <span className="font-medium text-slate-200">{value}</span>
        </div>
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
      key: 'progression',
      label: 'Progression',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            'font-semibold tabular-nums',
            value >= 80 ? 'text-emerald-400' : value >= 50 ? 'text-amber-400' : 'text-rose-400'
          )}>
            {value.toFixed(1)}%
          </span>
          <div className="w-16 bg-slate-800/60 rounded-full overflow-hidden h-1">
            <div
              className={cn(
                'h-full transition-all duration-500',
                value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value: 'en-avance' | 'dans-les-temps' | 'en-retard') => {
        const icons = {
          'en-avance': <TrendingUp className="h-4 w-4 text-emerald-400" />,
          'dans-les-temps': <CheckCircle2 className="h-4 w-4 text-blue-400" />,
          'en-retard': <AlertCircle className="h-4 w-4 text-rose-400" />,
        };
        const labels = {
          'en-avance': 'En avance',
          'dans-les-temps': 'Dans les temps',
          'en-retard': 'En retard',
        };
        const colors = {
          'en-avance': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          'dans-les-temps': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          'en-retard': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
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
      key: 'joursRetard',
      label: 'Jours de retard',
      sortable: true,
      align: 'right' as const,
      render: (value: number | undefined) => {
        if (!value || value === 0) return <span className="text-slate-500">-</span>;
        return (
          <div className="flex items-center justify-end gap-1">
            <Clock className="h-3 w-3 text-rose-400" />
            <span className="font-semibold tabular-nums text-rose-400">{value}j</span>
          </div>
        );
      },
    },
    {
      key: 'budgetConsomme',
      label: 'Budget consommé',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-blue-300">{formatMoneyEUR(value)}</span>
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
          description={error.message || 'Impossible de charger les indicateurs de performance des projets'}
          icon={FolderKanban}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Performance Projets" description="Indicateurs de performance des projets">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des projets</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un projet..."
                totalCount={data?.projets.length || 0}
                resultsCount={filteredProjets.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredProjets.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucun projet trouvé" : "Aucun projet"}
              description={
                searchQuery
                  ? `Aucun projet ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucun projet à afficher."
              }
              icon={FolderKanban}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredProjets}
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
