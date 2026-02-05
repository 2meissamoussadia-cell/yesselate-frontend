/**
 * Page Actions Inbox Aujourd'hui
 * Vue des actions à traiter aujourd'hui
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Calendar, Clock, FileText, DollarSign, Briefcase, Gavel } from 'lucide-react';
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
import type { ActionsInboxAujourdhuiData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/cn';

export const ActionsInboxAujourdhuiPage = memo(function ActionsInboxAujourdhuiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<ActionsInboxAujourdhuiData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        enRetard: 0,
        aujourdhui: 0,
        terminees: 0,
        enCours: 0,
        nonDebutees: 0,
      };
    }
    
    const terminees = data.actions.filter(a => a.status === 'completed').length;
    const enCours = data.actions.filter(a => a.status === 'in_progress').length;
    const nonDebutees = data.actions.filter(a => a.status === 'pending').length;
    
    return {
      total: data.stats.total,
      enRetard: data.stats.enRetard,
      aujourdhui: data.stats.aujourdhui,
      terminees,
      enCours,
      nonDebutees,
    };
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
    exportToCSV(rows, headers, `actions-aujourdhui-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredActions]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredActions, `actions-aujourdhui-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredActions]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total aujourd\'hui',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'terminees',
      label: 'Terminées',
      value: stats.terminees,
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
      id: 'non-debutees',
      label: 'Non débutées',
      value: stats.nonDebutees,
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
  
  // ✅ Colonnes pour le tableau (même structure que ActionsInboxUrgentesPage)
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
      key: 'delay',
      label: 'Délai',
      sortable: true,
      render: (value: string, row) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-400" />
          <span className={cn(
            'text-sm',
            row.delayDays < 0 ? 'text-rose-400' : row.delayDays <= 1 ? 'text-amber-400' : 'text-slate-300'
          )}>
            {value}
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
          description={error.message || 'Impossible de charger les actions d\'aujourd\'hui'}
          icon={Calendar}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Actions Aujourd'hui" description="Actions à traiter aujourd'hui">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des actions d'aujourd'hui</h3>
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
              title={searchQuery ? "Aucune action trouvée" : "Aucune action aujourd'hui"}
              description={
                searchQuery
                  ? `Aucune action d'aujourd'hui ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune action à traiter aujourd'hui."
              }
              icon={Calendar}
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
