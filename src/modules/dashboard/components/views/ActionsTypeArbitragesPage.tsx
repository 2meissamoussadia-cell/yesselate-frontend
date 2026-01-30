/**
 * Page Actions Arbitrages
 * Actions de type arbitrage
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Scale, FileText } from 'lucide-react';
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
import type { ActionsViewData } from '../../types/dashboardDataTypes';
import { FilterBar } from '@/components/erp';
import type { ErpFilters } from '@/components/erp';

type ActionRow = ActionsViewData['rows'][number];

export const ActionsTypeArbitragesPage = memo(function ActionsTypeArbitragesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ErpFilters>({ statut: '', priorite: '' });
  const { data, isLoading, error } = useDashboardData<ActionsViewData>();

  const onFilterChange = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const stats = useMemo(() => ({ total: data?.stats?.total ?? 0, ...data?.stats }), [data]);
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const filteredRows = useMemo(() => {
    let list = rows;
    const statut = String(filters.statut ?? '').toLowerCase();
    if (statut) list = list.filter((row) => String((row as Record<string, unknown>).statut ?? '').toLowerCase() === statut);
    const priorite = String(filters.priorite ?? '').toLowerCase();
    if (priorite) list = list.filter((row) => String((row as Record<string, unknown>).priorite ?? '').toLowerCase() === priorite);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((row) =>
      Object.values(row).some((v) => v != null && String(v).toLowerCase().includes(q))
    );
  }, [rows, searchQuery, filters.statut, filters.priorite]);

  const handleExportCSV = useCallback(() => {
    if (filteredRows.length === 0) return;
    const allKeys = Array.from(new Set(filteredRows.flatMap((r) => Object.keys(r as object))));
    const headers = allKeys.length ? allKeys : ['id'];
    const rowsCsv = filteredRows.map((row) =>
      headers.map((key) => String((row as Record<string, unknown>)[key] ?? ''))
    );
    exportToCSV(rowsCsv, headers, `actions-arbitrages-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredRows]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredRows, `actions-arbitrages-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredRows]);

  const kpis: KPICardData[] = useMemo(
    () => [{ id: 'total', label: 'Total', value: stats.total, color: 'amber', trend: '+0%' }],
    [stats.total]
  );

  const columns: DashboardDataTableProps<ActionRow>['columns'] = useMemo(() => {
    const keys = rows.length ? Object.keys(rows[0] as object) : ['id'];
    return keys.slice(0, 8).map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      sortable: true,
      render: (v: unknown) => <span className="text-slate-200">{v != null ? String(v) : '—'}</span>,
    }));
  }, [rows]);

  if (isLoading) return <DashboardPageSkeleton />;
  if (error)
    return (
      <DashboardPageLayout>
        <EmptyState
          title="Erreur de chargement"
          description={error.message || 'Impossible de charger les actions arbitrages'}
          icon={Scale}
          variant="error"
        />
      </DashboardPageLayout>
    );

  return (
    <DashboardPageLayout>
      <DashboardSection title="Actions Arbitrages" description="Actions de type arbitrage">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} size="md" />)}
        </div>
        <DashboardPanel>
          <FilterBar
            filters={filters}
            onFilterChange={onFilterChange}
            options={{ statuts: ['Tous', 'En attente', 'En cours', 'Traité'], priorites: ['Toutes', 'Basse', 'Moyenne', 'Haute', 'Critique'] }}
            hideSections={['perimetre', 'dates', 'avances', 'savedViews']}
            className="mb-4 rounded-xl border-0 bg-transparent"
          />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." />
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} />
            </div>
          </div>
          {filteredRows.length === 0 ? (
            <EmptyState
              title="Aucune action arbitrage"
              description="Il n'y a actuellement aucune action de type arbitrage."
              icon={FileText}
              variant="info"
            />
          ) : (
            <DashboardDataTable data={filteredRows} columns={columns} pagination pageSize={20} searchable />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
