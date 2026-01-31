/**
 * Delegations Notification Panel
 * Panneau de notifications pour Delegations
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface DelegationsNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DelegationsNotificationPanel({ isOpen, onClose }: DelegationsNotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      title: 'Notification urgente',
      message: 'Exemple de notification urgente pour Delegations',
      timestamp: new Date().toISOString(),
      read: false,
      actionLabel: 'Voir',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'info': default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-slate-800/30';
    switch (type) {
      case 'urgent': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'info': default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 flex flex-col animate-slideInRight">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {unreadCount}
              </Badge>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2 px-4 py-2 border-b border-slate-800/50">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="text-xs h-7">
              Tout marquer comme lu
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 text-red-400 hover:text-red-300">
              Tout effacer
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer',
                  getBgColor(notif.type, notif.read),
                  !notif.read && 'border-l-4'
                )}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={cn('text-sm font-medium', !notif.read ? 'text-slate-100' : 'text-slate-300')}>
                        {notif.title}
                      </h4>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{notif.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {new Date(notif.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notif.actionLabel && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); notif.onAction?.(); }}>
                          <Eye className="w-3 h-3 mr-1" />
                          {notif.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{notifications.length} notification{notifications.length > 1 ? 's' : ''}</span>
            {unreadCount > 0 && (
              <span className="text-purple-400">{unreadCount} non lu{unreadCount > 1 ? 'es' : 'e'}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
