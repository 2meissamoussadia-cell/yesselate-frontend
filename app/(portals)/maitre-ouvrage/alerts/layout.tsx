import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AlertsLayoutClient } from './AlertsLayoutClient';

export const metadata: Metadata = {
  title: 'Alertes | Maître d\'Ouvrage | YESSALATE',
  description:
    'Centre d\'alertes - Alertes critiques, projets, SLA, qualité. Pilotage et suivi des alertes BTP.',
};

export default function AlertsLayout({ children }: { children: ReactNode }) {
  return <AlertsLayoutClient>{children}</AlertsLayoutClient>;
}
