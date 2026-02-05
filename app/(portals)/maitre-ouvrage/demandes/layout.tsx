import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Demandes | Maître d\'Ouvrage | YESSALATE',
  description:
    'Gestion des demandes - Suivi, validation, workflow. Pilotage des demandes métier BTP.',
};

export default function DemandesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
