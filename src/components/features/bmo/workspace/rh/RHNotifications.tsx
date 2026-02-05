'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { 
  CheckCircle2, XCircle, AlertTriangle, Info, X, 
  Bell, Clock, FileText, Users, Zap 
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type NotificationType = 'success' | 'error' | 'warning' | 'info';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
};

// ============================================
// CONTEXT
// ============================================

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useRHNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useRHNotifications must be used within RHNotificationProvider');
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

export function RHNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove après duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      {mounted && createPortal(
        <RHNotificationContainer 
          notifications={notifications} 
          onRemove={removeNotification} 
        />,
        document.body
      )}
    </NotificationContext.Provider>
  );
}

// ============================================
// CONTAINER
// ============================================

function RHNotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {notifications.map((notification, index) => (
        <RHNotificationToast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
          style={{ 
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// TOAST
// ============================================

function RHNotificationToast({ 
  notification, 
  onRemove,
  style,
}: { 
  notification: Notification;
  onRemove: (id: string) => void;
  style?: React.CSSProperties;
}) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 200);
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  };

  return (
    <div
      className={cn(
        "pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-sm",
        "bg-white dark:bg-slate-900",
        bgColors[notification.type],
        "transform transition-all duration-200",
        isLeaving 
          ? "translate-x-full opacity-0" 
          : "translate-x-0 opacity-100 animate-slide-in-right"
      )}
      style={style}
    >
      <div className="flex items-start gap-3">
        <div className="flex-none pt-0.5">
          {icons[notification.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{notification.title}</div>
          {notification.message && (
            <div className="text-sm text-slate-400 mt-0.5">{notification.message}</div>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              {notification.action.label} →
            </button>
          )}
        </div>

        <button
          onClick={handleRemove}
          className="flex-none p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      {notification.duration && notification.duration > 0 && (
        <div className="mt-2 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full",
              notification.type === 'success' && "bg-emerald-500",
              notification.type === 'error' && "bg-red-500",
              notification.type === 'warning' && "bg-amber-500",
              notification.type === 'info' && "bg-blue-500"
            )}
            style={{
              animation: `shrink ${notification.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// ============================================
// HELPERS - Fonctions utilitaires pour notifications RH
// ============================================

export function useRHToast() {
  const { addNotification } = useRHNotifications();

  return {
    success: (title: string, message?: string) => 
      addNotification({ type: 'success', title, message }),
    
    error: (title: string, message?: string) =>
      addNotification({ type: 'error', title, message, duration: 8000 }),
    
    warning: (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message, duration: 6000 }),
    
    info: (title: string, message?: string) =>
      addNotification({ type: 'info', title, message }),
    
    demandValidated: (demandId: string, agent: string) =>
      addNotification({
        type: 'success',
        title: 'Demande validée',
        message: `${demandId} - ${agent}`,
        action: {
          label: 'Voir les détails',
          onClick: () => logger.info('Navigate to demand', { component: 'RHNotifications', demandId }),
        },
      }),
    
    demandRejected: (demandId: string, agent: string) =>
      addNotification({
        type: 'error',
        title: 'Demande rejetée',
        message: `${demandId} - ${agent}`,
      }),
    
    newDemand: (demandId: string, type: string) =>
      addNotification({
        type: 'info',
        title: 'Nouvelle demande',
        message: `${type} - ${demandId}`,
        action: {
          label: 'Traiter maintenant',
          onClick: () => logger.debug('Open demand', { component: 'RHNotifications', demandId }),
        },
      }),
    
    urgentAlert: (message: string) =>
      addNotification({
        type: 'warning',
        title: '⚠️ Alerte urgente',
        message,
        duration: 10000,
      }),
  };
}

// ============================================
// ALERTS PANEL - Panneau des alertes/rappels
// ============================================

type Alert = {
  id: string;
  type: 'deadline' | 'conflict' | 'pending' | 'reminder';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  demandId?: string;
};

const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    type: 'deadline',
    title: 'Délai dépassé',
    message: 'RH-2026-0085 attend une validation depuis 5 jours',
    priority: 'high',
    createdAt: '09/01/2026',
    demandId: 'RH-2026-0085',
  },
  {
    id: 'ALT-002',
    type: 'conflict',
    title: 'Conflit détecté',
    message: '3 absences simultanées prévues au Bureau BA',
    priority: 'high',
    createdAt: '09/01/2026',
  },
  {
    id: 'ALT-003',
    type: 'pending',
    title: 'Demandes en attente',
    message: '12 demandes en attente de validation',
    priority: 'medium',
    createdAt: '09/01/2026',
  },
  {
    id: 'ALT-004',
    type: 'reminder',
    title: 'Rappel congés',
    message: 'Clôture des soldes de congés dans 15 jours',
    priority: 'low',
    createdAt: '08/01/2026',
  },
];

export function RHAlertsPanel({ onDismiss }: { onDismiss?: (id: string) => void }) {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    onDismiss?.(id);
  };

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.priority === filter);

  const typeIcons = {
    deadline: <Clock className="w-4 h-4" />,
    conflict: <Users className="w-4 h-4" />,
    pending: <FileText className="w-4 h-4" />,
    reminder: <Bell className="w-4 h-4" />,
  };

  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/5',
    medium: 'border-amber-500/50 bg-amber-500/5',
    low: 'border-slate-500/50 bg-slate-500/5',
  };

  const priorityBadge = {
    high: 'bg-red-500/20 text-red-500',
    medium: 'bg-amber-500/20 text-amber-500',
    low: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
      <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Alertes & Rappels
            {alerts.filter(a => a.priority === 'high').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                {alerts.filter(a => a.priority === 'high').length}
              </span>
            )}
          </h3>
        </div>

        {/* Filtres */}
        <div className="flex gap-1 mt-3">
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {f === 'all' ? 'Toutes' : f === 'high' ? '🔴 Urgentes' : f === 'medium' ? '🟠 Moyennes' : '🟢 Faibles'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune alerte</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  "border-l-2",
                  priorityColors[alert.priority]
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    alert.priority === 'high' && "bg-red-500/10 text-red-500",
                    alert.priority === 'medium' && "bg-amber-500/10 text-amber-500",
                    alert.priority === 'low' && "bg-slate-500/10 text-slate-400"
                  )}>
                    {typeIcons[alert.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{alert.title}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium",
                        priorityBadge[alert.priority]
                      )}>
                        {alert.priority === 'high' ? 'Urgent' : alert.priority === 'medium' ? 'Moyen' : 'Faible'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mt-0.5">{alert.message}</div>
                    <div className="text-xs text-slate-400 mt-1">{alert.createdAt}</div>
                  </div>

                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {alert.demandId && (
                  <button className="mt-2 ml-11 text-xs text-orange-500 hover:text-orange-600 font-medium">
                    Voir la demande {alert.demandId} →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setAlerts([])}
            className="w-full py-2 rounded-lg text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Tout marquer comme lu
          </button>
        </div>
      )}
    </div>
  );
}

