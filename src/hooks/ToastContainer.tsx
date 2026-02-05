'use client';

import { useEffect, useState } from 'react';
import { toastManager, type ToastType } from './useDelegationToast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration: number;
  createdAt: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLOR_MAP = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-100',
};

const ICON_COLOR_MAP = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-rose-600 dark:text-rose-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    // Initial load
    setToasts(toastManager.getToasts());
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const Icon = ICON_MAP[toast.type];
        
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur-sm',
              'animate-in slide-in-from-right-full duration-300',
              'transition-all',
              COLOR_MAP[toast.type]
            )}
            role="alert"
            aria-atomic="true"
          >
            <div className="flex items-start gap-3">
              <Icon className={cn('w-5 h-5 flex-none mt-0.5', ICON_COLOR_MAP[toast.type])} />
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{toast.title}</div>
                {toast.description && (
                  <div className="text-sm mt-1 opacity-90">{toast.description}</div>
                )}
                
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action!.onClick();
                      toastManager.remove(toast.id);
                    }}
                    className="mt-3 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              <button
                onClick={() => toastManager.remove(toast.id)}
                className="flex-none p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-label="Fermer la notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

