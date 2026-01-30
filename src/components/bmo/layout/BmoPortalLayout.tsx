'use client';

/**
 * BmoPortalLayout — Shell partagé pour (bmo) et (portals)/maitre-ouvrage.
 * Une seule source de vérité : FluentProviderClient + ToastProvider + BmoLayoutShell + PageTemplate.
 */

import type { ReactNode } from 'react';
import { BmoLayoutShell } from '@/components/bmo/layout/BmoLayoutShell';
import { PageTemplate } from '@/components/navigation/PageTemplate';
import { FluentProviderClient } from '@/components/shared/FluentProviderClient';
import { ToastProvider } from '@/components/ui/toast';

export interface BmoPortalLayoutProps {
  children: ReactNode;
}

export function BmoPortalLayout({ children }: BmoPortalLayoutProps) {
  return (
    <FluentProviderClient>
      <ToastProvider>
        <BmoLayoutShell>
          <PageTemplate>{children}</PageTemplate>
        </BmoLayoutShell>
      </ToastProvider>
    </FluentProviderClient>
  );
}
