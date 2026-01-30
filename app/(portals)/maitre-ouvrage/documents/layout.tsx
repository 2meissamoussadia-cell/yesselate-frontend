'use client';

import React from 'react';
import { FileText, FileEdit } from 'lucide-react';
import { PortalModuleCleanLayout } from '@/components/bmo/layout/PortalModuleCleanLayout';
import type { PortalModuleTab } from '@/components/bmo/layout/PortalModuleCleanLayout';

const documentsTabs: PortalModuleTab[] = [
  { id: 'contrats', label: 'Contrats', path: '/maitre-ouvrage/documents', icon: FileText },
  { id: 'avenants', label: 'Avenants', path: '/maitre-ouvrage/documents/avenants', icon: FileEdit },
];

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalModuleCleanLayout title="Documents & Contrats" tabs={documentsTabs}>
      {children}
    </PortalModuleCleanLayout>
  );
}
