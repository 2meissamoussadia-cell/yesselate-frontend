'use client';

import type { ReactNode } from 'react';
import { BmoPortalLayout } from '@/components/bmo/layout/BmoPortalLayout';

/**
 * Shell client du portail Maître d'Ouvrage (BmoPortalLayout).
 * Utilisé par le layout serveur pour pouvoir exporter metadata.
 */
export function MaitreOuvrageClientLayout({ children }: { children: ReactNode }) {
  return <BmoPortalLayout>{children}</BmoPortalLayout>;
}
