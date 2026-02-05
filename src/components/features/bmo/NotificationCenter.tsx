'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    route: string;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  className,
}: NotificationCenterProps) {
  const { darkMode } = useAppStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const criticalCount = useMemo(
    () => notifications.filter((n) => n.type === 'critical' && !n.read).length,
    [notifications]
  );

  const handleAction = useCallback(
    (notification: Notification) => {
      if (notification.action) {
        router.push(notification.action.route);
        if (onMarkAsRead) {
          onMarkAsRead(notification.id);
        }
        setIsOpen(false);
      }
    },
    [router, onMarkAsRead]
  );

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'success':
        return <Check className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-400/60 bg-red-400/5';
      case 'warning':
        return 'border-amber-400/60 bg-amber-400/5';
      case 'info':
        return 'border-blue-400/60 bg-blue-400/5';
      case 'success':
        return 'border-emerald-400/60 bg-emerald-400/5';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Bouton de notification */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge
            variant={criticalCount > 0 ? 'urgent' : 'warning'}
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[9px]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notifications */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <Card
            className={cn(
              'absolute right-0 top-full mt-2 w-80 max-h-[500px] z-50',
              'overflow-hidden',
              darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
            )}
          >
            <CardHeader className="border-b border-slate-700 p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && onMarkAllAsRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onMarkAllAsRead}
                      className="text-xs h-7"
                    >
                      Tout marquer lu
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Aucune notification
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-3 border-b border-slate-700/50 transition-colors',
                        !notification.read && 'bg-slate-800/30',
                        getTypeColor(notification.type)
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-semibold">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400">
                              {notification.timestamp.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {notification.action && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAction(notification)}
                                className="text-xs h-6"
                              >
                                {notification.action.label}
                              </Button>
                            )}
                            {onMarkAsRead && !notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onMarkAsRead(notification.id)}
                                className="text-xs h-6"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            {onDismiss && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDismiss(notification.id)}
                                className="text-xs h-6"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

