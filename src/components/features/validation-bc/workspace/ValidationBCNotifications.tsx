'use client';

import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  createdAt: string;
  documentId?: string;
}

export function ValidationBCNotifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('validation-bc:open-notifications', handleOpen);
    return () => window.removeEventListener('validation-bc:open-notifications', handleOpen);
  }, []);

  const activeNotifications = notifications.filter((n) => !dismissed.includes(n.id));

  const dismiss = (id: string) => {
    setDismissed([...dismissed, id]);
  };

  return (
    <FluentModal open={open} title="Notifications" onClose={() => setOpen(false)}>
      <div className="space-y-3">
        {activeNotifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Aucune notification</p>
          </div>
        ) : (
          activeNotifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'p-3 rounded-xl border flex items-start gap-3',
                notif.type === 'critical' && 'border-rose-300/50 bg-rose-50/50 dark:border-rose-700/30 dark:bg-rose-900/20',
                notif.type === 'warning' && 'border-amber-300/50 bg-amber-50/50 dark:border-amber-700/30 dark:bg-amber-900/20',
                notif.type === 'info' && 'border-blue-300/50 bg-blue-50/50 dark:border-blue-700/30 dark:bg-blue-900/20'
              )}
            >
              {notif.type === 'critical' && <AlertCircle className="w-5 h-5 text-rose-500 flex-none" />}
              {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 flex-none" />}
              {notif.type === 'info' && <Bell className="w-5 h-5 text-blue-500 flex-none" />}

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{notif.message}</div>
                <div className="text-xs text-slate-400 mt-1">{notif.createdAt}</div>
              </div>

              <button
                onClick={() => dismiss(notif.id)}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center flex-none"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))
        )}

        {activeNotifications.length > 0 && (
          <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <FluentButton size="sm" variant="secondary" onClick={() => setDismissed(notifications.map((n) => n.id))}>
              Tout ignorer
            </FluentButton>
            <FluentButton size="sm" variant="secondary" onClick={() => setOpen(false)}>
              Fermer
            </FluentButton>
          </div>
        )}
      </div>
    </FluentModal>
  );
}

