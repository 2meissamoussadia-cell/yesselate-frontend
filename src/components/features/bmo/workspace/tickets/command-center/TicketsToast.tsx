/**
 * Système de notifications Toast pour Tickets
 * Provider et hooks pour les toasts
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  Ticket,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';

// ================================
// Types
// ================================
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  // Convenience methods
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  // Domain-specific
  ticketCreated: (reference: string) => void;
  ticketResolved: (reference: string) => void;
  ticketAssigned: (reference: string, assignee: string) => void;
  ticketEscalated: (reference: string) => void;
  dataRefreshed: () => void;
  exportComplete: (format: string) => void;
  slaWarning: (reference: string, timeLeft: string) => void;
}

// ================================
// Context
// ================================
const ToastContext = createContext<ToastContextType | null>(null);

// ================================
// Provider
// ================================
export function TicketsToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 8000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message, duration: 6000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  // Domain-specific toasts
  const ticketCreated = useCallback((reference: string) => {
    addToast({
      type: 'success',
      title: 'Ticket créé',
      message: `Le ticket ${reference} a été créé avec succès`,
    });
  }, [addToast]);

  const ticketResolved = useCallback((reference: string) => {
    addToast({
      type: 'success',
      title: 'Ticket résolu',
      message: `Le ticket ${reference} a été marqué comme résolu`,
    });
  }, [addToast]);

  const ticketAssigned = useCallback((reference: string, assignee: string) => {
    addToast({
      type: 'info',
      title: 'Ticket assigné',
      message: `${reference} assigné à ${assignee}`,
    });
  }, [addToast]);

  const ticketEscalated = useCallback((reference: string) => {
    addToast({
      type: 'warning',
      title: 'Ticket escaladé',
      message: `${reference} a été escaladé au niveau supérieur`,
    });
  }, [addToast]);

  const dataRefreshed = useCallback(() => {
    addToast({
      type: 'info',
      title: 'Données rafraîchies',
      message: 'Les données ont été mises à jour',
      duration: 3000,
    });
  }, [addToast]);

  const exportComplete = useCallback((format: string) => {
    addToast({
      type: 'success',
      title: 'Export terminé',
      message: `Le fichier ${format.toUpperCase()} a été généré`,
    });
  }, [addToast]);

  const slaWarning = useCallback((reference: string, timeLeft: string) => {
    addToast({
      type: 'warning',
      title: 'Alerte SLA',
      message: `${reference} - SLA dans ${timeLeft}`,
      duration: 10000,
    });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ticketCreated,
    ticketResolved,
    ticketAssigned,
    ticketEscalated,
    dataRefreshed,
    exportComplete,
    slaWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ================================
// Hook
// ================================
export function useTicketsToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useTicketsToast must be used within TicketsToastProvider');
  }
  return context;
}

// ================================
// Toast Container
// ================================
function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]; 
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ================================
// Toast Item
// ================================
function ToastItem({ 
  toast, 
  onRemove 
}: { 
  toast: Toast; 
  onRemove: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  }, [toast.id, onRemove]);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'pointer-events-auto min-w-[320px] max-w-md p-4 rounded-xl border backdrop-blur-xl shadow-lg',
        'transform transition-all duration-200',
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        'bg-slate-900/95',
        colors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-200">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-slate-400 mt-0.5">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="p-1 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

