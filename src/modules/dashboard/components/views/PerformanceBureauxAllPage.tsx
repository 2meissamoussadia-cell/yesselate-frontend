/**
 * Page Performance — Tous les bureaux
 * Vue consolidée de tous les bureaux.
 */

'use client';

import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel, KPICard, type KPICardData } from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

interface BureauxAllData {
  items?: { code: string; label: string; nbProjets: number; nbDemandes: number; tauxAvancement?: number }[];
  total?: number;
}

export const PerformanceBureauxAllPage = memo(function PerformanceBureauxAllPage(props: { data?: BureauxAllData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as BureauxAllData | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = typeof raw?.total === 'number' ? raw.total : items.length;
  const filtered = searchQuery.trim()
    ? items.filter(
        (b) =>
          b.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.label?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const kpis: KPICardData[] = [{ id: 'total', label: 'Bureaux', value: total, color: 'blue', trend: '+0%' }];

  return (
    <DashboardPageLayout>
      <DashboardSection title="Tous les bureaux" description="Vue consolidée des bureaux.">
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
            <EmptyState title="Aucun bureau" description={items.length === 0 ? "Aucun bureau." : "Aucun résultat."} icon={FileText} variant="info" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Libellé</th>
                    <th className="px-4 py-3">Projets</th>
                    <th className="px-4 py-3">Demandes</th>
                    <th className="px-4 py-3">Avancement</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.code} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono">{b.code}</td>
                      <td className="px-4 py-3">{b.label}</td>
                      <td className="px-4 py-3">{b.nbProjets ?? 0}</td>
                      <td className="px-4 py-3">{b.nbDemandes ?? 0}</td>
                      <td className="px-4 py-3">{b.tauxAvancement != null ? `${Math.round(b.tauxAvancement * 100)}%` : '—'}</td>
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
