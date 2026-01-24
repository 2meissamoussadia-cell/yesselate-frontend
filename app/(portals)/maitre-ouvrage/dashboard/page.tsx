/* -----------------------------------------------------------------------
   FILE: app/maitre-ouvrage/dashboard/page.tsx
   VERSION: 6.0 - ENTERPRISE SHELL (UI MÉTIER)
   Objectifs:
   - Header clair + breadcrumbs + actions
   - KPI Bar dédiée (boutons réels + z-index clean)
   - Fond sobre (moins "gradient demo", plus "produit")
   - Aucun calque décoratif ne doit capter les clics
------------------------------------------------------------------------ */

'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { cn } from '@/lib/utils';
import { Command, Settings2 } from 'lucide-react';

import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory } from '@/modules/dashboard/types/dashboardNavigationTypes';

import {
  DashboardSidebar,
  DashboardSubNavigation,
  DashboardUrlSync,
  DashboardViewRouter,
  DashboardKPIBar,
  DashboardBreadcrumbs,
} from '@/modules/dashboard';

import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';

function DashboardSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-slate-800" />
        <p className="text-slate-400 text-sm">Chargement du dashboard…</p>
      </div>
    </div>
  );
}

function ContentLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="h-10 bg-slate-900/60 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl border border-slate-800/70 bg-slate-900/40" />
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-slate-800/70 bg-slate-900/40" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <TooltipProvider delayDuration={150}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </TooltipProvider>
  );
}

