/**
 * Layout pour le Dashboard
 * Fournit le contexte de navigation et synchronise avec l'URL
 */

'use client';

import { DashboardNavigationProvider } from '@/modules/dashboard/context/DashboardNavigationContext';
import { useDashboardNavigationSync } from '@/modules/dashboard/hooks/useDashboardNavigationSync';

/**
 * Composant interne pour la synchronisation
 * Le hook utilise directement le store, donc il peut être appelé ici
 */
function DashboardSync() {
  useDashboardNavigationSync();
  return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardNavigationProvider>
      <DashboardSync />
      {children}
    </DashboardNavigationProvider>
  );
}

