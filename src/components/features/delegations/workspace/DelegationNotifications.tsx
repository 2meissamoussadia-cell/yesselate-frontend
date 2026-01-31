'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useDelegationWorkspaceStore } from '@/lib/stores/delegationWorkspaceStore';
import {
  Bell,
  X,
  Clock,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Settings,
  ChevronRight,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type NotificationType = 
  | 'expiring'
  | 'expired'
  | 'control_required'
  | 'control_approved'
  | 'control_rejected'
  | 'high_usage'
  | 'revoked'
  | 'suspended';

interface Notification {
  id: string;
  type: NotificationType;
  delegationId: string;
  delegationCode: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  read: boolean;
}

// ============================================
// HELPERS
// ============================================

const getTypeConfig = (type: NotificationType) => {
  switch (type) {
    case 'expiring':
      return { icon: Clock, color: 'amber', label: 'Expiration proche' };
    case 'expired':
      return { icon: Clock, color: 'rose', label: 'Expirée' };
    case 'control_required':
      return { icon: AlertTriangle, color: 'amber', label: 'Contrôle requis' };
    case 'control_approved':
      return { icon: CheckCircle2, color: 'emerald', label: 'Contrôle approuvé' };
    case 'control_rejected':
      return { icon: XCircle, color: 'rose', label: 'Contrôle rejeté' };
    case 'high_usage':
      return { icon: AlertTriangle, color: 'amber', label: 'Usage élevé' };
    case 'revoked':
      return { icon: XCircle, color: 'rose', label: 'Révoquée' };
    case 'suspended':
      return { icon: Shield, color: 'amber', label: 'Suspendue' };
    default:
      return { icon: Bell, color: 'slate', label: 'Notification' };
  }
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;

  return d.toLocaleDateString('fr-FR');
};

// ============================================
// COMPONENT
// ============================================

export function DelegationNotifications() {
  const { openTab } = useDelegationWorkspaceStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delegations/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const newNotifications = data.notifications || [];
        
        // Check for new notifications and play sound
        if (soundEnabled && notifications.length > 0) {
          const newCount = newNotifications.filter(
            (n: Notification) => !notifications.find(old => old.id === n.id)
          ).length;
          
          if (newCount > 0 && audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        }
        
        setNotifications(newNotifications);
        setLastFetch(new Date());
      }
    } catch (e) {
      console.error('Erreur chargement notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [notifications, soundEnabled]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    try {
      await fetch(`/api/delegations/notifications/${id}/read`, {
        method: 'POST',
      });
    } catch (e) {
      console.error('Erreur marquage notification:', e);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await fetch('/api/delegations/notifications/read-all', {
        method: 'POST',
      });
    } catch (e) {
      console.error('Erreur marquage notifications:', e);
    }
  }, []);

  // Dismiss notification
  const dismiss = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await fetch(`/api/delegations/notifications/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Erreur suppression notification:', e);
    }
  }, []);

  // Open delegation
  const openDelegation = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    openTab({
      id: `delegation:${notification.delegationId}`,
      type: 'delegation',
      title: notification.delegationCode,
      icon: '🔑',
      data: { delegationId: notification.delegationId },
    });
  }, [markAsRead, openTab]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasHighPriority = notifications.some(n => n.priority === 'high' && !n.read);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl transition-colors",
          isOpen
            ? "bg-slate-100 dark:bg-slate-800"
            : "hover:bg-slate-100 dark:hover:bg-slate-800",
          hasHighPriority && "animate-pulse"
        )}
        title={`${unreadCount} notification(s) non lue(s)`}
      >
        <Bell className={cn(
          "w-5 h-5",
          hasHighPriority ? "text-rose-500" : unreadCount > 0 ? "text-amber-500" : "text-slate-400"
        )} />
        
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-xs font-bold text-white",
            hasHighPriority ? "bg-rose-500" : "bg-amber-500"
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 rounded-2xl border border-slate-200/70 bg-white shadow-xl dark:border-slate-800 dark:bg-[#1f1f1f] z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                title={soundEnabled ? 'Son activé' : 'Son désactivé'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              <button
                onClick={fetchNotifications}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                disabled={loading}
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <div>Aucune notification</div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map(notification => {
                  const config = getTypeConfig(notification.type);
                  const Icon = config.icon;

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "relative p-3 transition-colors cursor-pointer",
                        notification.read
                          ? "bg-white dark:bg-[#1f1f1f]"
                          : "bg-slate-50/50 dark:bg-slate-800/20",
                        "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                      )}
                      onClick={() => openDelegation(notification)}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className={cn(
                          "absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                          config.color === 'emerald' && "bg-emerald-500",
                          config.color === 'amber' && "bg-amber-500",
                          config.color === 'rose' && "bg-rose-500",
                          config.color === 'slate' && "bg-slate-400"
                        )} />
                      )}

                      <div className="flex items-start gap-3 pl-3">
                        <div className={cn(
                          "p-1.5 rounded-lg flex-none",
                          config.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/30",
                          config.color === 'amber' && "bg-amber-100 dark:bg-amber-900/30",
                          config.color === 'rose' && "bg-rose-100 dark:bg-rose-900/30",
                          config.color === 'slate' && "bg-slate-100 dark:bg-slate-800"
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            config.color === 'emerald' && "text-emerald-600",
                            config.color === 'amber' && "text-amber-600",
                            config.color === 'rose' && "text-rose-600",
                            config.color === 'slate' && "text-slate-400"
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate">{notification.title}</span>
                            <span className="text-xs text-slate-400 flex-none">{formatTime(notification.createdAt)}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{notification.message}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs text-purple-600 dark:text-purple-400">
                              {notification.delegationCode}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notification.id);
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 flex-none opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:underline"
              >
                Tout marquer comme lu
              </button>
              <span className="text-slate-400">
                {lastFetch && `MAJ ${formatTime(lastFetch.toISOString())}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DelegationNotifications;


