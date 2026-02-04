/**
 * Validation BC Notification Panel
 * Panneau slide-in harmonisé pour les notifications et alertes
 * Architecture harmonisée avec PaiementsNotificationPanel
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Calendar,
  TrendingUp,
  Eye,
  FileText,
  Users,
  Shield,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  documentId?: string;
  documentType?: 'bc' | 'facture' | 'avenant';
  actionLabel?: string;
  onAction?: () => void;
}

interface ValidationBCNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ValidationBCNotificationPanel({
  isOpen,
  onClose,
}: ValidationBCNotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      title: 'Document critique',
      message: 'BC-2024-001 nécessite une validation urgente (SLA dépassé dans 2h)',
      timestamp: new Date().toISOString(),
      read: false,
      documentId: 'BC-2024-001',
      documentType: 'bc',
      actionLabel: 'Valider',
    },
    {
      id: '2',
      type: 'warning',
      title: 'SLA proche',
      message: '5 documents approchent de leur SLA (< 24h)',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      actionLabel: 'Consulter',
    },
    {
      id: '3',
      type: 'success',
      title: 'Validation effectuée',
      message: 'FAC-2024-015 a été validé avec succès',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      documentId: 'FAC-2024-015',
      documentType: 'facture',
    },
    {
      id: '4',
      type: 'info',
      title: 'Nouveau document',
      message: 'BC-2024-032 ajouté à la file d\'attente',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      read: true,
      documentId: 'BC-2024-032',
      documentType: 'bc',
    },
    {
      id: '5',
      type: 'warning',
      title: 'Anomalie détectée',
      message: 'Anomalie détectée dans FAC-2024-028 (montant incohérent)',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      read: false,
      documentId: 'FAC-2024-028',
      documentType: 'facture',
      actionLabel: 'Examiner',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'info':
        return <FileCheck className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getDocumentIcon = (type?: Notification['documentType']) => {
    switch (type) {
      case 'bc':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'facture':
        return <FileCheck className="w-4 h-4 text-purple-400" />;
      case 'avenant':
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs text-slate-400 hover:text-slate-200 h-6"
            disabled={unreadCount === 0}
          >
            Tout marquer comme lu
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 h-6"
          >
            Tout effacer
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="w-12 h-12 text-slate-600 mb-3 opacity-30" />
            <p className="text-sm text-slate-400">Aucune notification</p>
            <p className="text-xs text-slate-400 mt-1">Les notifications apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 hover:bg-slate-800/30 transition-colors cursor-pointer',
                  !notification.read && 'bg-slate-800/20'
                )}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                  notification.onAction?.();
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg flex-shrink-0',
                    notification.type === 'urgent' && 'bg-red-500/10',
                    notification.type === 'warning' && 'bg-amber-500/10',
                    notification.type === 'success' && 'bg-emerald-500/10',
                    notification.type === 'info' && 'bg-blue-500/10'
                  )}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={cn(
                            'text-sm font-medium',
                            !notification.read ? 'text-slate-200' : 'text-slate-400'
                          )}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        {notification.documentId && (
                          <div className="flex items-center gap-1.5 mb-1">
                            {getDocumentIcon(notification.documentType)}
                            <span className="text-xs font-mono text-slate-400">
                              {notification.documentId}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        {formatTime(notification.timestamp)}
                      </span>
                      {notification.actionLabel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs text-blue-400 hover:text-blue-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.onAction?.();
                          }}
                        >
                          {notification.actionLabel}
                          <Eye className="w-3 h-3 ml-1" />
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

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/50">
          <p className="text-xs text-slate-400 text-center">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''} • {unreadCount} non lu{unreadCount > 1 ? 'es' : 'e'}
          </p>
        </div>
      )}
    </div>
  );
}

