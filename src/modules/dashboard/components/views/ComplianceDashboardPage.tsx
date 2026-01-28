/**
 * Page Compliance Synthèse
 * Vue d'ensemble de la conformité et compliance
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileX, BarChart3 } from 'lucide-react';
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
import type { ComplianceDashboardData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';

export const ComplianceDashboardPage = memo(function ComplianceDashboardPage() {
  const { data, isLoading, error } = useDashboardData<ComplianceDashboardData>();
  
  const stats = useMemo(() => {
    if (!data) return { tauxConformite: 0, documentsConformes: 0, documentsNonConformes: 0, enAttente: 0 };
    return data.stats;
  }, [data]);
  
  const handleExportCSV = useCallback(() => {
    if (!data?.compliance) return;
    const headers = ['Domaine', 'Conformes', 'Non conformes', 'En attente', 'Taux conformité %'];
    const rows = data.compliance.map(c => [
      c.domaine,
      c.conformes.toString(),
      c.nonConformes.toString(),
      c.enAttente.toString(),
      c.tauxConformite.toFixed(1),
    ]);
    exportToCSV(rows, headers, `compliance-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
  }, [data]);
  
  const handleExportJSON = useCallback(() => {
    if (!data?.compliance) return;
    exportToJSON(data.compliance, `compliance-dashboard-${new Date().toISOString().split('T')[0]}.json`);
  }, [data]);
  
  const kpis: KPICardData[] = useMemo(() => [
    { id: 'taux', label: 'Taux de conformité', value: `${stats.tauxConformite.toFixed(1)}%`, color: stats.tauxConformite >= 90 ? 'emerald' : stats.tauxConformite >= 70 ? 'amber' : 'rose', trend: '+0%' },
    { id: 'conformes', label: 'Conformes', value: stats.documentsConformes, color: 'emerald', trend: '+0%' },
    { id: 'non-conformes', label: 'Non conformes', value: stats.documentsNonConformes, color: 'rose', trend: '+0%' },
    { id: 'en-attente', label: 'En attente', value: stats.enAttente, color: 'amber', trend: '+0%' },
  ], [stats]);
  
  type ComplianceRow = ComplianceDashboardData['compliance'][number];
  const columns: DashboardDataTableProps<ComplianceRow>['columns'] = useMemo(() => [
    { key: 'domaine', label: 'Domaine', sortable: true, render: (v: string) => <span className="font-medium text-slate-200">{v}</span> },
    { key: 'conformes', label: 'Conformes', sortable: true, align: 'right' as const, render: (v: number) => <span className="font-semibold tabular-nums text-emerald-400">{v}</span> },
    { key: 'nonConformes', label: 'Non conformes', sortable: true, align: 'right' as const, render: (v: number) => <span className="font-semibold tabular-nums text-rose-400">{v}</span> },
    { key: 'enAttente', label: 'En attente', sortable: true, align: 'right' as const, render: (v: number) => <span className="font-semibold tabular-nums text-amber-400">{v}</span> },
    { key: 'tauxConformite', label: 'Taux %', sortable: true, align: 'right' as const, render: (v: number) => (
      <span className={cn('font-semibold tabular-nums', v >= 90 ? 'text-emerald-400' : v >= 70 ? 'text-amber-400' : 'text-rose-400')}>{v.toFixed(1)}%</span>
    )},
  ], []);
  
  if (isLoading) return <DashboardPageSkeleton />;
  if (error) return (
    <DashboardPageLayout>
      <EmptyState title="Erreur de chargement" description={error.message || 'Impossible de charger la synthèse compliance'} icon={ShieldCheck} variant="error" />
    </DashboardPageLayout>
  );
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Compliance Synthèse" description="Vue d'ensemble de la conformité">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} size="md" />)}
        </div>
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">État par domaine</h3>
            <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} />
          </div>
          {!data?.compliance?.length ? (
            <EmptyState title="Aucune donnée de conformité" description="Il n'y a actuellement aucune donnée de synthèse." icon={ShieldCheck} variant="info" />
          ) : (
            <DashboardDataTable data={data.compliance} columns={columns} pagination pageSize={20} searchable />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
