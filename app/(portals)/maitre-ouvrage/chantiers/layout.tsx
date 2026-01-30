'use client';

import React from 'react';
import { FolderKanban, MapPin, Calendar, LayoutGrid } from 'lucide-react';
import { PortalModuleCleanLayout } from '@/components/bmo/layout/PortalModuleCleanLayout';
import type { PortalModuleTab } from '@/components/bmo/layout/PortalModuleCleanLayout';
import { projectsProgramsSubNav } from '@/lib/navigation/subnav/projectsPrograms';

const chantiersTabs: PortalModuleTab[] = (projectsProgramsSubNav.tabs ?? []).map((tab) => {
  const path = tab.path ?? `/maitre-ouvrage/chantiers/${tab.id}`;
  const icon =
    tab.id === 'programs'
      ? LayoutGrid
      : tab.id === 'projects'
        ? FolderKanban
        : tab.id === 'map'
          ? MapPin
          : Calendar;
  return { id: tab.id, label: tab.label, path, icon };
});

export default function ChantiersLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalModuleCleanLayout title={projectsProgramsSubNav.title} tabs={chantiersTabs}>
      {children}
    </PortalModuleCleanLayout>
  );
}
