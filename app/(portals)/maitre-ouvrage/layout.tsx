'use client';

import type { ReactNode } from 'react';
import { BmoPortalLayout } from '@/components/bmo/layout/BmoPortalLayout';

/**
 * Layout Maître d'Ouvrage — un seul shell (BmoPortalLayout), partagé avec (bmo).
 * Pas de doublon : (portals)/dg/cockpit redirige vers /maitre-ouvrage/dashboard.
 */
export default function MaitreOuvrageLayout({ children }: { children: ReactNode }) {
  return <BmoPortalLayout>{children}</BmoPortalLayout>;
}
