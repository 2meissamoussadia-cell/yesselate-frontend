/**
 * Système de notifications et alertes pour le Dashboard
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Bell, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zIndexClass } from '../utils/zIndex';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface DashboardNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DashboardNotificationsProps {
  notifications: DashboardNotification[];
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  maxVisible?: number;
}

export function DashboardNotifications({
  notifications,
  onDismiss,
  onMarkAsRead,
  maxVisible = 5,
}: DashboardNotificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const visibleNotifications = isExpanded 
    ? notifications 
    : notifications.slice(0, maxVisible);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = (type: NotificationType, read: boolean) => {
    const baseStyles = 'rounded-lg border p-4 transition-all duration-200';
    const readStyles = read ? 'opacity-60' : '';
    
    switch (type) {
      case 'success':
        return cn(
          baseStyles,
          'bg-emerald-500/10 border-emerald-500/30',
          readStyles
        );
      case 'warning':
        return cn(
          baseStyles,
          'bg-amber-500/10 border-amber-500/30',
          readStyles
        );
      case 'error':
        return cn(
          baseStyles,
          'bg-red-500/10 border-red-500/30',
          readStyles
        );
      case 'info':
        return cn(
          baseStyles,
          'bg-blue-500/10 border-blue-500/30',
          readStyles
        );
    }
  };

  return (
    <div className={cn("fixed bottom-4 right-4 w-full max-w-sm space-y-2", zIndexClass('notification'))}>
      {/* Header avec compteur */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between bg-slate-900/95 backdrop-blur-xl rounded-lg border border-slate-700/50 p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-200">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
          </div>
          {notifications.length > maxVisible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {isExpanded ? 'Réduire' : `Voir tout (${notifications.length})`}
            </button>
          )}
        </div>
      )}

      {/* Liste des notifications */}
      <div 
        className="space-y-2 max-h-[600px] overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {visibleNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className={cn(
              getStyles(notification.type, notification.read || false),
              'animate-fadeIn backdrop-blur-xl shadow-lg',
              !notification.read && 'ring-2 ring-offset-2 ring-offset-slate-900',
              notification.type === 'error' && !notification.read && 'ring-red-500/50',
              notification.type === 'warning' && !notification.read && 'ring-amber-500/50',
              notification.type === 'success' && !notification.read && 'ring-emerald-500/50',
              notification.type === 'info' && !notification.read && 'ring-blue-500/50',
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => !notification.read && onMarkAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200 mb-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatTimeAgo(notification.timestamp)}
                    </p>
                    {notification.action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action?.onClick();
                        }}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {notification.action.label} →
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucune notification */}
      {notifications.length === 0 && (
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-lg border border-slate-700/50 p-4 text-center">
          <Bell className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-slate-400">Aucune notification</p>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'à l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} min`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `il y a ${diffInDays}j`;
}

// Hook pour gérer les notifications
export function useDashboardNotifications() {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const nextIdRef = useRef(0);

  const addNotification = (notification: Omit<DashboardNotification, 'id' | 'timestamp'>) => {
    nextIdRef.current += 1;
    const newNotification: DashboardNotification = {
      ...notification,
      id: `notif-${nextIdRef.current}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-dismiss après 10 secondes pour les notifications de succès
    if (notification.type === 'success') {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 10000);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}


