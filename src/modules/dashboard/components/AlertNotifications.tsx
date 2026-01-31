// src/modules/dashboard/components/AlertNotifications.tsx
// Phase P15: Moteur d'alertes - Notifications d'alertes

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { AlertTriangle, X, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOpenAlerts } from '../hooks/useAlerts';
import { AlertDetailModal } from './AlertDetailModal';
import type { AlertEvent } from '../hooks/useAlerts';

/**
 * Composant pour afficher les notifications d'alertes
 * Utilise le même style que KPINotifications mais adapté aux alertes
 * Phase P15: Moteur d'alertes
 */
export function AlertNotifications() {
  const { data, isLoading } = useOpenAlerts(5);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null);

  const alerts = useMemo(() => {
    if (!data?.events) return [];
    return data.events.filter(alert => !dismissedIds.has(alert.id));
  }, [data?.events, dismissedIds]);

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  }, []);

  const handleAlertClick = useCallback((alert: AlertEvent) => {
    setSelectedAlert(alert);
  }, []);

  if (isLoading || alerts.length === 0) return null;

  // Limiter à 5 notifications
  const displayedAlerts = alerts.slice(0, 5);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm"
      role="region"
      aria-label="Notifications d'alertes"
      aria-live="polite"
      aria-atomic="false"
    >
      {displayedAlerts.map((alert, idx) => {
        const severityColors = {
          critical: 'bg-rose-500/20 border-rose-500/50 text-rose-400',
          warning: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
          info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        };

        const severityIcons = {
          critical: AlertTriangle,
          warning: AlertTriangle,
          info: Circle,
        };

        const Icon = severityIcons[alert.severity];

        return (
          <button
            key={alert.id}
            type="button"
            className={cn(
              'rounded-lg border p-3 shadow-md backdrop-blur-xl animate-fadeIn',
              severityColors[alert.severity],
              'flex items-start gap-3 w-full text-left',
              'hover:opacity-80 transition-opacity duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
              'cursor-pointer'
            )}
            style={{
              animationDelay: `${idx * 100}ms`,
            }}
            onClick={() => handleAlertClick(alert)}
            aria-label={`Alerte ${alert.severity}: ${alert.ruleName}. Cliquer pour voir les détails`}
          >
            <div className={cn(
              'p-1.5 rounded-md flex-shrink-0',
              severityColors[alert.severity]
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium mb-0.5">
                {alert.ruleName}
              </div>
              <div className="text-xs opacity-90">
                {alert.severity === 'critical' && 'Critique'}
                {alert.severity === 'warning' && 'Avertissement'}
                {alert.severity === 'info' && 'Information'}
                {alert.count > 1 && ` • ${alert.count}x`}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(alert.id);
              }}
              className="text-current opacity-70 hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </button>
        );
      })}
      {alerts.length > 5 && (
        <div className="text-xs text-slate-400 text-center pt-2">
          {alerts.length - 5} autre{alerts.length - 5 > 1 ? 's' : ''} alerte{alerts.length - 5 > 1 ? 's' : ''} masquée{alerts.length - 5 > 1 ? 's' : ''}
        </div>
      )}

      {/* Modal de détail */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </div>
  );
}
