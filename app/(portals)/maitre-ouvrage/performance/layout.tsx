import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import PerformanceLayoutClient from './PerformanceLayoutClient';

export const metadata: Metadata = {
  title: 'Performance & SLA | Maître d\'Ouvrage | YESSALATE',
  description:
    'Indicateurs de performance et SLA - Suivi des engagements, délais, qualité. Pilotage BTP.',
};

export default function PerformanceLayout({ children }: { children: ReactNode }) {
  return <PerformanceLayoutClient>{children}</PerformanceLayoutClient>;
}
