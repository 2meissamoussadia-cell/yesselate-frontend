/**
 * Page Tableau de bord Gouvernance avec DashboardViewLayout
 * Grille de widgets personnalisable (drag & drop)
 */

'use client';

import React from 'react';
import { useGouvernanceStats } from '../../hooks/useGouvernanceStats';
import { DashboardViewLayout } from '@/components/bmo/layout/DashboardViewLayout';
import { ModuleSubSidebar } from '@/components/bmo/ModuleSubSidebar';
import { governanceModuleConfig } from '@/lib/config/modules/governance.config';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  Target,
} from 'lucide-react';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export default function GovernanceWidgetsDashboardPage() {
  const { stats, isLoading } = useGouvernanceStats();
  const sections = governanceModuleConfig.subSidebar?.sections ?? [];

  const sidebar = (
    <ModuleSubSidebar
      sections={sections}
      selectedId="vue-generale"
      onSelect={() => {}}
      headerLabel={governanceModuleConfig.name}
    />
  );

  const sectionsConfig = [
    {
      id: 'kpis',
      title: 'Indicateurs clés',
      widgets: [
        {
          id: 'projets-actifs',
          type: 'stat' as const,
          title: 'Projets actifs',
          component: (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-100 dark:bg-sky-900/30 p-3">
                <Target className="h-8 w-8 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {isLoading ? '—' : stats?.projets_actifs ?? 0}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Projets en cours</p>
              </div>
            </div>
          ),
          defaultSize: { w: 3, h: 2 },
          refreshable: true,
          exportable: true,
        },
        {
          id: 'budget-consomme',
          type: 'stat' as const,
          title: 'Budget consommé',
          component: (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3">
                <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {isLoading ? '—' : stats?.budget_consomme_pourcent ?? 0}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Taux de consommation</p>
              </div>
            </div>
          ),
          defaultSize: { w: 3, h: 2 },
          refreshable: true,
          exportable: true,
        },
        {
          id: 'jalons-respectes',
          type: 'stat' as const,
          title: 'Jalons respectés',
          component: (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3">
                <Calendar className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {isLoading ? '—' : stats?.jalons_respectes_pourcent ?? 0}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Taux de respect</p>
              </div>
            </div>
          ),
          defaultSize: { w: 3, h: 2 },
          refreshable: true,
          exportable: true,
        },
        {
          id: 'risques-critiques',
          type: 'stat' as const,
          title: 'Risques critiques',
          component: (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'rounded-lg p-3',
                  (stats?.risques_critiques ?? 0) > 0
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <AlertTriangle
                  className={cn(
                    'h-8 w-8',
                    (stats?.risques_critiques ?? 0) > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {isLoading ? '—' : stats?.risques_critiques ?? 0}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">À traiter</p>
              </div>
            </div>
          ),
          defaultSize: { w: 3, h: 2 },
          refreshable: true,
          exportable: true,
        },
      ],
    },
    {
      id: 'validation',
      title: 'Validations & Décisions',
      widgets: [
        {
          id: 'validations-attente',
          type: 'stat' as const,
          title: 'Validations en attente',
          component: (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-3">
                <ClipboardCheck className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {isLoading ? '—' : stats?.validations_en_attente ?? 0}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">En attente de validation</p>
              </div>
            </div>
          ),
          defaultSize: { w: 4, h: 2 },
          refreshable: true,
          exportable: true,
        },
        {
          id: 'conformite',
          type: 'stat' as const,
          title: 'Taux de conformité',
          component: (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-100 dark:bg-teal-900/30 p-3">
                <TrendingUp className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {isLoading ? '—' : stats?.taux_conformite ?? 0}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Conformité globale</p>
              </div>
            </div>
          ),
          defaultSize: { w: 4, h: 2 },
          refreshable: true,
          exportable: true,
        },
      ],
    },
    {
      id: 'budget',
      title: 'Synthèse budgétaire',
      widgets: [
        {
          id: 'budget-total',
          type: 'stat' as const,
          title: 'Budget total',
          component: (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? '—' : formatNumber(stats?.budget_total ?? 0)} €
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Consommé : {formatNumber(stats?.budget_consomme ?? 0)} €
              </p>
            </div>
          ),
          defaultSize: { w: 4, h: 2 },
          refreshable: true,
          exportable: true,
        },
        {
          id: 'exposition-financiere',
          type: 'stat' as const,
          title: 'Exposition financière',
          component: (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? '—' : formatNumber(stats?.exposition_financiere ?? 0)} €
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Risques identifiés</p>
            </div>
          ),
          defaultSize: { w: 4, h: 2 },
          refreshable: true,
          exportable: true,
        },
      ],
      collapsible: true,
    },
  ];

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[500px] -m-2 sm:-m-4">
      <DashboardViewLayout
        className="!h-full !min-h-0"
        sidebar={sidebar}
        sidebarWidth={240}
        sections={sectionsConfig}
        editable
        onWidgetRefresh={(id) => {
          window.dispatchEvent(new CustomEvent('governance-refresh', { detail: { widgetId: id } }));
          window.location.reload();
        }}
        onWidgetExport={(id, format) => {
          console.log('Export', id, format);
        }}
      />
    </div>
  );
}
