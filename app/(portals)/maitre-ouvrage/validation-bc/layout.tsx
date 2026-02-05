import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Validation BC | Maître d\'Ouvrage | YESSALATE',
  description:
    'Validation des bons de commande - Analyse, règles métier, historique. Pilotage validation BC BTP.',
};

export default function ValidationBCLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
