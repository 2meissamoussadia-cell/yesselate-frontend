/**
 * Page Circuit de Validation
 * Vue du circuit de validation et des workflows
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Workflow, GitBranch, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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
import { useDashboardData } from '../../hooks/useDashboardData';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import type { ValidationsCircuitData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';

export const ValidationsCircuitPage = memo(function ValidationsCircuitPage() {
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<ValidationsCircuitData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalCircuits: 0,
        actifs: 0,
        enUtilisation: 0,
        avecDelegation: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    if (!data?.circuits) return;
    const headers = ['ID', 'Nom', 'Type', 'Description', 'Étapes', 'Seuils', 'Actif', 'En utilisation', 'Délégation'];
    const rows = data.circuits.map(circuit => [
      circuit.id,
      circuit.name,
      circuit.documentType,
      circuit.description,
      circuit.steps.length.toString(),
      circuit.thresholds.length.toString(),
      circuit.isActive ? 'Oui' : 'Non',
      circuit.inUse ? 'Oui' : 'Non',
      circuit.hasDelegation ? 'Oui' : 'Non',
    ]);
    exportToCSV(rows, headers, `circuits-validation-${new Date().toISOString().split('T')[0]}.csv`);
  }, [data]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    if (!data?.circuits) return;
    exportToJSON(data.circuits, `circuits-validation-${new Date().toISOString().split('T')[0]}.json`);
  }, [data]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total circuits',
      value: stats.totalCircuits,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'actifs',
      label: 'Actifs',
      value: stats.actifs,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'en-utilisation',
      label: 'En utilisation',
      value: stats.enUtilisation,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'avec-delegation',
      label: 'Avec délégation',
      value: stats.avecDelegation,
      color: 'purple',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<NonNullable<typeof data>['circuits'][number]>['columns'] = useMemo(() => [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-blue-400" />
          <span className="font-medium text-slate-200">{value}</span>
        </div>
      ),
    },
    {
      key: 'documentType',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
          {value}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300 text-sm">{value}</span>
      ),
    },
    {
      key: 'steps',
      label: 'Étapes',
      sortable: true,
      align: 'right' as const,
      render: (value: any[]) => (
        <div className="flex items-center justify-end gap-1">
          <GitBranch className="h-3 w-3 text-slate-400" />
          <span className="font-semibold tabular-nums text-slate-200">{value.length}</span>
        </div>
      ),
    },
    {
      key: 'thresholds',
      label: 'Seuils',
      sortable: true,
      align: 'right' as const,
      render: (value: any[]) => (
        <span className="font-semibold tabular-nums text-slate-200">{value.length}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      render: (value: boolean, row) => (
        <div className="flex items-center gap-2">
          {value ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-slate-400" />
          )}
          <span className={cn(
            'text-sm',
            value ? 'text-emerald-300' : 'text-slate-400'
          )}>
            {value ? 'Actif' : 'Inactif'}
          </span>
        </div>
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
          description={error.message || 'Impossible de charger les circuits de validation'}
          icon={Workflow}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Circuit de Validation" description="Gestion des workflows de validation">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Circuits de validation</h3>
            <ExportButton 
              onExportCSV={handleExportCSV} 
              onExportJSON={handleExportJSON} 
            />
          </div>

          {!data?.circuits || data.circuits.length === 0 ? (
            <EmptyState
              title="Aucun circuit configuré"
              description="Il n'y a actuellement aucun circuit de validation configuré."
              icon={Workflow}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={data.circuits}
              columns={columns}
              pagination
              pageSize={10}
              searchable={true}
            />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
