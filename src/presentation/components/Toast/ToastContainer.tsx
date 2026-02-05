/**
 * ToastContainer Component
 * Conteneur de toasts amélioré
 */

'use client';

import { ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const variantStyles = {
  success: {
    container: 'bg-green-500/10 border-green-500/30 text-green-400',
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
  },
  error: {
    container: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: <AlertCircle className="w-5 h-5 text-red-400" />,
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    icon: <Info className="w-5 h-5 text-blue-400" />,
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({
  toasts,
  onRemove,
  position = 'top-right',
  className,
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionClasses[position],
        className
      )}
    >
      <AnimatePresence>
        {toasts.map(toast => {
          const variant = toast.variant || 'info';
          const styles = variantStyles[variant];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: position.includes('top') ? -20 : 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 shadow-lg min-w-[300px] max-w-[400px]',
                  styles.container
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {styles.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{toast.message}</p>
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onRemove(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

