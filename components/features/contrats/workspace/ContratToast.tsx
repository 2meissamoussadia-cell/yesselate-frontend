'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X,
  FileText,
  Signature,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================
// Types
// ================================
type ToastType = 'success' | 'error' | 'info' | 'warning' | 'signature' | 'validation' | 'workflow';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actions?: { label: string; onClick: () => void }[];
  contractId?: string;
}

interface ToastContextValue {
  success: (title: string, message?: string, options?: Partial<Toast>) => void;
  error: (title: string, message?: string, options?: Partial<Toast>) => void;
  info: (title: string, message?: string, options?: Partial<Toast>) => void;
  warning: (title: string, message?: string, options?: Partial<Toast>) => void;
  signature: (title: string, message?: string, contractId?: string) => void;
  validation: (title: string, message?: string, contractId?: string) => void;
  workflow: (title: string, message?: string, contractId?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ================================
// Styles par type
// ================================
const TOAST_STYLES: Record<ToastType, { 
  icon: React.FC<{ className?: string }>;
  bg: string;
  border: string;
  iconColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200/70 dark:border-emerald-700/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200/70 dark:border-rose-700/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200/70 dark:border-blue-700/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200/70 dark:border-amber-700/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  signature: {
    icon: Signature,
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200/70 dark:border-purple-700/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  validation: {
    icon: ShieldCheck,
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200/70 dark:border-indigo-700/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  workflow: {
    icon: Clock,
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-200/70 dark:border-cyan-700/50',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
};

// ================================
// Context
// ================================
const ContratToastContext = createContext<ToastContextValue | null>(null);

export function useContratToast() {
  const context = useContext(ContratToastContext);
  if (!context) {
    throw new Error('useContratToast must be used within ContratToastProvider');
  }
  return context;
}

// ================================
// Provider
// ================================
export function ContratToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastIdRef.current}`;
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 };
    
    setToasts((prev) => [...prev, newToast].slice(-5)); // Max 5 toasts
    
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
    
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextValue = {
    success: (title, message, options) => addToast({ type: 'success', title, message, ...options }),
    error: (title, message, options) => addToast({ type: 'error', title, message, ...options }),
    info: (title, message, options) => addToast({ type: 'info', title, message, ...options }),
    warning: (title, message, options) => addToast({ type: 'warning', title, message, ...options }),
    signature: (title, message, contractId) => addToast({ type: 'signature', title, message, contractId }),
    validation: (title, message, contractId) => addToast({ type: 'validation', title, message, contractId }),
    workflow: (title, message, contractId) => addToast({ type: 'workflow', title, message, contractId }),
    dismiss,
    dismissAll,
  };

  return (
    <ContratToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ContratToastContext.Provider>
  );
}

// ================================
// Container
// ================================
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-[400px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

// ================================
// Toast Item
// ================================
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const style = TOAST_STYLES[toast.type];
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        style.bg,
        style.border
      )}
    >
      <Icon className={cn('w-5 h-5 flex-none mt-0.5', style.iconColor)} />
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {toast.message}
          </p>
        )}
        {toast.contractId && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-mono">
            {toast.contractId}
          </p>
        )}
        {toast.actions && toast.actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {toast.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick();
                  onDismiss();
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="flex-none p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </motion.div>
  );
}

