/**
 * AnalyticsToast.tsx
 * ===================
 * 
 * Système de notifications toast pour Analytics
 * Pattern identique aux autres modules (RH, Délégations, Contrats)
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================
// TYPES
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  
  // Helpers spécialisés Analytics
  kpiUpdated: (name: string) => void;
  kpiCreated: (name: string) => void;
  kpiDeleted: (name: string) => void;
  
  reportCreated: (name: string) => void;
  reportPublished: (name: string) => void;
  reportDeleted: (name: string) => void;
  
  alertAcknowledged: (count: number) => void;
  alertResolved: (count: number) => void;
  
  exportSuccess: (format: string) => void;
  exportScheduled: (frequency: string) => void;
  
  dataRefreshed: () => void;
  actionError: (action: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export function AnalyticsToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    const duration = toast.duration || (toast.type === 'error' ? 7000 : 5000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  // Helpers spécialisés
  const kpiUpdated = useCallback((name: string) => {
    success('KPI mis à jour', `"${name}" a été mis à jour avec succès`);
  }, [success]);

  const kpiCreated = useCallback((name: string) => {
    success('KPI créé', `"${name}" a été créé avec succès`);
  }, [success]);

  const kpiDeleted = useCallback((name: string) => {
    info('KPI supprimé', `"${name}" a été supprimé`);
  }, [info]);

  const reportCreated = useCallback((name: string) => {
    success('Rapport créé', `"${name}" a été créé avec succès`);
  }, [success]);

  const reportPublished = useCallback((name: string) => {
    success('Rapport publié', `"${name}" est maintenant disponible`);
  }, [success]);

  const reportDeleted = useCallback((name: string) => {
    info('Rapport supprimé', `"${name}" a été supprimé`);
  }, [info]);

  const alertAcknowledged = useCallback((count: number) => {
    success(
      `${count} alerte${count > 1 ? 's' : ''} acquittée${count > 1 ? 's' : ''}`,
      'Les alertes ont été prises en compte'
    );
  }, [success]);

  const alertResolved = useCallback((count: number) => {
    success(
      `${count} alerte${count > 1 ? 's' : ''} résolue${count > 1 ? 's' : ''}`,
      'Les alertes ont été traitées'
    );
  }, [success]);

  const exportSuccess = useCallback((format: string) => {
    success('Export réussi', `Fichier ${format.toUpperCase()} téléchargé`);
  }, [success]);

  const exportScheduled = useCallback((frequency: string) => {
    success('Export planifié', `Export ${frequency} programmé avec succès`);
  }, [success]);

  const dataRefreshed = useCallback(() => {
    info('Données actualisées', 'Les statistiques ont été mises à jour');
  }, [info]);

  const actionError = useCallback((action: string) => {
    error('Erreur', `Impossible ${action}. Veuillez réessayer.`);
  }, [error]);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    success,
    error,
    warning,
    info,
    kpiUpdated,
    kpiCreated,
    kpiDeleted,
    reportCreated,
    reportPublished,
    reportDeleted,
    alertAcknowledged,
    alertResolved,
    exportSuccess,
    exportScheduled,
    dataRefreshed,
    actionError,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnalyticsToastContainer toasts={toasts} onDismiss={handleDismiss} />
    </ToastContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAnalyticsToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useAnalyticsToast must be used within AnalyticsToastProvider');
  }
  return context;
}

// ============================================
// TOAST CONTAINER
// ============================================

function AnalyticsToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

// ============================================
// TOAST ITEM
// ============================================

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  };

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  const textColors = {
    success: 'text-emerald-900 dark:text-emerald-100',
    error: 'text-red-900 dark:text-red-100',
    warning: 'text-amber-900 dark:text-amber-100',
    info: 'text-blue-900 dark:text-blue-100',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'animate-in slide-in-from-right duration-300',
        styles[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconColors[toast.type])} />
      
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-sm', textColors[toast.type])}>{toast.title}</p>
        {toast.message && (
          <p className={cn('text-sm mt-1 opacity-90', textColors[toast.type])}>
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className={cn(
          'flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
          textColors[toast.type]
        )}
        aria-label="Fermer la notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

