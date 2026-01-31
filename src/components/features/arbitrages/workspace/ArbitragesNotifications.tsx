'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Bell,
  BellOff,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  ArrowUp,
  X,
  Check,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  arbitrageId: string;
  createdAt: string;
  read: boolean;
  priority: string;
  montant?: number;
}

interface Props {
  onOpenArbitrage?: (id: string) => void;
  compact?: boolean;
}

// ============================================
// Component
// ============================================
export function ArbitragesNotifications({ onOpenArbitrage, compact = false }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/arbitrages/notifications', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      setNotifications(data.data || []);
    } catch (e) {
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    
    // Polling toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/arbitrages/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error('Erreur marquage notification:', e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/arbitrages/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error('Erreur marquage toutes notifications:', e);
    }
  }, []);

  const dismissNotification = useCallback(async (id: string) => {
    try {
      await fetch(`/api/arbitrages/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error('Erreur suppression notification:', e);
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'escalade':
        return <ArrowUp className="w-4 h-4 text-rose-500" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'decision':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'complement':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique':
        return 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
      case 'haute':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'moyenne':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-slate-200 bg-white dark:bg-slate-800/50 dark:border-slate-700';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayNotifications = expanded ? notifications : notifications.slice(0, 3);

  const formatAmount = (n?: number) => {
    if (!n) return null;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    return d.toLocaleDateString('fr-FR');
  };

  if (compact) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={cn(
          'relative p-2 rounded-xl border transition-colors',
          unreadCount > 0
            ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700'
            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
        )}
        title={`${unreadCount} notification(s) non lue(s)`}
      >
        <Bell className={cn('w-5 h-5', unreadCount > 0 ? 'text-amber-600' : 'text-slate-400')} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:underline"
              title="Tout marquer comme lu"
            >
              Tout lire
            </button>
          )}
          <button
            onClick={loadNotifications}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={cn('w-4 h-4 text-slate-400', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-sm mb-3">
          {error}
        </div>
      )}

      {notifications.length === 0 && !loading && (
        <div className="p-6 text-center text-slate-400">
          <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Aucune notification</p>
        </div>
      )}

      <div className="space-y-2">
        {displayNotifications.map((notif) => (
          <div
            key={notif.id}
            className={cn(
              'p-3 rounded-xl border-l-4 transition-all',
              getPriorityColor(notif.priority),
              notif.read && 'opacity-60'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>

              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  markAsRead(notif.id);
                  onOpenArbitrage?.(notif.arbitrageId);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{notif.title}</span>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{formatTime(notif.createdAt)}</span>
                  {notif.montant && (
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {formatAmount(notif.montant)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notif.id);
                    }}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Marquer comme lu"
                  >
                    <Check className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notif.id);
                  }}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Ignorer"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2 text-sm text-blue-600 hover:underline"
        >
          {expanded ? 'Voir moins' : `Voir tout (${notifications.length})`}
        </button>
      )}
    </div>
  );
}

export default ArbitragesNotifications;

