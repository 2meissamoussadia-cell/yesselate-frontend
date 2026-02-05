import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ChantiersLayoutClient } from './ChantiersLayoutClient';

export const metadata: Metadata = {
  title: 'Chantiers | Maître d\'Ouvrage | YESSALATE',
  description:
    'Chantiers et programmes - Carte, planning, programmes. Pilotage des chantiers de rénovation BTP.',
};

export default function ChantiersLayout({ children }: { children: ReactNode }) {
  return <ChantiersLayoutClient>{children}</ChantiersLayoutClient>;
}
