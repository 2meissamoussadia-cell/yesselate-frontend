// src/modules/dashboard/components/DashboardKPIBarWithExport.tsx
// Phase P9: Wrapper pour DashboardKPIBar avec export intégré

'use client';

import { DashboardKPIBar } from './DashboardKPIBar';
import { useDashboardExport } from '../hooks/useDashboardExport';

export function DashboardKPIBarWithExport(props: Omit<React.ComponentProps<typeof DashboardKPIBar>, 'onExport'>) {
  const { exportData } = useDashboardExport();

  return <DashboardKPIBar {...props} onExport={exportData} />;
}
