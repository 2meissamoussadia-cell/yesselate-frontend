/**
 * Page Matériel Vue d'Ensemble
 * Vue d'ensemble du parc matériel
 */

'use client';

import React, { memo } from 'react';
import { Wrench, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export const MaterielOverviewPage = memo(function MaterielOverviewPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // TODO: Charger les données depuis l'API
  const materiel = [];
  const stats = {
    totalEquipements: 0,
    enService: 0,
    enMaintenance: 0,
    horsService: 0,
  };

  const kpis: KPICardData[] = [
    {
      id: 'total',
      label: 'Total équipements',
      value: stats.totalEquipements,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'en-service',
      label: 'En service',
      value: stats.enService,
      color: 'emerald',
      trend: '+0%',
    },
    {
      id: 'en-maintenance',
      label: 'En maintenance',
      value: stats.enMaintenance,
      color: 'amber',
      trend: '+0%',
    },
    {
      id: 'hors-service',
      label: 'Hors service',
      value: stats.horsService,
      color: 'red',
      trend: '+0%',
    },
  ];

  return (
    <DashboardPageLayout>
      <MockDataIndicator />
      
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
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un équipement..."
              />
              <ExportButton onExportCSV={() => {}} onExportJSON={() => {}} />
            </div>
          </div>

          {materiel.length === 0 ? (
            <EmptyState
              title="Aucun matériel disponible"
              description="Il n'y a actuellement aucun matériel dans le parc."
              icon={Wrench}
              variant="info"
            />
          ) : (
            <div className="space-y-3">
              {/* TODO: Implémenter la liste/tableau du matériel */}
              <p className="text-slate-400 text-sm">Liste du matériel à implémenter</p>
            </div>
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
