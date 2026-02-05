/**
 * Page Actions Inbox Cette Semaine
 * Vue des actions à traiter cette semaine
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { CalendarDays, Clock, FileText, DollarSign, Briefcase, Gavel } from 'lucide-react';
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
import type { ActionsInboxSemaineData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/cn';

export const ActionsInboxSemainePage = memo(function ActionsInboxSemainePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<ActionsInboxSemaineData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        cetteSemaine: 0,
        prochaineSemaine: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredActions = useMemo(() => {
    if (!data?.actions) return [];
    if (!searchQuery.trim()) return data.actions;
    
    const query = searchQuery.toLowerCase();
    return data.actions.filter(action => 
      action.title.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query) ||
      action.bureau.toLowerCase().includes(query) ||
      action.type.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Type', 'Titre', 'Bureau', 'Urgence', 'Délai', 'Montant', 'Statut', 'Échéance'];
    const rows = filteredActions.map(action => [
      action.id,
      action.type,
      action.title,
      action.bureau,
      action.urgency,
      action.delay,
      action.amountFormatted || '',
      action.status,
      new Date(action.dueDate).toLocaleDateString('fr-FR'),
    ]);
    exportToCSV(rows, headers, `actions-semaine-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredActions]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredActions, `actions-semaine-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredActions]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total cette semaine',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'cette-semaine',
      label: 'Cette semaine',
      value: stats.cetteSemaine,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'prochaine-semaine',
      label: 'Prochaine semaine',
      value: stats.prochaineSemaine,
      color: 'amber',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Icônes par type
  const typeIcons = {
    bc: FileText,
    paiement: DollarSign,
    contrat: Briefcase,
    arbitrage: Gavel,
    autre: FileText,
  };
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredActions[0]>['columns'] = useMemo(() => [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string, row) => {
        const Icon = typeIcons[value as keyof typeof typeIcons] || FileText;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300 text-sm uppercase">{value}</span>
          </div>
        );
      },
    },
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-slate-200">{value}</div>
          <div className="text-xs text-slate-400 mt-0.5">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'bureau',
      label: 'Bureau',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300">{value}</span>
      ),
    },
    {
      key: 'urgency',
      label: 'Urgence',
      sortable: true,
      render: (value: string) => {
        const urgencyColors = {
          critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          normal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[value as keyof typeof urgencyColors] || ''}`}>
            {value === 'critical' ? 'Critique' : value === 'warning' ? 'Urgente' : 'Normale'}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3 text-slate-400" />
          <span className="text-slate-300 text-sm">
            {new Date(value).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value: string) => {
        const statusColors = {
          pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[value as keyof typeof statusColors] || ''}`}>
            {value === 'pending' ? 'En attente' : value === 'in_progress' ? 'En cours' : 'Terminée'}
          </span>
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
          description={error.message || 'Impossible de charger les actions de la semaine'}
          icon={CalendarDays}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Actions Cette Semaine" description="Actions à traiter cette semaine">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des actions de la semaine</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher une action..."
                totalCount={data?.actions.length || 0}
                resultsCount={filteredActions.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredActions.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune action trouvée" : "Aucune action cette semaine"}
              description={
                searchQuery
                  ? `Aucune action de la semaine ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune action à traiter cette semaine."
              }
              icon={CalendarDays}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredActions}
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
