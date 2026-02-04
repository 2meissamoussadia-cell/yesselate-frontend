'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useValidationBCToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useValidationBCToast must be used within ValidationBCToastProvider');
  }
  return context;
}

export function ValidationBCToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, title, message };

    setToasts((prev) => [...prev, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: ToastContextValue = {
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    warning: (title, message) => addToast('warning', title, message),
    info: (title, message) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-xl border p-4 shadow-lg flex items-start gap-3 min-w-[320px] max-w-[420px] animate-in slide-in-from-right',
              toast.type === 'success' && 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
              toast.type === 'error' && 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
              toast.type === 'warning' && 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
              toast.type === 'info' && 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            )}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 flex-none" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-500 flex-none" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 flex-none" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 flex-none" />}

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{toast.title}</div>
              {toast.message && <div className="text-xs mt-1 opacity-90">{toast.message}</div>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-none w-6 h-6 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

