'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { PortalModuleCleanLayout } from '@/components/bmo/layout/PortalModuleCleanLayout';
import type { PortalModuleTab } from '@/components/bmo/layout/PortalModuleCleanLayout';

const performanceTabs: PortalModuleTab[] = [
  {
    id: 'overview',
    label: 'Indicateurs & SLA',
    path: '/maitre-ouvrage/performance',
    icon: Activity,
  },
];

export default function PerformanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalModuleCleanLayout title="Performance & SLA" tabs={performanceTabs}>
      {children}
    </PortalModuleCleanLayout>
  );
}