function DashboardContent() {
  // Store navigation (source unique)
  const navigation = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const sidebarCollapsed = useDashboardCommandCenterStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useDashboardCommandCenterStore((s) => s.toggleSidebar);
  const toggleCommandPalette = useDashboardCommandCenterStore((s) => s.toggleCommandPalette);
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);

  const { mainCategory, subCategory, subSubCategory } = navigation;

  // KPIs (API)
  const {
    kpis: apiKpis,
    isLoading: kpisLoading,
    error: kpisError,
    lastUpdate: apiLastUpdate,
    refetch: refetchKPIsFromAPI,
  } = useDashboardKPIs('year');

  const kpis = useMemo(() => {
    // fallback si API vide
    if (!apiKpis || apiKpis.length === 0) {
      return [
        { id: 'demandes', label: 'Demandes', value: 247, delta: '+12', tone: 'ok', trend: 'up' },
        { id: 'validations', label: 'Validations', value: '89%', delta: '+3%', tone: 'ok', trend: 'up' },
        { id: 'blocages', label: 'Blocages', value: 5, delta: '-2', tone: 'warn', trend: 'down' },
        { id: 'risques', label: 'Risques critiques', value: 3, delta: '+1', tone: 'crit', trend: 'up' },
        { id: 'budget', label: 'Budget consommé', value: '67%', delta: '—', tone: 'info', trend: 'neutral' },
        { id: 'decisions', label: 'Décisions en attente', value: 8, delta: '—', tone: 'warn', trend: 'neutral' },
        { id: 'sla', label: 'Conformité SLA', value: '94%', delta: '+2%', tone: 'ok', trend: 'up' },
      ] as const;
    }
    return apiKpis.map((k) => ({
      id: k.id ?? k.label.toLowerCase().replace(/\s+/g, '-'),
      label: k.label,
      value: k.value,
      delta: k.delta,
      tone: k.tone,
      trend: k.trend,
    }));
  }, [apiKpis]);

  const lastUpdate = useMemo(() => (apiLastUpdate ? new Date(apiLastUpdate) : new Date()), [apiLastUpdate]);

  // Stats sidebar (exemple)
  const stats = useMemo(
    () => ({
      overview: 3,
      performance: 5,
      actions: 12,
      risks: 4,
      decisions: 8,
      realtime: 2,
    }),
    []
  );

  const handleCategoryChange = useCallback(
    (category: string, subCat?: string) => {
      navigate(category as DashboardMainCategory, subCat || null, null);
    },
    [navigate]
  );

  const handleSubCategoryChange = useCallback(
    (subCat: string) => {
      navigate(mainCategory, subCat, null);
    },
    [navigate, mainCategory]
  );

  const handleSubSubCategoryChange = useCallback(
    (subSubCat: string, subCat?: string) => {
      navigate(mainCategory, subCat || subCategory, subSubCat);
    },
    [navigate, mainCategory, subCategory]
  );

  const handleKPIClick = useCallback(
    (kpi: { label: string }) => {
      const mapping = getKPIMappingByLabel(kpi.label);
      if (mapping) openModal('kpi-drilldown', { kpiId: mapping.metadata.id, label: kpi.label });
      else openModal('kpi-drilldown', { label: kpi.label });
    },
    [openModal]
  );

  const handleExport = useCallback(() => {
    openModal('export');
  }, [openModal]);

  return (
    <>
      <DashboardUrlSync />

      <div className="h-full w-full flex min-h-0">
        <DashboardSidebar
          activeCategory={mainCategory}
          activeSubCategory={subCategory || undefined}
          collapsed={sidebarCollapsed}
          stats={stats}
          onCategoryChange={handleCategoryChange}
          onToggleCollapse={toggleSidebar}
          onOpenCommandPalette={toggleCommandPalette}
        />

        {/* CONTENT */}
        <section
          className={cn(
            'flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden',
            // Fond sobre "produit"
            'bg-slate-950'
          )}
          role="main"
          aria-label="Dashboard maître d'ouvrage"
        >
          {/* Header "Produit" */}
          <header className="relative z-20 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-xl">
            {/* décor: ne capte jamais les clics */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 0%, rgba(59,130,246,0.16) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.10) 0%, transparent 35%)',
              }}
            />
            <div className="relative px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DashboardBreadcrumbs />
                <h1 className="mt-1 text-lg sm:text-xl font-semibold tracking-tight text-slate-100 truncate" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
                  Tableau de bord — Maître d'ouvrage
                </h1>
                <p className="text-xs text-slate-400 mt-1" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
                  Pilotage, risques, décisions et exécution — vue consolidée.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-3 py-2',
                    'border border-slate-800/70 bg-slate-900/40',
                    'text-slate-200 font-medium',
                    'hover:bg-slate-900/60 hover:border-slate-700',
                    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    'min-h-[32px]'
                  )}
                  style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                  onClick={toggleCommandPalette}
                >
                  <Command className="h-4 w-4 text-slate-300" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
                  Commandes
                  <span className="ml-1 rounded-md bg-slate-800/70 px-1.5 py-0.5 text-slate-300" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>
                    Ctrl K
                  </span>
                </button>

                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center justify-center rounded-xl p-2',
                    'border border-slate-800/70 bg-slate-900/40',
                    'text-slate-200',
                    'hover:bg-slate-900/60 hover:border-slate-700',
                    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    'min-h-[32px] min-w-[32px]'
                  )}
                  onClick={() => openModal('settings')}
                  aria-label="Paramètres du dashboard"
                >
                  <Settings2 className="h-4 w-4" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4">
              <DashboardSubNavigation
                mainCategory={mainCategory}
                subCategory={subCategory || undefined}
                subSubCategory={subSubCategory || undefined}
                onSubCategoryChange={handleSubCategoryChange}
                onSubSubCategoryChange={handleSubSubCategoryChange}
                stats={stats}
              />
            </div>
          </header>

          {/* KPI BAR (propre, cliquable, moderne) */}
          <div className="relative z-10 border-b border-slate-800/60 bg-slate-950/60">
            <DashboardKPIBar
              kpis={kpis}
              onKPIClick={(kpi) => handleKPIClick({ label: kpi.label })}
              onRefresh={async () => {
                await refetchKPIsFromAPI?.();
              }}
              onExport={handleExport}
              compact={true}
              lastUpdate={lastUpdate}
            />
          </div>

          {/* Main */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-4 sm:p-6 max-w-[1920px] mx-auto w-full dashboard-container">
              <ErrorBoundary>
                <Suspense fallback={<ContentLoadingSkeleton />}>
                  <DashboardViewRouter />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
