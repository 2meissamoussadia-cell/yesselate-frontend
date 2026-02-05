import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import OpportunitiesLayoutClient from './OpportunitiesLayoutClient';

export const metadata: Metadata = {
  title: 'Opportunités & Programmes | Maître d\'Ouvrage | YESSALATE',
  description:
    'Pipeline d\'opportunités et programmes - Phase 0-2, vue Table/Kanban. Pilotage projets BTP.',
};

export default function OpportunitiesLayout({ children }: { children: ReactNode }) {
  return <OpportunitiesLayoutClient>{children}</OpportunitiesLayoutClient>;
}
