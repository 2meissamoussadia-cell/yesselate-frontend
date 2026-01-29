/**
 * Page Admin — Logs d'activité
 * Logs d'activité des utilisateurs du tableau de bord.
 */

'use client';

import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

interface AdminLogsActiviteData {
  items?: { id: string; userId: string; action: string; at: string; details?: Record<string, unknown> }[];
  total?: number;
}

export const AdminLogsActivitePage = memo(function AdminLogsActivitePage(props: { data?: AdminLogsActiviteData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as AdminLogsActiviteData | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = typeof raw?.total === 'number' ? raw.total : items.length;
  const filtered = searchQuery.trim()
    ? items.filter(
        (l) =>
          l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.userId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const kpis: KPICardData[] = [{ id: 'total', label: 'Total', value: total, color: 'blue', trend: '+0%' }];

  return (
    <DashboardPageLayout>
      <DashboardSection title="Logs d'activité" description="Logs d'activité des utilisateurs.">
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
            <EmptyState
              title="Aucun log"
              description={items.length === 0 ? "Aucun log d'activité." : "Aucun résultat pour cette recherche."}
              icon={FileText}
              variant="info"
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono text-xs">{l.id}</td>
                      <td className="px-4 py-3">{l.userId}</td>
                      <td className="px-4 py-3">{l.action}</td>
                      <td className="px-4 py-3">{l.at ? new Date(l.at).toLocaleString() : '—'}</td>
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
