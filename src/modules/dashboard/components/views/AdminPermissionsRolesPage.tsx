/**
 * Page Admin — Rôles et permissions
 * Gestion des rôles et des permissions.
 */

'use client';

import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel, KPICard, type KPICardData } from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

interface AdminPermissionsRolesData {
  items?: { id: string; label: string; count: number }[];
  total?: number;
}

export const AdminPermissionsRolesPage = memo(function AdminPermissionsRolesPage(props: { data?: AdminPermissionsRolesData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as AdminPermissionsRolesData | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = typeof raw?.total === 'number' ? raw.total : items.length;
  const filtered = searchQuery.trim()
    ? items.filter((r) => r.id?.toLowerCase().includes(searchQuery.toLowerCase()) || r.label?.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const kpis: KPICardData[] = [{ id: 'total', label: 'Total', value: total, color: 'blue', trend: '+0%' }];

  return (
    <DashboardPageLayout>
      <DashboardSection title="Rôles et permissions" description="Gestion des rôles.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." />
              <ExportButton onExportCSV={() => {}} onExportJSON={() => {}} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="Aucun rôle" description={items.length === 0 ? "Aucun rôle défini." : "Aucun résultat."} icon={FileText} variant="info" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Libellé</th>
                    <th className="px-4 py-3">Utilisateurs</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono">{r.id}</td>
                      <td className="px-4 py-3">{r.label}</td>
                      <td className="px-4 py-3">{r.count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
