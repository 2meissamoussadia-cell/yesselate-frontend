'use client';

import { Bell, X, Check, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { logger } from '@/lib/utils/logger';
import { Badge, Button } from '@/components/ui';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: 'Dépassement budget',
    message: 'Le projet Tours Horizon a dépassé son budget de 15%',
    time: 'Il y a 5 min',
    isRead: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Validation en attente',
    message: 'Le BC #2847 nécessite votre validation',
    time: 'Il y a 20 min',
    isRead: false,
    actionLabel: 'Valider',
  },
  {
    id: '3',
    type: 'success',
    title: 'Livraison effectuée',
    message: 'Les matériaux du lot 5 ont été livrés',
    time: 'Il y a 1h',
    isRead: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Réunion planifiée',
    message: 'Comité de pilotage demain à 14h',
    time: 'Il y a 2h',
    isRead: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'error':
      return <AlertTriangle className="h-5 w-5 text-red-400" />;
    case 'warning':
      return <Clock className="h-5 w-5 text-amber-400" />;
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    default:
      return <Info className="h-5 w-5 text-blue-400" />;
  }
};

const getNotificationBgClass = (type: Notification['type'], isRead: boolean) => {
  if (isRead) return 'bg-slate-800/30';
  
  switch (type) {
    case 'error':
      return 'bg-red-950/20 border-l-2 border-red-500';
    case 'warning':
      return 'bg-amber-950/20 border-l-2 border-amber-500';
    case 'success':
      return 'bg-green-950/20 border-l-2 border-green-500';
    default:
      return 'bg-blue-950/20 border-l-2 border-blue-500';
  }
};

export function NotificationsPanel() {
  const { notificationsPanelOpen, toggleNotificationsPanel } = useGovernanceCommandCenterStore();

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    // TODO: Implémenter la logique réelle
    logger.debug('Mark all as read', { component: 'NotificationsPanel' });
  };

  const markAsRead = (id: string) => {
    // TODO: Implémenter la logique réelle
    logger.debug('Mark as read', { component: 'NotificationsPanel', id });
  };

  if (!notificationsPanelOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={toggleNotificationsPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-100">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleNotificationsPanel}
          >
            <X className="h-4 w-4 text-slate-400" />
          </Button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-slate-700/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {mockNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Bell className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${getNotificationBgClass(notification.type, notification.isRead)} hover:bg-slate-800/50 transition-colors cursor-pointer group`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm font-medium ${notification.isRead ? 'text-slate-400' : 'text-slate-200'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${notification.isRead ? 'text-slate-400' : 'text-slate-400'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">{notification.time}</span>
                        {notification.actionLabel && notification.onAction && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.onAction?.();
                            }}
                            className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

