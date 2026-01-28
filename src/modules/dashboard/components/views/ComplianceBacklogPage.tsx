/**
 * Page Compliance Backlog de Visas
 * Vue du backlog de visas en attente
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Clock, FileCheck, AlertCircle, Building2, Calendar } from 'lucide-react';
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
import type { ComplianceBacklogData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';

export const ComplianceBacklogPage = memo(function ComplianceBacklogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useDashboardData<ComplianceBacklogData>();
  
  const stats = useMemo(() => {
    if (!data) return { total: 0, enRetard: 0, cetteSemaine: 0, ceMois: 0 };
    return data.stats;
  }, [data]);
  
  const filtered = useMemo(() => {
    if (!data?.backlog) return [];
    if (!searchQuery.trim()) return data.backlog;
    const q = searchQuery.toLowerCase();
    return data.backlog.filter(b => b.type.toLowerCase().includes(q) || b.bureau.toLowerCase().includes(q) || (b.projet && b.projet.toLowerCase().includes(q)));
  }, [data, searchQuery]);
  
  const handleExportCSV = useCallback(() => {
    const headers = ['Type', 'Projet', 'Bureau', 'Date dépôt', 'Échéance', 'Statut', 'Jours attente'];
    const rows = filtered.map(b => [b.type, b.projet || '', b.bureau, new Date(b.dateDepot).toLocaleDateString('fr-FR'), b.dateEcheance ? new Date(b.dateEcheance).toLocaleDateString('fr-FR') : '', b.statut, b.joursAttente.toString()]);
    exportToCSV(rows, headers, `compliance-backlog-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filtered]);
  
  const handleExportJSON = useCallback(() => exportToJSON(filtered, `compliance-backlog-${new Date().toISOString().split('T')[0]}.json`), [filtered]);
  
  const kpis: KPICardData[] = useMemo(() => [
    { id: 'total', label: 'Total en attente', value: stats.total, color: 'blue', trend: '+0%' },
    { id: 'en-retard', label: 'En retard', value: stats.enRetard, color: 'rose', trend: '+0%' },
    { id: 'cette-semaine', label: 'Cette semaine', value: stats.cetteSemaine, color: 'amber', trend: '+0%' },
    { id: 'ce-mois', label: 'Ce mois', value: stats.ceMois, color: 'blue', trend: '+0%' },
  ], [stats]);
  
  const columns: DashboardDataTableProps<typeof filtered[0]>['columns'] = useMemo(() => [
    { key: 'type', label: 'Type', sortable: true, render: (v: string) => <span className="font-medium text-slate-200">{v}</span> },
    { key: 'projet', label: 'Projet', sortable: true, render: (v) => <span className="text-slate-300">{v ?? '-'}</span> },
    { key: 'bureau', label: 'Bureau', sortable: true, render: (v: string) => <div className="flex items-center gap-1"><Building2 className="h-3 w-3 text-slate-400" /><span className="text-slate-300">{v}</span></div> },
    { key: 'dateDepot', label: 'Date dépôt', sortable: true, render: (v: string) => <span className="text-slate-300 text-sm">{new Date(v).toLocaleDateString('fr-FR')}</span> },
    { key: 'statut', label: 'Statut', sortable: true, render: (v: 'en-retard' | 'cette-semaine' | 'ce-mois') => {
      const colors = { 'en-retard': 'bg-rose-500/20 text-rose-300 border-rose-500/30', 'cette-semaine': 'bg-amber-500/20 text-amber-300 border-amber-500/30', 'ce-mois': 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      return <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', colors[v])}>{v}</span>;
    }},
    { key: 'joursAttente', label: 'Jours', sortable: true, align: 'right' as const, render: (v: number) => <span className={cn('font-semibold tabular-nums', v > 7 ? 'text-rose-400' : 'text-slate-300')}>{v}</span> },
  ], []);
  
  if (isLoading) return <DashboardPageSkeleton />;
  if (error) return (
    <DashboardPageLayout>
      <EmptyState title="Erreur de chargement" description={error.message || 'Impossible de charger le backlog'} icon={Clock} variant="error" />
    </DashboardPageLayout>
  );
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Backlog de Visas" description="Visas en attente de traitement">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} size="md" />)}
        </div>
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste du backlog</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." totalCount={data?.backlog?.length ?? 0} resultsCount={filtered.length} />
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} />
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title={searchQuery ? "Aucun résultat" : "Aucun visa en attente"} description={searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucun visa en backlog."} icon={Clock} variant="info" />
          ) : (
            <DashboardDataTable data={filtered} columns={columns} pagination pageSize={20} searchable={false} />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
