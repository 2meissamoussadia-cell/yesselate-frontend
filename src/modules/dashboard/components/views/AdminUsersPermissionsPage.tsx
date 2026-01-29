/**
 * Page Admin — Permissions par utilisateur
 * Gestion des permissions par utilisateur.
 */

'use client';

import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel, KPICard, type KPICardData } from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

interface AdminUsersPermissionsData {
  items?: { userId: string; permissions: string[]; roles: string[] }[];
  total?: number;
}

export const AdminUsersPermissionsPage = memo(function AdminUsersPermissionsPage(props: { data?: AdminUsersPermissionsData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as AdminUsersPermissionsData | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = typeof raw?.total === 'number' ? raw.total : items.length;
  const filtered = searchQuery.trim()
    ? items.filter(
        (r) =>
          r.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.roles?.some((x) => x.toLowerCase().includes(searchQuery.toLowerCase())) ||
          r.permissions?.some((x) => x.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items;

  const kpis: KPICardData[] = [{ id: 'total', label: 'Total', value: total, color: 'blue', trend: '+0%' }];

  return (
    <DashboardPageLayout>
      <DashboardSection title="Permissions par utilisateur" description="Gestion des permissions par utilisateur.">
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
            <EmptyState title="Aucun enregistrement" description={items.length === 0 ? "Aucune permission." : "Aucun résultat."} icon={FileText} variant="info" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Rôles</th>
                    <th className="px-4 py-3">Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.userId ?? i} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">{r.userId}</td>
                      <td className="px-4 py-3">{Array.isArray(r.roles) ? r.roles.join(', ') : '—'}</td>
                      <td className="px-4 py-3">{Array.isArray(r.permissions) ? r.permissions.join(', ') : '—'}</td>
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
