import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import EngagementsLayoutClient from './EngagementsLayoutClient';

export const metadata: Metadata = {
  title: 'Engagements & Finances | Maître d\'Ouvrage | YESSALATE',
  description:
    'Engagements et finances - Demandes, BC, factures, paiements. Pilotage budgétaire BTP.',
};

export default function EngagementsLayout({ children }: { children: ReactNode }) {
  return <EngagementsLayoutClient>{children}</EngagementsLayoutClient>;
}
