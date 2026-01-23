/**
 * Page du Command Center du Dashboard
 * Vue centralisée pour le command center avec toutes les fonctionnalités
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  OverviewView,
  RealtimeView,
  PerformanceView,
} from '@/components/features/bmo/dashboard/command-center';

interface DashboardCommandCenterPageProps {
  view?: 'default' | 'realtime' | 'stats';
}

/**
 * Page principale du Command Center
 * Affiche différentes vues selon le paramètre view
 * ✅ Amélioré avec layout responsive et meilleure gestion des débordements
 */
const DashboardCommandCenterPage = memo(function DashboardCommandCenterPage({
  view = 'default',
}: DashboardCommandCenterPageProps) {
  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-w-0 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden min-w-0">
        {view === 'realtime' && <RealtimeView />}
        {view === 'stats' && <PerformanceView />}
        {view === 'default' && <OverviewView />}
      </div>
    </div>
  );
});

DashboardCommandCenterPage.displayName = 'DashboardCommandCenterPage';

export default DashboardCommandCenterPage;
