'use client';

import React from 'react';
import { DynamicSidebar } from './DynamicSidebar';
import { DynamicSubnav } from './DynamicSubnav';
import { DashboardBreadcrumbs } from './DashboardBreadcrumbs';
import { DashboardKPIBar } from './DashboardKPIBar';
import { DashboardContentRouter } from './DashboardContentRouter';
import { DashboardFooter } from './DashboardFooter';
import { DashboardNotifications } from './DashboardNotifications';
import { cn } from '@/lib/utils';

export function DashboardCommandCenterPage() {
  return (
    <div className="relative flex h-screen w-full bg-slate-950 text-slate-100">
      {/* Background "pro" : sobre + radials légers */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0',
          '[background-image:radial-gradient(900px_circle_at_15%_0%,rgba(59,130,246,.14),transparent_40%),radial-gradient(900px_circle_at_85%_0%,rgba(16,185,129,.10),transparent_45%)]'
        )}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative flex h-full w-full">
        {/* Sidebar */}
        <DynamicSidebar />

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Header sticky : breadcrumbs + KPI strip */}
          <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
              <div className="py-4">
                <DashboardBreadcrumbs />
                <div className="mt-3">
                  <DashboardKPIBar />
                </div>
              </div>

              {/* Subnav */}
              <div className="pb-3">
                <DynamicSubnav />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6">
              <DashboardContentRouter />
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
