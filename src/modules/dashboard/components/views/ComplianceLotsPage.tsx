/**
 * Page Compliance Lots Non Attribués
 * Vue des lots non attribués nécessitant une action
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Package, AlertCircle, FileText, Building2, CheckCircle2, Clock } from 'lucide-react';
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
import type { ComplianceLotsData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/utils';

export const ComplianceLotsPage = memo(function ComplianceLotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useDashboardData<ComplianceLotsData>();
  
  const stats = useMemo(() => {
    if (!data) return { total: 0, critiques: 0, normaux: 0, enAttente: 0 };
    return data.stats;
  }, [data]);
  
  const filtered = useMemo(() => {
    if (!data?.lots) return [];
    if (!searchQuery.trim()) return data.lots;
    const q = searchQuery.toLowerCase();
    return data.lots.filter(l => l.lot.toLowerCase().includes(q) || l.bureau.toLowerCase().includes(q) || (l.projet && l.projet.toLowerCase().includes(q)));
  }, [data, searchQuery]);
  
  const handleExportCSV = useCallback(() => {
    const headers = ['Lot', 'Projet', 'Bureau', 'Statut', 'Valeur', 'Date création'];
    const rows = filtered.map(l => [l.lot, l.projet || '', l.bureau, l.statut, l.valeur != null ? formatMoneyEUR(l.valeur) : '', new Date(l.dateCreation).toLocaleDateString('fr-FR')]);
    exportToCSV(rows, headers, `compliance-lots-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filtered]);
  
  const handleExportJSON = useCallback(() => exportToJSON(filtered, `compliance-lots-${new Date().toISOString().split('T')[0]}.json`), [filtered]);
  
  const kpis: KPICardData[] = useMemo(() => [
    { id: 'total', label: 'Total non attribués', value: stats.total, color: 'rose', trend: '+0%' },
    { id: 'critiques', label: 'Critiques', value: stats.critiques, color: 'rose', trend: '+0%' },
    { id: 'normaux', label: 'Normaux', value: stats.normaux, color: 'amber', trend: '+0%' },
    { id: 'en-attente', label: 'En attente', value: stats.enAttente, color: 'blue', trend: '+0%' },
  ], [stats]);
  
  const columns: DashboardDataTableProps<typeof filtered[0]>['columns'] = useMemo(() => [
    { key: 'lot', label: 'Lot', sortable: true, render: (v: string) => <div className="flex items-center gap-2"><Package className="h-4 w-4 text-blue-400" /><span className="font-medium text-slate-200">{v}</span></div> },
    { key: 'projet', label: 'Projet', sortable: true, render: (v) => <span className="text-slate-300">{v ?? '-'}</span> },
    { key: 'bureau', label: 'Bureau', sortable: true, render: (v: string) => <div className="flex items-center gap-1"><Building2 className="h-3 w-3 text-slate-400" /><span className="text-slate-300">{v}</span></div> },
    { key: 'statut', label: 'Statut', sortable: true, render: (v: 'critique' | 'normal' | 'en-attente') => {
      const icons = { critique: <AlertCircle className="h-4 w-4 text-rose-400" />, normal: <FileText className="h-4 w-4 text-amber-400" />, 'en-attente': <Clock className="h-4 w-4 text-blue-400" /> };
      const colors = { critique: 'bg-rose-500/20 text-rose-300 border-rose-500/30', normal: 'bg-amber-500/20 text-amber-300 border-amber-500/30', 'en-attente': 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      return <div className="flex items-center gap-2">{icons[v]}<span className={cn('px-2 py-1 rounded-full text-xs font-medium border', colors[v])}>{v}</span></div>;
    }},
    { key: 'valeur', label: 'Valeur', sortable: true, align: 'right' as const, render: (v: number | undefined) => v != null ? <span className="font-semibold tabular-nums text-slate-200">{formatMoneyEUR(v)}</span> : <span className="text-slate-400">-</span> },
    { key: 'dateCreation', label: 'Création', sortable: true, render: (v: string) => <span className="text-slate-300 text-sm">{new Date(v).toLocaleDateString('fr-FR')}</span> },
  ], []);
  
  if (isLoading) return <DashboardPageSkeleton />;
  if (error) return (
    <DashboardPageLayout>
      <EmptyState title="Erreur de chargement" description={error.message || 'Impossible de charger les lots'} icon={Package} variant="error" />
    </DashboardPageLayout>
  );
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Lots Non Attribués" description="Lots non attribués nécessitant une action">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} size="md" />)}
        </div>
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des lots</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." totalCount={data?.lots?.length ?? 0} resultsCount={filtered.length} />
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} />
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title={searchQuery ? "Aucun résultat" : "Aucun lot non attribué"} description={searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucun lot non attribué."} icon={Package} variant="info" />
          ) : (
            <DashboardDataTable data={filtered} columns={columns} pagination pageSize={20} searchable={false} />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});

export default ComplianceLotsPage;
