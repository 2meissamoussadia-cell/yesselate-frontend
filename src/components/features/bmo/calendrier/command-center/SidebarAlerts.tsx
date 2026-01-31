/**
 * Sidebar Alerts Component
 * Displays BTP alerts in a sidebar format
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CalendrierAlertsBanner, type CalendrierAlert } from './CalendrierAlertsBanner';
import { Bell } from 'lucide-react';
import type { AlertItem, AlertSeverity, AlertStatus, AlertCategory } from '@/lib/types/alert.types';

interface SidebarAlertsProps {
  className?: string;
}

export function SidebarAlerts({ className }: SidebarAlertsProps) {
  // Mock data - replace with actual data fetching
  // TODO: Replace with real API call or hook
  const alerts: CalendrierAlert[] = useMemo(() => {
    const alertsList: CalendrierAlert[] = [];

    // Example alerts - replace with actual data
    // You can use hooks like useCalendrierStore or fetch from API
    const mockKPIs = {
      retardsSLA: 3,
      conflitsActifs: 2,
      reunionsManquees: 1,
    };

    // 1. Jalons SLA à risque
    if (mockKPIs.retardsSLA > 0) {
      alertsList.push({
        id: 'sla-risk',
        type: 'sla-risk',
        title: 'Jalons SLA à risque',
        description: `${mockKPIs.retardsSLA} jalons SLA en retard ou à risque (J-7)`,
        count: mockKPIs.retardsSLA,
        actionLabel: 'Voir dans Contrats',
        actionUrl: '/maitre-ouvrage/validation-contrats',
        severity: 'warning',
      });
    }

    // 2. Retards détectés
    if (mockKPIs.retardsSLA > 0) {
      alertsList.push({
        id: 'retards',
        type: 'retard',
        title: 'Retards détectés',
        description: `${mockKPIs.retardsSLA} tâches/jalons en retard`,
        count: mockKPIs.retardsSLA,
        actionLabel: 'Voir dans Gestion Chantiers',
        actionUrl: '/maitre-ouvrage/projets-en-cours',
        severity: 'critical',
      });
    }

    // 3. Sur-allocation ressources
    if (mockKPIs.conflitsActifs > 0) {
      alertsList.push({
        id: 'sur-allocation',
        type: 'sur-allocation',
        title: 'Sur-allocation ressources',
        description: `${mockKPIs.conflitsActifs} conflit(s) de sur-allocation détecté(s)`,
        count: mockKPIs.conflitsActifs,
        actionLabel: 'Voir dans Ressources',
        actionUrl: '/maitre-ouvrage/employes',
        severity: 'warning',
      });
    }

    // 4. Réunion critique manquée
    if (mockKPIs.reunionsManquees > 0) {
      alertsList.push({
        id: 'reunion-manquee',
        type: 'reunion-manquee',
        title: 'Réunion critique manquée',
        description: `${mockKPIs.reunionsManquees} réunion(s) critique(s) manquée(s)`,
        count: mockKPIs.reunionsManquees,
        actionLabel: 'Voir dans Calendrier',
        actionUrl: '/maitre-ouvrage/calendrier',
        severity: 'critical',
      });
    }

    return alertsList;
  }, []);

  const handleAlertAction = (alert: CalendrierAlert) => {
    if (alert.actionUrl) {
      window.location.href = alert.actionUrl;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Aucune alerte</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <CalendrierAlertsBanner
        alerts={alerts}
        onAction={handleAlertAction}
        className="flex-1"
      />
    </div>
  );
}

