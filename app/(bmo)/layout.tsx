'use client';

import type { ReactNode } from 'react';
import { BmoPortalLayout } from '@/components/bmo/layout/BmoPortalLayout';

/** Layout BMO — même shell que (portals)/maitre-ouvrage (BmoPortalLayout). */
export default function BmoLayout({ children }: { children: ReactNode }) {
  return <BmoPortalLayout>{children}</BmoPortalLayout>;
}
