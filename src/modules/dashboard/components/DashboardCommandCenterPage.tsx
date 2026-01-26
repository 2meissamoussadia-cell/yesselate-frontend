'use client';

import React, { useCallback } from 'react';
import { DynamicSidebar } from './DynamicSidebar';
import { DynamicSubnav } from './DynamicSubnav';
import { DashboardBreadcrumbs } from './DashboardBreadcrumbs';
import { DashboardKPIBar } from './DashboardKPIBar';
import { DashboardViewRouter } from './DashboardViewRouter';
import { DashboardFooter } from './DashboardFooter';
import { DashboardNotifications } from './DashboardNotifications';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { cn } from '@/lib/utils';

export function DashboardCommandCenterPage() {
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
    <div
      className={
        "relative flex h-screen w-full text-slate-100 " +
        "bg-slate-950 " +
        "bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(56,189,248,.10),transparent_42%)," +
        "radial-gradient(900px_circle_at_80%_10%,rgba(167,139,250,.08),transparent_45%)]"
      }
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative flex h-full w-full">
        {/* Sidebar */}
        <DynamicSidebar />

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Header sticky : breadcrumbs + KPI strip */}
          <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl min-w-0">
            <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8">
              <div className="py-4">
                <DashboardBreadcrumbs />
                <div className="mt-3">
                  <DashboardKPIBar onExport={onExport} />
                </div>
              </div>

              {/* Subnav */}
              <div className="pb-3">
                <DynamicSubnav />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-auto">
            <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6">
              <DashboardViewRouter />
            </div>
            <DashboardFooter />
          </div>
        </main>

        {/* Notifications / drawer */}
        <DashboardNotifications />
      </div>
    </div>
  );
}
