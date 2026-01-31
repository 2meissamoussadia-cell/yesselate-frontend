'use client';

import React, { useCallback, useEffect } from 'react';
import { DynamicSidebar } from './DynamicSidebar';
import { DynamicSubnav } from './DynamicSubnav';
import { DashboardBreadcrumbs } from './DashboardBreadcrumbs';
import { DashboardKPIBar } from './DashboardKPIBar';
import { DashboardViewRouter } from './DashboardViewRouter';
import { DashboardFooter } from './DashboardFooter';
import { DashboardModals } from './DashboardModals';
import { DashboardNotifications, useDashboardNotifications } from './DashboardNotifications';
import { AlertNotifications } from './AlertNotifications';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAuthHeaders } from '../utils/getAuthHeaders';

export function DashboardCommandCenterPage() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);
  const { locale, currency } = useI18n();
  const authHeaders = useAuthHeaders();
  const { notifications, dismissNotification, markAsRead } = useDashboardNotifications();

  // ? ouvre l'aide Raccourcis (hors champs de saisie)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.getAttribute?.('contenteditable') === 'true') return;
      e.preventDefault();
      openModal('shortcuts');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  const onExport = useCallback(async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    // Phase P12.b: Mapper 'excel' vers 'xlsx' pour le format natif
    const apiFormat = format === 'excel' ? 'xlsx' : format;
    
    const params = new URLSearchParams({
      main: nav.mainCategory || 'pilotage',
      format: apiFormat,
    });
    if (nav.subCategory) params.set('sub', nav.subCategory);
    if (nav.subSubCategory) params.set('leaf', nav.subSubCategory);

    // Phase P12.b: Ajouter locale/currency pour formats XLSX/PDF (formatage localisé)
    if (apiFormat === 'xlsx' || apiFormat === 'pdf') {
      params.set('locale', locale);
      params.set('currency', currency);
    }

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
    a.download = match?.[1] ?? `export.${format === 'excel' ? 'xlsx' : format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nav, locale, currency, authHeaders]);

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
              <ErrorBoundary>
                <DashboardViewRouter />
              </ErrorBoundary>
            </div>
            <DashboardFooter />
          </div>
        </main>

        {/* Modals globaux (KPI drill-down, raccourcis, etc.) */}
        <DashboardModals />

        {/* Notifications / drawer */}
        <DashboardNotifications
          notifications={notifications}
          onDismiss={dismissNotification}
          onMarkAsRead={markAsRead}
        />
        {/* Phase P15: Intégration alertes dans notifications */}
        <AlertNotifications />
      </div>
    </div>
  );
}
