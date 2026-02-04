'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Zap, Shield } from 'lucide-react';

// ================================
// Types
// ================================
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'escalation' | 'resolution';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  hash?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  success: (title: string, message?: string, hash?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  escalation: (title: string, message?: string, hash?: string) => void;
  resolution: (title: string, message?: string, hash?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ================================
// Context
// ================================
const ToastContext = createContext<ToastContextValue | null>(null);

// ================================
// Hook
// ================================
export function useBlockedToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useBlockedToast must be used within BlockedToastProvider');
  }
  return ctx;
}

// ================================
// Provider
// ================================
export function BlockedToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000, hash?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = { id, type, title, message, duration, hash };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const success = useCallback((title: string, message?: string, hash?: string) => addToast('success', title, message, 5000, hash), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast('error', title, message, 8000), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast('warning', title, message, 6000), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast('info', title, message), [addToast]);
  const escalation = useCallback((title: string, message?: string, hash?: string) => addToast('escalation', title, message, 6000, hash), [addToast]);
  const resolution = useCallback((title: string, message?: string, hash?: string) => addToast('resolution', title, message, 5000, hash), [addToast]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextValue = {
    toasts,
    success,
    error,
    warning,
    info,
    escalation,
    resolution,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <BlockedToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ================================
// Toast Container
// ================================
function BlockedToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <BlockedToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

// ================================
// Single Toast Item
// ================================
function BlockedToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons: Record<ToastType, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    escalation: Zap,
    resolution: Shield,
  };

  const styles: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-rose-500/30 bg-rose-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
    escalation: 'border-orange-500/30 bg-orange-500/10',
    resolution: 'border-teal-500/30 bg-teal-500/10',
  };

  const iconStyles: Record<ToastType, string> = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
    escalation: 'text-orange-500',
    resolution: 'text-teal-500',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'bg-white/95 dark:bg-slate-900/95',
        'animate-in slide-in-from-right-5 fade-in duration-300',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{toast.title}</p>
        {toast.message && (
          <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">{toast.message}</p>
        )}
        {toast.hash && (
          <p className="text-[10px] mt-2 font-mono text-slate-400 truncate" title={toast.hash}>
            🔐 {toast.hash.slice(0, 24)}...
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        type="button"
        aria-label="Fermer"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}

