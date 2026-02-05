import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GovernanceLayoutClient } from './GovernanceLayoutClient';

export const metadata: Metadata = {
  title: 'Gouvernance | Maître d\'Ouvrage | YESSALATE',
  description:
    'Gouvernance et arbitrage - Synthèse, attention, arbitrages, instances, conformité. Pilotage stratégique BTP.',
};

export default function GovernanceLayout({ children }: { children: ReactNode }) {
  return <GovernanceLayoutClient>{children}</GovernanceLayoutClient>;
}
