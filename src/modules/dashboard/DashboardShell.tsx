/**
 * DashboardShell (shell complet)
 *
 * Assemble Sidebar + zone principale avec KPIBar, Breadcrumbs, SubNavigation, ViewRouter.
 * À utiliser pour une page dashboard autonome (tout-en-un).
 *
 * Pour un layout seul (header + subnav + contenu, sans sidebar), utiliser
 * DashboardShell depuis components/shared/DashboardShell (alias DashboardShellShared).
 */

'use client';

import { useCallback } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { SkipLink } from '@/components/ui/skip-link';
import { DashboardSidebar } from './navigation/DashboardSidebar';
import { DashboardSubNavigation } from './navigation/DashboardSubNavigation';
import { DashboardKPIBar } from './components/DashboardKPIBar';
import { DashboardViewRouter } from './components/DashboardViewRouter';
import { DashboardBreadcrumbs } from './components/DashboardBreadcrumbs';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useAuthHeaders } from './utils/getAuthHeaders';

/**
 * Composant shell qui assemble tous les éléments du dashboard
 * Structure :
 * - Sidebar (navigation principale)
 * - Main content area avec :
 *   - Breadcrumbs (fil d'Ariane)
 *   - KPI Bar (barre d'indicateurs)
 *   - Sub Navigation (navigation secondaire)
 *   - View Router (contenu de la vue active)
 */
export function DashboardShell() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const authHeaders = useAuthHeaders();

  const onExport = useCallback(async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    const params = new URLSearchParams({
      main: nav.mainCategory || 'pilotage',
      format,
    });
    if (nav.subCategory) params.set('sub', nav.subCategory);
    if (nav.subSubCategory) params.set('leaf', nav.subSubCategory);

    const res = await fetch(`/api/export/dashboard?${params.toString()}`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cd = res.headers.get('Content-Disposition') ?? '';
    const match = /filename="([^"]+)"/.exec(cd);
    a.href = url;
    a.download = match?.[1] ?? `export.${format === 'excel' ? 'xls' : format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nav, authHeaders]);

  return (
    <div className="flex h-full">
      <SkipLink href="#dashboard-main-content" className="focus:bg-slate-800 focus:text-slate-100 focus:ring-blue-500 focus:ring-offset-slate-950">
        Aller au contenu principal
      </SkipLink>
      <DashboardSidebar />
      <main className="flex-1 min-w-0" aria-label="Tableau de bord maître d&#39;ouvrage">
        <div className="sticky top-0 z-[30]">
          <DashboardBreadcrumbs />
          <DashboardKPIBar onExport={onExport} />
          <DashboardSubNavigation />
        </div>
        <div id="dashboard-main-content" className="p-4" aria-label="Contenu du tableau de bord" data-testid="dashboard-content">
          <ErrorBoundary
            fallback={
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-6 min-h-[200px] flex items-center justify-center">
                <p className="text-slate-300">Une erreur s&apos;est produite. <button type="button" onClick={() => window.location.reload()} className="underline">Recharger la page</button>.</p>
              </div>
            }
          >
            <DashboardViewRouter />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
