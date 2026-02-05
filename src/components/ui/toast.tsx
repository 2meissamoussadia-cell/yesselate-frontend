'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400',
  };

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg',
        'animate-in slide-in-from-right duration-300',
        colors[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconColors[toast.type])} />
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-90 mt-1">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Helper hooks pour les alertes
export function useAlertToast() {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string) =>
      showToast({ type: 'success', title, message }),
    
    error: (title: string, message?: string) =>
      showToast({ type: 'error', title, message, duration: 7000 }),
    
    warning: (title: string, message?: string) =>
      showToast({ type: 'warning', title, message }),
    
    info: (title: string, message?: string) =>
      showToast({ type: 'info', title, message }),
    
    alertAcknowledged: (count: number) =>
      showToast({
        type: 'success',
        title: `${count} alerte${count > 1 ? 's' : ''} acquittée${count > 1 ? 's' : ''}`,
        message: 'Les alertes ont été marquées comme acquittées',
      }),
    
    alertResolved: (count: number) =>
      showToast({
        type: 'success',
        title: `${count} alerte${count > 1 ? 's' : ''} résolue${count > 1 ? 's' : ''}`,
        message: 'Les alertes ont été traitées avec succès',
      }),
    
    alertEscalated: (count: number) =>
      showToast({
        type: 'warning',
        title: `${count} alerte${count > 1 ? 's' : ''} escaladée${count > 1 ? 's' : ''}`,
        message: 'Les alertes ont été transmises au niveau supérieur',
      }),
    
    exportSuccess: (format: string) =>
      showToast({
        type: 'success',
        title: 'Export réussi',
        message: `Le fichier ${format.toUpperCase()} a été téléchargé`,
      }),
    
    actionError: (action: string) =>
      showToast({
        type: 'error',
        title: 'Erreur',
        message: `Impossible d'effectuer l'action: ${action}`,
        duration: 7000,
      }),
  };
}
