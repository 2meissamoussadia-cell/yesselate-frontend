/**
 * Page Matériel Vue d'Ensemble
 * Vue d'ensemble du parc matériel
 */

'use client';

import React, { memo, useMemo } from 'react';
import { Wrench } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel, KPICard, type KPICardData } from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

interface MaterielOverviewData {
  nb_materiel?: number;
  maintenance_ouverte?: number;
  backlog_curatif?: number;
  taux_dispo?: number;
  items?: { id: string; code: string; libelle: string; statut: string; bureau?: string; lastControle?: string }[];
  total?: number;
}

export const MaterielOverviewPage = memo(function MaterielOverviewPage(props: { data?: MaterielOverviewData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as MaterielOverviewData | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = Number(raw?.nb_materiel) ?? items.length;
  const enService = useMemo(() => items.filter((m) => m.statut === 'en_service').length, [items]);
  const enMaintenance = Number(raw?.maintenance_ouverte) ?? items.filter((m) => m.statut === 'en_maintenance').length;
  const horsService = items.filter((m) => m.statut === 'hors_service').length;
  const filtered = searchQuery.trim()
    ? items.filter(
        (m) =>
          m.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.libelle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.bureau?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const kpis: KPICardData[] = [
    { id: 'total', label: 'Total équipements', value: total, color: 'blue', trend: '+0%' },
    { id: 'en-service', label: 'En service', value: enService, color: 'emerald', trend: '+0%' },
    { id: 'en-maintenance', label: 'En maintenance', value: enMaintenance, color: 'amber', trend: '+0%' },
    { id: 'hors-service', label: 'Hors service', value: horsService, color: 'red', trend: '+0%' },
  ];

  return (
    <DashboardPageLayout>
      <DashboardSection title="Parc Matériel" description="Vue d'ensemble du parc matériel">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste du matériel</h3>
            <div className="flex items-center gap-3">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher un équipement..." />
              <ExportButton onExportCSV={() => {}} onExportJSON={() => {}} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Aucun matériel disponible"
              description={items.length === 0 ? "Aucun matériel dans le parc." : "Aucun résultat pour cette recherche."}
              icon={Wrench}
              variant="info"
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Libellé</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Bureau</th>
                    <th className="px-4 py-3">Dernier contrôle</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono">{m.code}</td>
                      <td className="px-4 py-3">{m.libelle}</td>
                      <td className="px-4 py-3">
                        <span className={m.statut === 'en_service' ? 'text-emerald-400' : m.statut === 'en_maintenance' ? 'text-amber-400' : 'text-red-400'}>
                          {m.statut === 'en_service' ? 'En service' : m.statut === 'en_maintenance' ? 'En maintenance' : 'Hors service'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{m.bureau ?? '—'}</td>
                      <td className="px-4 py-3">{m.lastControle ?? '—'}</td>
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

export default MaterielOverviewPage;
