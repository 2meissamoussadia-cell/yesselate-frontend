'use client';

import { cn } from '@/lib/cn';
import { useBMOStore } from '@/lib/stores';

export function ToastContainer() {
  const { toasts, removeToast } = useBMOStore();

  if (toasts.length === 0) return null;

  const typeStyles = {
    success: 'bg-emerald-500 border-emerald-400',
    warning: 'bg-amber-500 border-amber-400',
    error: 'bg-red-500 border-red-400',
    info: 'bg-blue-500 border-blue-400',
  };

  const typeIcons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4',
            'animate-in slide-in-from-left fade-in duration-300',
            'text-white min-w-[250px] max-w-[400px]',
            typeStyles[toast.type]
          )}
        >
          <span className="text-lg">{typeIcons[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
