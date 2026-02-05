import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CalendrierLayoutClient } from './CalendrierLayoutClient';

export const metadata: Metadata = {
  title: 'Calendrier | Maître d\'Ouvrage | YESSALATE',
  description:
    'Calendrier et planification - Jalons, agenda, Gantt, timeline. Pilotage des échéances et événements BTP.',
};

export default function CalendrierLayout({ children }: { children: ReactNode }) {
  return <CalendrierLayoutClient>{children}</CalendrierLayoutClient>;
}
