/**
 * Page KPIs Matériel
 * Vue détaillée des indicateurs de performance du matériel et maintenance
 */

'use client';

import React, { memo } from 'react';
import { Wrench, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import type { KpisMaterielData } from '../../types/dashboard.readmodels';
import { DashboardPageLayout, DashboardSection, DashboardGrid, DashboardPanel, KPICard } from '../shared';
import { formatKPIPercentage } from '../../utils/kpi';

interface MaterielKpiPageProps {
  data?: KpisMaterielData;
}

export const MaterielKpiPage = memo(function MaterielKpiPage({ data }: MaterielKpiPageProps = {}) {
  const materielData = data ?? {
    nbMateriel: 0,
    maintenanceOuverte: 0,
    backlogCuratif: 0,
    tauxDispo: 0,
  };

  const kpis: Array<{
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'emerald' | 'amber' | 'red';
    trend?: string;
  }> = [
    {
      label: 'Matériel total',
      value: materielData.nbMateriel,
      icon: Wrench,
      color: 'blue',
    },
    {
      label: 'Maintenances ouvertes',
      value: materielData.maintenanceOuverte,
      icon: AlertCircle,
      color: materielData.maintenanceOuverte > 0 ? 'amber' : 'emerald',
    },
    {
      label: 'Backlog curatif',
      value: materielData.backlogCuratif,
      icon: AlertCircle,
      color: materielData.backlogCuratif > 0 ? 'red' : 'emerald',
    },
    {
      label: 'Taux de disponibilité',
      value: formatKPIPercentage(materielData.tauxDispo),
      icon: CheckCircle2,
      color: materielData.tauxDispo > 0.8 ? 'emerald' : materielData.tauxDispo > 0.6 ? 'amber' : 'red',
    },
  ];

  return (
    <DashboardPageLayout title="KPIs Matériel" description="Indicateurs de performance du matériel et maintenance">
      <DashboardSection>
        <DashboardGrid cols={4}>
          {kpis.map((kpi, idx) => (
            <KPICard
              key={idx}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              trend={kpi.trend}
            />
          ))}
        </DashboardGrid>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
