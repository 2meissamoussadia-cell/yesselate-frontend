import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MaitreOuvrageClientLayout } from './MaitreOuvrageClientLayout';

export const metadata: Metadata = {
  title: 'Maître d\'Ouvrage | YESSALATE Centrale DG',
  description:
    'Portail Maître d\'Ouvrage - Pilotage chantiers, demandes, validation BC, alertes, gouvernance. Cockpit rénovation digitale BTP.',
  openGraph: {
    title: 'Maître d\'Ouvrage | YESSALATE',
    description: 'Portail Maître d\'Ouvrage - Pilotage chantiers, demandes, validation BC, alertes.',
  },
};

/**
 * Layout Maître d'Ouvrage — shell partagé (BmoPortalLayout).
 * Layout serveur pour exporter metadata ; le shell UI est dans MaitreOuvrageClientLayout.
 */
export default function MaitreOuvrageLayout({ children }: { children: ReactNode }) {
  return <MaitreOuvrageClientLayout>{children}</MaitreOuvrageClientLayout>;
}
