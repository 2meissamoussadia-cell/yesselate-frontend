/**
 * Bouton de navigation vers la page KPIs Budget
 * Utilise le store Command Center (source de vérité)
 */

'use client';

import React from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { Button, type ButtonProps } from '@/components/ui/button';

export function KpiBudgetButton({ children, ...props }: ButtonProps) {
  const navigateTo = useDashboardCommandCenterStore((s) => s.navigateTo);

  return (
    <Button type="button" onClick={() => navigateTo('overview' as any, 'kpis' as any, 'budget')} {...props}>
      {children ?? 'KPIs Budget'}
    </Button>
  );
}

