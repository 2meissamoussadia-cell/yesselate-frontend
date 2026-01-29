/**
 * Page Admin — Permissions et accès
 * Gestion des permissions et des accès au tableau de bord.
 */

'use client';

import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel, KPICard, type KPICardData } from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

interface AdminPermissionsAccesData {
  items?: { resource: string; actions: string[]; roles: string[] }[];
  total?: number;
}

export const AdminPermissionsAccesPage = memo(function AdminPermissionsAccesPage(props: { data?: AdminPermissionsAccesData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as AdminPermissionsAccesData | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = typeof raw?.total === 'number' ? raw.total : items.length;
  const filtered = searchQuery.trim()
    ? items.filter(
        (a) =>
          a.resource?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.roles?.some((x) => x.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items;

  const kpis: KPICardData[] = [{ id: 'total', label: 'Total', value: total, color: 'blue', trend: '+0%' }];

  return (
    <DashboardPageLayout>
      <DashboardSection title="Permissions et accès" description="Gestion des permissions et accès.">
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
            <EmptyState title="Aucun accès" description={items.length === 0 ? "Aucune règle d'accès." : "Aucun résultat."} icon={FileText} variant="info" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Ressource</th>
                    <th className="px-4 py-3">Actions</th>
                    <th className="px-4 py-3">Rôles</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.resource ?? i} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">{a.resource}</td>
                      <td className="px-4 py-3">{Array.isArray(a.actions) ? a.actions.join(', ') : '—'}</td>
                      <td className="px-4 py-3">{Array.isArray(a.roles) ? a.roles.join(', ') : '—'}</td>
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
