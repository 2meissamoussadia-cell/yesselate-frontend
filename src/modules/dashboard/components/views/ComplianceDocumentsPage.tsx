/**
 * Page Compliance Documents Manquants
 * Vue des pièces manquantes pour la conformité
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { FileX, AlertCircle, FileText, Building2, CheckCircle2, Clock } from 'lucide-react';
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
import type { ComplianceDocumentsData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/cn';

export const ComplianceDocumentsPage = memo(function ComplianceDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useDashboardData<ComplianceDocumentsData>();
  
  const stats = useMemo(() => {
    if (!data) return { totalManquants: 0, critiques: 0, normaux: 0, enCours: 0 };
    return data.stats;
  }, [data]);
  
  const filtered = useMemo(() => {
    if (!data?.documents) return [];
    if (!searchQuery.trim()) return data.documents;
    const q = searchQuery.toLowerCase();
    return data.documents.filter(d => 
      d.type.toLowerCase().includes(q) || d.bureau.toLowerCase().includes(q) || (d.projet && d.projet.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);
  
  const handleExportCSV = useCallback(() => {
    const headers = ['Type', 'Projet', 'Bureau', 'Statut', 'Date échéance', 'Responsable'];
    const rows = filtered.map(d => [d.type, d.projet || '', d.bureau, d.statut, d.dateEcheance || '', d.responsable || '']);
    exportToCSV(rows, headers, `compliance-documents-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filtered]);
  
  const handleExportJSON = useCallback(() => exportToJSON(filtered, `compliance-documents-${new Date().toISOString().split('T')[0]}.json`), [filtered]);
  
  const kpis: KPICardData[] = useMemo(() => [
    { id: 'total', label: 'Total manquants', value: stats.totalManquants, color: 'rose', trend: '+0%' },
    { id: 'critiques', label: 'Critiques', value: stats.critiques, color: 'rose', trend: '+0%' },
    { id: 'normaux', label: 'Normaux', value: stats.normaux, color: 'amber', trend: '+0%' },
    { id: 'en-cours', label: 'En cours', value: stats.enCours, color: 'blue', trend: '+0%' },
  ], [stats]);
  
  const columns: DashboardDataTableProps<typeof filtered[0]>['columns'] = useMemo(() => [
    { key: 'type', label: 'Type', sortable: true, render: (v: string) => <span className="font-medium text-slate-200">{v}</span> },
    { key: 'projet', label: 'Projet', sortable: true, render: (v) => <span className="text-slate-300">{v ?? '-'}</span> },
    { key: 'bureau', label: 'Bureau', sortable: true, render: (v: string) => <div className="flex items-center gap-1"><Building2 className="h-3 w-3 text-slate-400" /><span className="text-slate-300">{v}</span></div> },
    { key: 'statut', label: 'Statut', sortable: true, render: (v: 'critique' | 'normal' | 'en-cours') => {
      const icons = { critique: <AlertCircle className="h-4 w-4 text-rose-400" />, normal: <FileText className="h-4 w-4 text-amber-400" />, 'en-cours': <Clock className="h-4 w-4 text-blue-400" /> };
      const colors = { critique: 'bg-rose-500/20 text-rose-300 border-rose-500/30', normal: 'bg-amber-500/20 text-amber-300 border-amber-500/30', 'en-cours': 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      return <div className="flex items-center gap-2">{icons[v]}<span className={cn('px-2 py-1 rounded-full text-xs font-medium border', colors[v])}>{v}</span></div>;
    }},
    { key: 'dateEcheance', label: 'Échéance', sortable: true, render: (v: string | undefined) => <span className="text-slate-300 text-sm">{v ? new Date(v).toLocaleDateString('fr-FR') : '-'}</span> },
  ], []);
  
  if (isLoading) return <DashboardPageSkeleton />;
  if (error) return (
    <DashboardPageLayout>
      <EmptyState title="Erreur de chargement" description={error.message || 'Impossible de charger les pièces manquantes'} icon={FileX} variant="error" />
    </DashboardPageLayout>
  );
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Pièces Manquantes" description="Documents manquants pour la conformité">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} size="md" />)}
        </div>
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des documents manquants</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." totalCount={data?.documents?.length ?? 0} resultsCount={filtered.length} />
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} />
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title={searchQuery ? "Aucun résultat" : "Aucun document manquant"} description={searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucune pièce manquante."} icon={FileX} variant="info" />
          ) : (
            <DashboardDataTable data={filtered} columns={columns} pagination pageSize={20} searchable={false} />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});

export default ComplianceDocumentsPage;
