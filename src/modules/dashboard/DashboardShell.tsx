/**
 * Shell principal du Dashboard
 * Assemble tous les composants de navigation et d'affichage
 */

'use client';

import { useCallback } from 'react';
import { DashboardSidebar } from './navigation/DashboardSidebar';
import { DashboardSubNavigation } from './navigation/DashboardSubNavigation';
import { DashboardKPIBar } from './components/DashboardKPIBar';
import { DashboardViewRouter } from './components/DashboardViewRouter';
import { DashboardBreadcrumbs } from './components/DashboardBreadcrumbs';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

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

  const onExport = useCallback(async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    const params = new URLSearchParams({
      main: nav.mainCategory || 'overview',
      format,
    });
    if (nav.subCategory) params.set('sub', nav.subCategory);
    if (nav.subSubCategory) params.set('leaf', nav.subSubCategory);

    const res = await fetch(`/api/export/dashboard?${params.toString()}`, {
      headers: {
        'x-tenant-id': 'default', // TODO: récupérer depuis le contexte auth
        'x-user-id': 'anonymous', // TODO: récupérer depuis le contexte auth
      },
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
  }, [nav]);

  return (
    <div className="flex h-full">
      <DashboardSidebar />
      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-20">
          <DashboardBreadcrumbs />
          <DashboardKPIBar onExport={onExport} />
          <DashboardSubNavigation />
        </div>
        <div className="p-4">
          <DashboardViewRouter />
        </div>
      </main>
    </div>
  );
}
