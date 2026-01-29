/**
 * Page Admin — Paramètres KPIs
 * Configuration des indicateurs KPIs du tableau de bord.
 */

'use client';

import React, { memo } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  MockDataIndicator,
} from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

export const AdminSettingsKpisPage = memo(function AdminSettingsKpisPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Données à connecter via API
  const data: unknown[] = [];
  const stats = {
    total: 0,
  };

  const kpis: KPICardData[] = [
    {
      id: 'total',
      label: 'Total',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
  ];

  return (
    <DashboardPageLayout>
      <MockDataIndicator />
      
      <DashboardSection title="Paramètres KPIs" description="Configuration des KPIs.">
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

          {data.length === 0 ? (
            <EmptyState
              title="Aucun élément"
              description="Il n'y a actuellement aucun élément disponible."
              icon={FileText}
              variant="info"
            />
          ) : (
            <EmptyState
              title="Contenu à venir"
              description="Connectez l'API pour afficher les données."
              icon={FileText}
              variant="comingSoon"
            />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
