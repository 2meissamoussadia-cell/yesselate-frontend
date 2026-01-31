'use client';

/**
 * NotificationsPanel - Composant réutilisable pour afficher les notifications
 * Utilise le hook useNotifications pour gérer les notifications
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification as NotificationType } from '@/lib/services/notificationsApiService';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName?: string;
}

export function NotificationsPanel({
  isOpen,
  onClose,
  moduleName = 'Module',
}: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refresh,
  } = useNotifications();

  if (!isOpen) return null;

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNotificationBg = (read: boolean, type?: string) => {
    if (read) return 'bg-slate-800/30';
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
              title="Actualiser"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && notifications.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50 bg-slate-800/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 text-xs text-slate-400 hover:text-slate-200"
            >
              <CheckCheck className="h-3 w-3 mr-1.5" />
              Tout marquer comme lu
            </Button>
            {notifications.some((n) => n.read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteAllRead}
                className="h-7 text-xs text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3 mr-1.5" />
                Supprimer lues
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading && notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-slate-400">Chargement...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bell className="h-12 w-12 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-400">Aucune notification</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.map((notif: NotificationType) => (
              <div
                key={notif.id}
                className={cn(
                  'px-4 py-3 hover:bg-slate-800/30 transition-colors group relative cursor-pointer',
                  getNotificationBg(notif.read, notif.type),
                  !notif.read && 'border-l-2 border-purple-500'
                )}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        className={cn(
                          'text-sm font-medium',
                          notif.read ? 'text-slate-400' : 'text-slate-200'
                        )}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notif.message && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-1">
                        {notif.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        {formatDate(notif.createdAt)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="h-5 px-2 text-xs text-slate-400 hover:text-slate-200"
                          >
                            Marquer lu
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="h-5 px-2 text-xs text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

