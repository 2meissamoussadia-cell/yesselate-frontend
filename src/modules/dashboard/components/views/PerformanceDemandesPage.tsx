/**
 * Page Performance Demandes
 * Vue des indicateurs de performance des demandes
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { FileText, TrendingUp, Clock, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
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
import type { PerformanceDemandesData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';
import { FilterBar } from '@/components/erp';
import type { ErpFilters } from '@/components/erp';

const STATUT_TO_API: Record<string, string> = {
  '': '',
  'En attente': 'en-attente',
  'En cours': 'en-cours',
  'Traitée': 'traitee',
};

export const PerformanceDemandesPage = memo(function PerformanceDemandesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ErpFilters>({ statut: '', priorite: '' });

  const onFilterChange = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<PerformanceDemandesData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        traitees: 0,
        enCours: 0,
        enAttente: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données (filtres ERP + recherche)
  const filteredDemandes = useMemo(() => {
    if (!data?.demandes) return [];
    let list = data.demandes;

    const statutApi = STATUT_TO_API[String(filters.statut ?? '')];
    if (statutApi) list = list.filter((d) => d.statut === statutApi);

    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(demande =>
      demande.titre.toLowerCase().includes(query) ||
      demande.type.toLowerCase().includes(query) ||
      demande.bureau.toLowerCase().includes(query)
    );
  }, [data, searchQuery, filters.statut]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Type', 'Titre', 'Bureau', 'Statut', 'Date création', 'Date traitement', 'Délai traitement (jours)'];
    const rows = filteredDemandes.map(demande => [
      demande.id,
      demande.type,
      demande.titre,
      demande.bureau,
      demande.statut === 'traitee' ? 'Traitée' : demande.statut === 'en-cours' ? 'En cours' : 'En attente',
      new Date(demande.dateCreation).toLocaleDateString('fr-FR'),
      demande.dateTraitement ? new Date(demande.dateTraitement).toLocaleDateString('fr-FR') : '',
      demande.delaiTraitement?.toString() || '',
    ]);
    exportToCSV(rows, headers, `performance-demandes-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredDemandes]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredDemandes, `performance-demandes-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredDemandes]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total demandes',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'traitees',
      label: 'Traitées',
      value: stats.traitees,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'en-cours',
      label: 'En cours',
      value: stats.enCours,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'en-attente',
      label: 'En attente',
      value: stats.enAttente,
      color: 'amber',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredDemandes[0]>['columns'] = useMemo(() => [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300 text-sm uppercase">{value}</span>
      ),
    },
    {
      key: 'titre',
      label: 'Titre',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-slate-200">{value}</span>
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
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value: 'traitee' | 'en-cours' | 'en-attente') => {
        const icons = {
          traitee: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          'en-cours': <Clock className="h-4 w-4 text-blue-400" />,
          'en-attente': <AlertCircle className="h-4 w-4 text-amber-400" />,
        };
        const labels = {
          traitee: 'Traitée',
          'en-cours': 'En cours',
          'en-attente': 'En attente',
        };
        const colors = {
          traitee: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          'en-cours': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          'en-attente': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
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
      key: 'dateCreation',
      label: 'Date création',
      sortable: true,
      render: (value: string) => (
        <span className="text-slate-300 text-sm">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'delaiTraitement',
      label: 'Délai traitement',
      sortable: true,
      align: 'right' as const,
      render: (value: number | undefined) => {
        if (value === undefined) return <span className="text-slate-400">-</span>;
        return (
          <div className="flex items-center justify-end gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="font-semibold tabular-nums text-slate-300">{value}j</span>
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
          description={error.message || 'Impossible de charger les indicateurs de performance des demandes'}
          icon={FileText}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Performance Demandes" description="Indicateurs de performance des demandes">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <FilterBar
            filters={filters}
            onFilterChange={onFilterChange}
            options={{ statuts: ['Toutes', 'En attente', 'En cours', 'Traitée'] }}
            hideSections={['perimetre', 'dates', 'avances', 'savedViews']}
            className="mb-4 rounded-xl border-0 bg-transparent"
          />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des demandes</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher une demande..."
                totalCount={data?.demandes.length || 0}
                resultsCount={filteredDemandes.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredDemandes.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune demande trouvée" : "Aucune demande"}
              description={
                searchQuery
                  ? `Aucune demande ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune demande à afficher."
              }
              icon={FileText}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredDemandes}
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

export default PerformanceDemandesPage;
