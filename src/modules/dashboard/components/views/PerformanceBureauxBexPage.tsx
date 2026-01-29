/**
 * Page Performance — Bureau BEX
 */

'use client';

import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel, KPICard, type KPICardData } from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

interface BureauSingleData {
  bureau?: { code: string; label: string };
  items?: { id: string; nom: string; statut: string; avancement?: number }[];
  total?: number;
}

export const PerformanceBureauxBexPage = memo(function PerformanceBureauxBexPage(props: { data?: BureauSingleData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as BureauSingleData | undefined;
  const bureau = raw?.bureau ?? { code: 'bex', label: 'BEX' };
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = typeof raw?.total === 'number' ? raw.total : items.length;
  const filtered = searchQuery.trim() ? items.filter((p) => p.nom?.toLowerCase().includes(searchQuery.toLowerCase())) : items;
  const kpis: KPICardData[] = [{ id: 'total', label: 'Projets', value: total, color: 'blue', trend: '+0%' }];
  return (
    <DashboardPageLayout>
      <DashboardSection title={`Bureau ${bureau.label}`} description={`Indicateurs du bureau ${bureau.label}.`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Projets</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." />
              <ExportButton onExportCSV={() => {}} onExportJSON={() => {}} />
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="Aucun projet" description={items.length === 0 ? "Aucun projet pour ce bureau." : "Aucun résultat."} icon={FileText} variant="info" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Projet</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Avancement</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">{p.nom}</td>
                      <td className="px-4 py-3">{p.statut}</td>
                      <td className="px-4 py-3">{p.avancement != null ? `${p.avancement}%` : '—'}</td>
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
