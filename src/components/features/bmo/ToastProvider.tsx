'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

// ============================================
// TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface ToastProviderProps {
  children: React.ReactNode;
  defaultDuration?: number;
  maxToasts?: number;
}

export function ToastProvider({ children, defaultDuration = 3000, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      // Auto-remove après durée (sauf loading)
      if (newToast.type !== 'loading' && newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [defaultDuration, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  const { showToast, removeToast, clearAll } = context;

  return {
    toast: showToast,
    remove: removeToast,
    clearAll,
    // Helpers pour chaque type
    success: (message: string, options?: Omit<Toast, 'id' | 'type' | 'message'>) =>
      showToast({ type: 'success', message, ...options }),
    error: (message: string, options?: Omit<Toast, 'id' | 'type' | 'message'>) =>
      showToast({ type: 'error', message, ...options }),
    warning: (message: string, options?: Omit<Toast, 'id' | 'type' | 'message'>) =>
      showToast({ type: 'warning', message, ...options }),
    info: (message: string, options?: Omit<Toast, 'id' | 'type' | 'message'>) =>
      showToast({ type: 'info', message, ...options }),
    loading: (message: string, options?: Omit<Toast, 'id' | 'type' | 'message'>) =>
      showToast({ type: 'loading', message, duration: 0, ...options }),
  };
}

// ============================================
// COMPOSANT CONTAINER
// ============================================

function ToastContainer() {
  const { toasts } = useContext(ToastContext)!;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Toujours rendre quelque chose pour éviter les problèmes de hooks
  // Utiliser un fragment vide si pas encore monté ou pas de container
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  const container = document.body;
  if (!container) {
    return null;
  }

  // Si pas de toasts, ne rien rendre (mais les hooks ont été appelés)
  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    container
  );
}

// ============================================
// COMPOSANT TOAST INDIVIDUEL
// ============================================

interface ToastItemProps {
  toast: Toast;
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useContext(ToastContext)!;
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 200);
  };

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      handleClose();
    }
  };

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      iconColor: 'text-green-400',
      titleColor: 'text-green-400',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      iconColor: 'text-red-400',
      titleColor: 'text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-400',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-400',
    },
    loading: {
      icon: Loader2,
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      iconColor: 'text-slate-400',
      titleColor: 'text-slate-400',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-xl transition-all duration-200 animate-in slide-in-from-right',
        config.bg,
        config.border,
        isExiting && 'animate-out slide-out-to-right opacity-0'
      )}
    >
      <div className="flex gap-3">
        {/* Icône */}
        <div className={cn('flex-shrink-0 w-5 h-5', config.iconColor)}>
          {toast.type === 'loading' ? (
            <Icon className="w-5 h-5 animate-spin" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={cn('font-semibold text-sm mb-1', config.titleColor)}>{toast.title}</h4>
          )}
          <p className="text-sm text-slate-200">{toast.message}</p>

          {/* Action */}
          {toast.action && (
            <button
              onClick={handleAction}
              className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Bouton fermer */}
        {toast.type !== 'loading' && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-5 h-5 rounded-lg hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Barre de progression */}
      {toast.duration && toast.duration > 0 && toast.type !== 'loading' && (
        <div className="mt-3 h-1 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', {
              'bg-green-400': toast.type === 'success',
              'bg-red-400': toast.type === 'error',
              'bg-amber-400': toast.type === 'warning',
              'bg-blue-400': toast.type === 'info',
            })}
            style={{
              width: '100%',
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// STYLES ANIMATION
// ============================================

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;
  document.head.appendChild(style);
}


