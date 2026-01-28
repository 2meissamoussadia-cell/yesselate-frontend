/**
 * Page Validations Validées
 * Vue des validations validées
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { CheckCircle2, FileText, DollarSign, Briefcase, FileCheck } from 'lucide-react';
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
import type { ValidationsValideesData } from '../../types/dashboardDataTypes';

export const ValidationsValideesPage = memo(function ValidationsValideesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<ValidationsValideesData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        cetteSemaine: 0,
        ceMois: 0,
        tempsMoyen: 0,
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
      validation.type.toLowerCase().includes(query) ||
      validation.validePar.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Type', 'Titre', 'Bureau', 'Demandeur', 'Montant', 'Date validation', 'Validé par', 'Durée (jours)'];
    const rows = filteredValidations.map(validation => [
      validation.id,
      validation.type,
      validation.titre,
      validation.bureau,
      validation.demandeur,
      validation.montantFormatted || '',
      new Date(validation.dateValidation).toLocaleDateString('fr-FR'),
      validation.validePar,
      validation.dureeValidation.toString(),
    ]);
    exportToCSV(rows, headers, `validations-validees-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredValidations]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredValidations, `validations-validees-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredValidations]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total validées',
      value: stats.total,
      color: 'emerald',
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
      id: 'ce-mois',
      label: 'Ce mois',
      value: stats.ceMois,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'temps-moyen',
      label: 'Temps moyen',
      value: `${stats.tempsMoyen.toFixed(1)}j`,
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
      key: 'validePar',
      label: 'Validé par',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span className="text-slate-300">{value}</span>
        </div>
      ),
    },
    {
      key: 'dateValidation',
      label: 'Date validation',
      sortable: true,
      render: (value: string) => (
        <span className="text-slate-300 text-sm">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'dureeValidation',
      label: 'Durée',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums text-slate-200">{value}j</span>
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
        <span className="text-slate-500">-</span>
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
          description={error.message || 'Impossible de charger les validations validées'}
          icon={CheckCircle2}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Validations Validées" description="Historique des validations validées">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des validations validées</h3>
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
              title={searchQuery ? "Aucune validation trouvée" : "Aucune validation validée"}
              description={
                searchQuery
                  ? `Aucune validation validée ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune validation validée."
              }
              icon={CheckCircle2}
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
