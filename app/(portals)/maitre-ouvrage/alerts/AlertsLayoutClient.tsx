'use client';

import React from 'react';
import { LayoutDashboard, AlertTriangle, FolderKanban, Clock, ShieldCheck } from 'lucide-react';
import { PortalModuleCleanLayout } from '@/components/bmo/layout/PortalModuleCleanLayout';
import type { PortalModuleTab } from '@/components/bmo/layout/PortalModuleCleanLayout';
import { alertsCenterSubNav } from '@/lib/navigation/subnav/alertsCenter';

const iconByTabId: Record<string, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  critical: AlertTriangle,
  projects: FolderKanban,
  sla: Clock,
  quality: ShieldCheck,
};

const alertsTabs: PortalModuleTab[] = (alertsCenterSubNav.tabs ?? []).map((tab: { id: string; label: string; path?: string }) => {
  const path = tab.path ?? `/maitre-ouvrage/alerts/${tab.id}`;
  const icon = iconByTabId[tab.id] ?? LayoutDashboard;
  return { id: tab.id, label: tab.label, path, icon };
});

export function AlertsLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <PortalModuleCleanLayout title={alertsCenterSubNav.title} tabs={alertsTabs}>
      {children}
    </PortalModuleCleanLayout>
  );
}
