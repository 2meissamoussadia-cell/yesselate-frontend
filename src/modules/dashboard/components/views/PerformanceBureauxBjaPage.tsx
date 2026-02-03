/**
 * Page PerformanceBureauxBja
 * TODO: Ajouter description
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
import { EmptyState } from './EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

export const PerformanceBureauxBjaPage = memo(function PerformanceBureauxBjaPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // TODO: Charger les données depuis l'API
  const data = [];
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
      
      <DashboardSection title="PerformanceBureauxBja" description="TODO: Ajouter description">
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
            <div className="space-y-3">
              {/* TODO: Implémenter la liste */}
              <p className="text-slate-400 text-sm">Liste à implémenter</p>
            </div>
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
