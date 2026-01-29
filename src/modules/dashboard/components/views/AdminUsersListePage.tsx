/**
 * Page Admin — Liste des utilisateurs
 * Gestion de la liste des utilisateurs du tableau de bord.
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

interface AdminUsersListeData {
  items?: { id: string; email: string; nom: string; role: string; actif: boolean; lastLogin?: string }[];
  total?: number;
}

export const AdminUsersListePage = memo(function AdminUsersListePage(props: { data?: AdminUsersListeData | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const raw = props.data as AdminUsersListeData | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const total = typeof raw?.total === 'number' ? raw.total : items.length;
  const filtered = searchQuery.trim()
    ? items.filter(
        (u) =>
          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.role?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const kpis: KPICardData[] = [
    { id: 'total', label: 'Total', value: total, color: 'blue', trend: '+0%' },
  ];

  return (
    <DashboardPageLayout>
      <DashboardSection title="Liste des utilisateurs" description="Gestion des utilisateurs du tableau de bord.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher..."
              />
              <ExportButton onExportCSV={() => {}} onExportJSON={() => {}} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Aucun utilisateur"
              description={items.length === 0 ? "Aucun utilisateur pour le moment." : "Aucun résultat pour cette recherche."}
              icon={FileText}
              variant="info"
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Actif</th>
                    <th className="px-4 py-3">Dernière connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.nom}</td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3">{u.actif ? 'Oui' : 'Non'}</td>
                      <td className="px-4 py-3">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}</td>
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
