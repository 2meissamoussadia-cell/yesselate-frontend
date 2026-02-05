/**
 * Page Validations En Attente
 * Vue des validations en attente de traitement
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Clock, FileCheck, AlertCircle, FileText, DollarSign, Briefcase } from 'lucide-react';
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
import type { ValidationsEnAttenteData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/cn';

export const ValidationsEnAttentePage = memo(function ValidationsEnAttentePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<ValidationsEnAttenteData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        urgentes: 0,
        normales: 0,
        enRetard: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredValidations = useMemo(() => {
    if (!data?.validations) return [];
    if (!searchQuery.trim()) return data.validations;
    
    const query = searchQuery.toLowerCase();
    return data.validations.filter(validation => 
      validation.titre.toLowerCase().includes(query) ||
      validation.bureau.toLowerCase().includes(query) ||
      validation.demandeur.toLowerCase().includes(query) ||
      validation.type.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Type', 'Titre', 'Bureau', 'Demandeur', 'Montant', 'Date création', 'Date limite', 'Urgent', 'En retard'];
    const rows = filteredValidations.map(validation => [
      validation.id,
      validation.type,
      validation.titre,
      validation.bureau,
      validation.demandeur,
      validation.montantFormatted || '',
      new Date(validation.dateCreation).toLocaleDateString('fr-FR'),
      validation.dateLimite ? new Date(validation.dateLimite).toLocaleDateString('fr-FR') : '',
      validation.urgent ? 'Oui' : 'Non',
      validation.enRetard ? 'Oui' : 'Non',
    ]);
    exportToCSV(rows, headers, `validations-en-attente-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredValidations]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredValidations, `validations-en-attente-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredValidations]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total en attente',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'urgentes',
      label: 'Urgentes',
      value: stats.urgentes,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'normales',
      label: 'Normales',
      value: stats.normales,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'en-retard',
      label: 'En retard',
      value: stats.enRetard,
      color: 'amber',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Icônes par type
  const typeIcons = {
    bc: FileText,
    facture: DollarSign,
    avenant: Briefcase,
    autre: FileCheck,
  };
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredValidations[0]>['columns'] = useMemo(() => [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string, row) => {
        const Icon = typeIcons[value as keyof typeof typeIcons] || FileCheck;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300 text-sm uppercase">{value}</span>
          </div>
        );
      },
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
        <span className="text-slate-300">{value}</span>
      ),
    },
    {
      key: 'demandeur',
      label: 'Demandeur',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300">{value}</span>
      ),
    },
    {
      key: 'montantFormatted',
      label: 'Montant',
      sortable: true,
      align: 'right' as const,
      render: (value) => value ? (
        <span className="font-semibold tabular-nums text-slate-200">{value}</span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
    {
      key: 'dateLimite',
      label: 'Date limite',
      sortable: true,
      render: (value: string | undefined, row) => {
        if (!value) return <span className="text-slate-400">-</span>;
        const date = new Date(value);
        const isOverdue = row.enRetard;
        return (
          <div className="flex items-center gap-1">
            <Clock className={cn('h-3 w-3', isOverdue ? 'text-rose-400' : 'text-slate-400')} />
            <span className={cn('text-sm', isOverdue ? 'text-rose-400 font-medium' : 'text-slate-300')}>
              {date.toLocaleDateString('fr-FR')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'urgent',
      label: 'Urgent',
      sortable: true,
      render: (value: boolean) => (
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium border',
          value 
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        )}>
          {value ? 'Oui' : 'Non'}
        </span>
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
          description={error.message || 'Impossible de charger les validations en attente'}
          icon={FileCheck}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Validations En Attente" description="Validations nécessitant votre attention">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des validations</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher une validation..."
                totalCount={data?.validations.length || 0}
                resultsCount={filteredValidations.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredValidations.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune validation trouvée" : "Aucune validation en attente"}
              description={
                searchQuery
                  ? `Aucune validation en attente ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune validation en attente de traitement."
              }
              icon={FileCheck}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredValidations}
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
