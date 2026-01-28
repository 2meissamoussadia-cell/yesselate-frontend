/**
 * Page Traces d'Audit
 * Traces d'audit des décisions
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { FileSearch, FileText } from 'lucide-react';
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
import type { DecisionsViewData } from '../../types/dashboardDataTypes';

type DecisionRow = DecisionsViewData['rows'][number];

export const DecisionsAuditTracesPage = memo(function DecisionsAuditTracesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useDashboardData<DecisionsViewData>();

  const stats = useMemo(() => ({ total: data?.stats?.total ?? 0, ...data?.stats }), [data]);
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((v) => v != null && String(v).toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const handleExportCSV = useCallback(() => {
    if (filteredRows.length === 0) return;
    const allKeys = Array.from(new Set(filteredRows.flatMap((r) => Object.keys(r as object))));
    const headers = allKeys.length ? allKeys : ['id'];
    const rowsCsv = filteredRows.map((row) =>
      headers.map((key) => String((row as Record<string, unknown>)[key] ?? ''))
    );
    exportToCSV(rowsCsv, headers, `audit-traces-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredRows]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredRows, `audit-traces-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredRows]);

  const kpis: KPICardData[] = useMemo(
    () => [{ id: 'total', label: 'Total', value: stats.total, color: 'blue', trend: '+0%' }],
    [stats.total]
  );

  const columns: DashboardDataTableProps<DecisionRow>['columns'] = useMemo(() => {
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
          description={error.message || 'Impossible de charger les traces d\'audit'}
          icon={FileSearch}
          variant="error"
        />
      </DashboardPageLayout>
    );

  return (
    <DashboardPageLayout>
      <DashboardSection title="Traces d'Audit" description="Traces d'audit des décisions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} size="md" />)}
        </div>
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." />
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} />
            </div>
          </div>
          {filteredRows.length === 0 ? (
            <EmptyState
              title="Aucune trace d'audit"
              description="Il n'y a actuellement aucune trace d'audit."
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
