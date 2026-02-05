/**
 * Système de notifications toast pour la page Calendrier
 * Affiche des messages de succès/erreur/info/warning
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle, Calendar } from 'lucide-react';
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
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  // Helpers spécifiques calendrier
  eventCreated: (title: string) => void;
  eventUpdated: (title: string) => void;
  eventDeleted: (title: string) => void;
  conflictDetected: (count: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useCalendarToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useCalendarToast must be used within CalendarToastProvider');
  }
  return context;
}

export function CalendarToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);
  
  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);
  
  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);
  
  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);
  
  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  // Helpers spécifiques calendrier
  const eventCreated = useCallback((title: string) => {
    success('Événement créé', title);
  }, [success]);

  const eventUpdated = useCallback((title: string) => {
    success('Événement mis à jour', title);
  }, [success]);

  const eventDeleted = useCallback((title: string) => {
    success('Événement supprimé', title);
  }, [success]);

  const conflictDetected = useCallback((count: number) => {
    warning('Conflit détecté', `${count} événement${count > 1 ? 's' : ''} en conflit`);
  }, [warning]);
  
  return (
    <ToastContext.Provider value={{ 
      showToast, 
      success, 
      error, 
      warning, 
      info,
      eventCreated,
      eventUpdated,
      eventDeleted,
      conflictDetected
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  
  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  };
  
  const Icon = icons[toast.type];
  
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border backdrop-blur-xl shadow-lg animate-in slide-in-from-right',
        colors[toast.type]
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-white/80 mt-1">{toast.message}</p>
        )}
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
