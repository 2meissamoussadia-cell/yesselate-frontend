'use client';

import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Alert = {
  id: string;
  type: 'critique' | 'urgent' | 'overdue' | 'goulot';
  title: string;
  message: string;
  count: number;
  queue: string;
  queueType: 'arbitrages' | 'bureaux';
};

export function ArbitragesAlertsBanner() {
  const { openTab } = useArbitragesWorkspaceStore();

  // TODO: Fetch real alerts from API or context
  const alerts: Alert[] = [
    // Exemple: on pourrait avoir des alertes dynamiques ici
  ];

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = alert.type === 'critique' || alert.type === 'overdue' ? AlertTriangle : Clock;
        const colorClass = alert.type === 'critique' || alert.type === 'overdue' 
          ? 'border-red-500/20 bg-red-500/10 text-red-800 dark:text-red-300'
          : 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300';

        return (
          <div
            key={alert.id}
            className={cn(
              'rounded-2xl border p-4 flex items-center gap-3',
              colorClass
            )}
          >
            <Icon className="w-6 h-6 flex-none" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">
                {alert.title} ({alert.count})
              </div>
              <p className="text-sm opacity-90">
                {alert.message}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-none">
              <FluentButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  openTab({
                    id: `inbox:${alert.queue}`,
                    type: 'inbox',
                    title: alert.title,
                    icon: alert.type === 'critique' ? '🚨' : '⏰',
                    data: { queue: alert.queue, type: alert.queueType },
                  });
                }}
              >
                Voir →
              </FluentButton>
              <button
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => {
                  // TODO: Dismiss alert
                }}
                title="Ignorer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


