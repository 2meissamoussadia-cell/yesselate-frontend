'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { PortalModuleCleanLayout } from '@/components/bmo/layout/PortalModuleCleanLayout';
import type { PortalModuleTab } from '@/components/bmo/layout/PortalModuleCleanLayout';

const opportunitiesTabs: PortalModuleTab[] = [
  {
    id: 'pipeline',
    label: 'Pipeline',
    path: '/maitre-ouvrage/opportunities',
    icon: Layers,
  },
];

export default function OpportunitiesLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <PortalModuleCleanLayout title="Opportunités & Programmes" tabs={opportunitiesTabs}>
      {children}
    </PortalModuleCleanLayout>
  );
}
