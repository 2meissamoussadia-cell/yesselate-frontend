'use client';

import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';
import { cn } from '@/lib/cn';

/**
 * CalendarAlertsBanner
 * ====================
 * 
 * Bannière d'alertes affichée en haut du workspace.
 * Affiche les événements critiques, conflits, retards SLA.
 */

interface Alert {
  id: string;
  type: 'conflict' | 'overdue' | 'critical';
  title: string;
  count: number;
  queue: string;
}

interface Props {
  alerts?: Alert[];
}

export function CalendarAlertsBanner({ alerts }: Props) {
  const { openTab } = useCalendarWorkspaceStore();

  // Mock alerts si non fourni
  const defaultAlerts: Alert[] = [
    { id: 'conflicts', type: 'conflict', title: 'Conflits détectés', count: 2, queue: 'conflicts' },
    { id: 'overdue', type: 'overdue', title: 'En retard SLA', count: 3, queue: 'overdue' },
  ];

  const displayAlerts = alerts || defaultAlerts;

  // Ne rien afficher si pas d'alertes
  if (displayAlerts.length === 0 || displayAlerts.every(a => a.count === 0)) {
    return null;
  }

  const handleClick = (alert: Alert) => {
    const icons: Record<string, string> = {
      conflicts: '⚠️',
      overdue: '⏰',
      critical: '🔥',
    };

    openTab({
      id: `inbox:${alert.queue}`,
      type: 'inbox',
      title: alert.title,
      icon: icons[alert.queue] ?? '⚠️',
      data: { queue: alert.queue },
    });
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
            Alertes nécessitant votre attention
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayAlerts.map((alert) => {
              if (alert.count === 0) return null;

              const Icon =
                alert.type === 'conflict'
                  ? AlertTriangle
                  : alert.type === 'overdue'
                  ? Clock
                  : Calendar;

              return (
                <button
                  key={alert.id}
                  onClick={() => handleClick(alert)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium',
                    alert.type === 'conflict' &&
                      'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-300',
                    alert.type === 'overdue' &&
                      'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-300',
                    alert.type === 'critical' &&
                      'bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>
                    {alert.title} ({alert.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

