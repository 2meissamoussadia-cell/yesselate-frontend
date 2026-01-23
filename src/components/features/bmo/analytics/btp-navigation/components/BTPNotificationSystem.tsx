/**
 * Système de Notifications pour Alertes Analytics
 * Affiche les notifications toast pour les alertes critiques et importantes
 */

'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { AlertDefinition } from '@/lib/config/analyticsDisplayLogic';

interface Notification {
  id: string;
  alert: AlertDefinition & {
    title: string;
    description: string;
    detectedAt: string;
  };
  timestamp: number;
  read: boolean;
}

interface BTPNotificationSystemProps {
  alerts: Array<AlertDefinition & { title: string; description: string; detectedAt: string }>;
  onAlertClick?: (alertId: string) => void;
  maxNotifications?: number;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function BTPNotificationSystem({
  alerts,
  onAlertClick,
  maxNotifications = 5,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: BTPNotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Filtrer les alertes à afficher
  useEffect(() => {
    const alertsToShow = alerts
      .filter((alert) => {
        // Afficher seulement les alertes qui doivent être affichées
        return (
          alert.displayRules.showAsToast &&
          !dismissed.has(alert.id) &&
          (alert.type === 'critical' || alert.type === 'warning')
        );
      })
      .slice(0, maxNotifications)
      .map((alert) => ({
        id: alert.id,
        alert,
        timestamp: Date.now(),
        read: false,
      }));

    setNotifications(alertsToShow);
  }, [alerts, dismissed, maxNotifications]);

  // Auto-dismiss
  useEffect(() => {
    if (!autoDismiss) return;

    const timers = notifications.map((notif) => {
      return setTimeout(() => {
        dismissNotification(notif.id);
      }, autoDismissDelay);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, autoDismiss, autoDismissDelay]);

  const dismissNotification = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      default:
        return <Info className="h-5 w-5 text-slate-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'opportunity':
        return 'bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'bg-slate-800/50 border-slate-700';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-right',
            getBgColor(notification.alert.type),
            notification.read && 'opacity-75'
          )}
          onClick={() => {
            markAsRead(notification.id);
            onAlertClick?.(notification.alert.id);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(notification.alert.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-200 truncate">
                  {notification.alert.title}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  className="flex-shrink-0 p-1 rounded hover:bg-slate-700/50 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                {notification.alert.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    notification.alert.type === 'critical'
                      ? 'destructive'
                      : notification.alert.type === 'warning'
                      ? 'default'
                      : 'default'
                  }
                  className="text-xs"
                >
                  {notification.alert.category}
                </Badge>
                <span className="text-xs text-slate-500">
                  {new Date(notification.alert.detectedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

