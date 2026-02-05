import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import DocumentsLayoutClient from './DocumentsLayoutClient';

export const metadata: Metadata = {
  title: 'Documents & Contrats | Maître d\'Ouvrage | YESSALATE',
  description:
    'Documents et contrats - Contrats, avenants, pièces jointes. Gestion documentaire BTP.',
};

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return <DocumentsLayoutClient>{children}</DocumentsLayoutClient>;
}
