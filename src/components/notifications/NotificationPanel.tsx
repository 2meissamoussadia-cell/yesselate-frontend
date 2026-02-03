'use client';

/**
 * NotificationPanel BMO — Notifications intelligentes : actionnables, traçables.
 * Utilise Sheet (tiroir droit). Types : danger, warning, info, success.
 * Lien optionnel "Voir détails", Tout marquer comme lu, Paramètres.
 */

import React, { useCallback, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { NotificationAction } from './NotificationItem';

export interface NotificationEntry {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  actions?: NotificationAction[];
  read?: boolean;
  /** Lien optionnel (ex. /creances/001) — affiche "Voir détails" */
  lien?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  notifications?: NotificationEntry[];
  onMarkAllRead?: () => void;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

const defaultNotifications: NotificationEntry[] = [
  {
    id: '1',
    title: 'Créance en retard',
    message: 'SARL Bâtiment Plus - 45 jours de retard (2.4M XOF)',
    time: '2026-01-31T12:30:00',
    type: 'danger',
    read: false,
    lien: '/creances/001',
  },
  {
    id: '2',
    title: 'PPSPS à renouveler',
    message: 'Chantier #038 - Document expire dans 2 jours',
    time: '2026-01-31T11:15:00',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    title: 'Comité de direction',
    message: 'Prévu le 5 février à 14h00 - 8 participants',
    time: '2026-01-31T09:00:00',
    type: 'info',
    read: true,
  },
  {
    id: '4',
    title: 'Paiement reçu',
    message: 'Entreprise Diaspora - 1.8M XOF reçu',
    time: '2026-01-30T16:45:00',
    type: 'success',
    read: true,
  },
];

function formatNotificationTime(time: string): string {
  if (/^\d{4}-\d{2}-\d{2}T/.test(time)) {
    return new Date(time).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return time;
}

function getColorClass(type: string): string {
  const colors: Record<string, string> = {
    danger: 'border-red-500/50 bg-red-500/10',
    warning: 'border-amber-500/50 bg-amber-500/10',
    info: 'border-sky-500/50 bg-sky-500/10',
    success: 'border-green-500/50 bg-green-500/10',
  };
  return colors[type] ?? colors.info;
}

function getIcone(type: string): string {
  const icones: Record<string, string> = {
    danger: '🔴',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
  };
  return icones[type] ?? 'ℹ️';
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications: propNotifications,
  onMarkAllRead,
  onMarkAsRead,
  className,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationEntry[]>(defaultNotifications);

  const list = propNotifications ?? notifications;
  const nonLues = list.filter((n) => !n.read).length;

  const marquerCommeLue = useCallback(
    (id: string) => {
      if (propNotifications) {
        onMarkAsRead?.(id);
      } else {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    },
    [propNotifications, onMarkAsRead]
  );

  const handleMarkAllRead = useCallback(() => {
    if (propNotifications) {
      onMarkAllRead?.();
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [propNotifications, onMarkAllRead]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent
        side="right"
        className={cn(
          'w-[450px] sm:max-w-[450px] flex flex-col p-0',
          'bg-white text-slate-900 border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800',
          className
        )}
        aria-label="Notifications"
      >
          <SheetHeader className="px-4 py-4 border-b border-slate-200 dark:border-slate-800/60 text-left">
            <SheetTitle className="text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Notifications</span>
            {nonLues > 0 && (
              <Badge variant="destructive" className="shrink-0">
                {nonLues} non lues
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 px-4 pb-4 space-y-3">
          {list.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden />
              <p>Aucune notification</p>
            </div>
          ) : (
            list.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'p-4 border rounded-lg cursor-pointer transition-all',
                  getColorClass(notif.type),
                  !notif.read ? 'font-semibold' : 'opacity-70'
                )}
                onClick={() => marquerCommeLue(notif.id)}
                onKeyDown={(e) => e.key === 'Enter' && marquerCommeLue(notif.id)}
                role="button"
                tabIndex={0}
                aria-label={`${notif.title}, ${notif.read ? 'lu' : 'non lu'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>
                    {getIcone(notif.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{notif.title}</h4>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 shrink-0" aria-hidden />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{notif.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatNotificationTime(notif.time)}</p>
                    {notif.lien && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                        asChild
                      >
                        <a href={notif.lien} onClick={(e) => e.stopPropagation()}>
                          Voir détails →
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-4 px-4 pb-4 border-t border-slate-200 dark:border-slate-800/60 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
          >
            Tout marquer comme lu
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400">
            Paramètres
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
