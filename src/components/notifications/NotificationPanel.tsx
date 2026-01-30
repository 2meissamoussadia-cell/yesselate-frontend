'use client';

/**
 * NotificationPanel BMO — Notifications intelligentes : actionnables, traçables.
 * Colonne vertébrale de l'engagement DG (ERP BTP).
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AccessibleButton } from '@/components/ui/AccessibleButton';
import { NotificationItem } from './NotificationItem';
import type { NotificationAction } from './NotificationItem';

export interface NotificationEntry {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  actions?: NotificationAction[];
  read?: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  /** Liste des notifications (si non fournie, exemples affichés) */
  notifications?: NotificationEntry[];
  onMarkAllRead?: () => void;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

const defaultNotifications: NotificationEntry[] = [
  {
    id: '1',
    title: 'Demande urgente validée',
    message: 'La demande n°456 pour le chantier X vient d’être validée.',
    time: 'Il y a 2 min',
    type: 'success',
    read: false,
    actions: [
      { label: 'Consulter', onClick: () => {} },
      { label: 'Marquer comme lu', onClick: () => {} },
    ],
  },
  {
    id: '2',
    title: 'Alerte SLA critique',
    message: 'Le chantier Y dépasse son délai de 15 jours.',
    time: 'Il y a 1h',
    type: 'danger',
    read: false,
    actions: [
      { label: 'Traiter', onClick: () => {} },
      { label: 'Reporter', onClick: () => {} },
    ],
  },
  {
    id: '3',
    title: 'Nouveau document déposé',
    message: 'Plan d’exécution v2 pour le chantier Z.',
    time: 'Il y a 3h',
    type: 'info',
    read: true,
    actions: [{ label: 'Consulter', onClick: () => {} }],
  },
];

export function NotificationPanel({
  isOpen,
  onClose,
  notifications = defaultNotifications,
  onMarkAllRead,
  onMarkAsRead,
  className,
}: NotificationPanelProps) {
  const handleMarkAllRead = useCallback(() => {
    onMarkAllRead?.();
  }, [onMarkAllRead]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed right-4 top-16 w-80 max-h-[calc(100vh-8rem)] overflow-hidden',
        'rounded-lg border border-slate-800/60 bg-slate-950/95 shadow-lg z-50',
        'flex flex-col',
        className
      )}
      role="dialog"
      aria-label="Notifications"
    >
      <header className="px-4 py-2 border-b border-slate-800/60 flex justify-between items-center shrink-0">
        <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
        <AccessibleButton
          onClick={handleMarkAllRead}
          variant="ghost"
          className="text-xs text-slate-400 hover:text-slate-200 border-0 bg-transparent p-0 min-w-0"
          ariaLabel="Marquer tout comme lu"
        >
          Marquer tout comme lu
        </AccessibleButton>
      </header>
      <ul className="p-2 space-y-2 overflow-y-auto flex-1 min-h-0">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            title={n.title}
            message={n.message}
            time={n.time}
            type={n.type}
            actions={n.actions}
            read={n.read}
          />
        ))}
      </ul>
    </div>
  );
}
