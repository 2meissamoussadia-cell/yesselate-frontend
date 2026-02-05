/**
 * Maître d'Ouvrage — Page d'accueil (Dashboard général)
 * Tableau de bord avec widgets personnalisables (vue générale + performance).
 */

'use client';

import { useState } from 'react';
import { DashboardViewLayout } from '@/components/bmo/layout/DashboardViewLayout';
import { ModuleSubSidebar } from '@/components/bmo/ModuleSubSidebar';
import { dashboardModuleConfig } from '@/lib/config/modules/dashboard.config';
import { useDashboardData } from '@/lib/hooks/dashboard/useDashboardData';

import {
  KPICard,
  AlertesWidget,
  PlanningWidget,
  BudgetChart,
  ChantiersMap,
  ActivitesRecentes,
  TachesEnCours,
  PerformanceGauge,
  NCQualiteWidget,
  ValidationEnAttente,
} from '@/components/bmo/dashboard';

function formatCFA(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Md`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} k`;
  return n.toString();
}

export default function DashboardGeneralPage() {
  const { data, isLoading, refetch } = useDashboardData();
  const [layouts, setLayouts] = useState<Record<string, unknown>>({});

  const sections = dashboardModuleConfig.subSidebar?.sections ?? [];

  const sidebar = (
    <ModuleSubSidebar
      sections={sections}
      selectedId="vue-generale"
      onSelect={() => {}}
      headerLabel={dashboardModuleConfig.name}
    />
  );

  const vueGeneraleWidgets = [
    {
      id: 'kpi-chantiers-actifs',
      type: 'stat' as const,
      title: 'Chantiers actifs',
      component: (
        <KPICard
          value={data?.kpis.chantiersActifs ?? 0}
          label="chantiers en cours"
          trend={{ value: 2, direction: 'up' }}
          icon="Building2"
          color="blue"
        />
      ),
      defaultSize: { w: 3, h: 2 },
      minSize: { w: 2, h: 2 },
      refreshable: true,
    },
    {
      id: 'kpi-alertes-critiques',
      type: 'stat' as const,
      title: 'Alertes critiques',
      component: (
        <KPICard
          value={data?.kpis.alertesCritiques ?? 0}
          label="alertes à traiter"
          trend={{ value: -15, direction: 'down' }}
          icon="AlertTriangle"
          color="red"
        />
      ),
      defaultSize: { w: 3, h: 2 },
      refreshable: true,
    },
    {
      id: 'kpi-budget-global',
      type: 'stat' as const,
      title: 'Budget global',
      component: (
        <KPICard
          value={formatCFA(data?.kpis.budgetRealise ?? 0)}
          label="FCFA réalisés"
          subtitle={data?.kpis.budgetTotal ? `sur ${formatCFA(data.kpis.budgetTotal)} FCFA` : undefined}
          progress={data?.kpis.budgetPourcentage}
          icon="DollarSign"
          color="green"
        />
      ),
      defaultSize: { w: 3, h: 2 },
      refreshable: true,
    },
    {
      id: 'kpi-avancement-moyen',
      type: 'gauge' as const,
      title: 'Avancement moyen',
      component: (
        <PerformanceGauge
          value={data?.kpis.avancementMoyen ?? 0}
          label="Tous chantiers"
          thresholds={{ warning: 70, critical: 50 }}
        />
      ),
      defaultSize: { w: 3, h: 2 },
      refreshable: true,
    },
    {
      id: 'alertes-recentes',
      type: 'list' as const,
      title: 'Alertes récentes',
      component: <AlertesWidget alertes={(data?.alertes ?? []) as any} />,
      defaultSize: { w: 4, h: 4 },
      minSize: { w: 3, h: 3 },
      refreshable: true,
    },
    {
      id: 'planning-semaine',
      type: 'chart' as const,
      title: 'Planning de la semaine',
      component: <PlanningWidget taches={data?.planning ?? []} />,
      defaultSize: { w: 8, h: 4 },
      minSize: { w: 6, h: 3 },
      refreshable: true,
    },
    {
      id: 'budget-evolution',
      type: 'chart' as const,
      title: 'Évolution budgétaire',
      component: <BudgetChart data={(data?.budgetEvolution ?? []) as any} type="area" />,
      defaultSize: { w: 6, h: 4 },
      minSize: { w: 4, h: 3 },
      refreshable: true,
      exportable: true,
    },
    {
      id: 'chantiers-map',
      type: 'custom' as const,
      title: 'Carte des chantiers',
      component: <ChantiersMap chantiers={data?.chantiers ?? []} />,
      defaultSize: { w: 6, h: 4 },
      minSize: { w: 4, h: 3 },
    },
    {
      id: 'activites-recentes',
      type: 'list' as const,
      title: 'Activités récentes',
      component: <ActivitesRecentes activites={data?.activites ?? []} />,
      defaultSize: { w: 4, h: 5 },
      minSize: { w: 3, h: 4 },
      refreshable: true,
    },
    {
      id: 'taches-en-cours',
      type: 'table' as const,
      title: 'Mes tâches en cours',
      component: <TachesEnCours taches={data?.mesTaches ?? []} />,
      defaultSize: { w: 8, h: 5 },
      minSize: { w: 6, h: 4 },
      refreshable: true,
    },
  ];

  const performanceWidgets = [
    {
      id: 'perf-planning',
      type: 'gauge' as const,
      title: 'Respect planning',
      component: (
        <PerformanceGauge
          value={data?.performance.planning ?? 0}
          label="Performance planning"
          thresholds={{ warning: 80, critical: 60 }}
        />
      ),
      defaultSize: { w: 3, h: 3 },
    },
    {
      id: 'perf-budget',
      type: 'gauge' as const,
      title: 'Respect budget',
      component: (
        <PerformanceGauge
          value={data?.performance.budget ?? 0}
          label="Performance budgétaire"
          thresholds={{ warning: 85, critical: 70 }}
        />
      ),
      defaultSize: { w: 3, h: 3 },
    },
    {
      id: 'perf-qualite',
      type: 'gauge' as const,
      title: 'Qualité',
      component: (
        <PerformanceGauge
          value={data?.performance.qualite ?? 0}
          label="Performance qualité"
          thresholds={{ warning: 90, critical: 75 }}
        />
      ),
      defaultSize: { w: 3, h: 3 },
    },
    {
      id: 'perf-securite',
      type: 'gauge' as const,
      title: 'Sécurité',
      component: (
        <PerformanceGauge
          value={data?.performance.securite ?? 0}
          label="Performance sécurité"
          thresholds={{ warning: 95, critical: 85 }}
        />
      ),
      defaultSize: { w: 3, h: 3 },
    },
    {
      id: 'nc-qualite',
      type: 'list' as const,
      title: 'Non-conformités qualité',
      component: <NCQualiteWidget nc={data?.ncQualite ?? []} />,
      defaultSize: { w: 6, h: 4 },
    },
    {
      id: 'validation-attente',
      type: 'list' as const,
      title: 'Validations en attente',
      component: <ValidationEnAttente validations={data?.validations ?? []} />,
      defaultSize: { w: 6, h: 4 },
    },
  ];

  const sectionsConfig = [
    {
      id: 'vue-generale',
      title: 'Vue générale',
      widgets: vueGeneraleWidgets,
    },
    {
      id: 'performance',
      title: 'Performance',
      widgets: performanceWidgets,
      collapsible: true,
      defaultCollapsed: false,
    },
  ];

  const handleLayoutChange = (newLayout: unknown) => {
    setLayouts((prev) => ({ ...prev, layout: newLayout }));
    try {
      localStorage.setItem('dashboard-general-layout', JSON.stringify(newLayout));
    } catch {
      // ignore
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] min-h-[500px] -m-2 sm:-m-4">
      <DashboardViewLayout
        className="!h-full !min-h-0"
        sidebar={sidebar}
        sections={sectionsConfig}
        editable
        onLayoutChange={handleLayoutChange}
        onWidgetRefresh={() => refetch()}
        onWidgetExport={(id, format) => {
          console.log(`Export ${id} en ${format}`);
        }}
      />
    </div>
  );
}
