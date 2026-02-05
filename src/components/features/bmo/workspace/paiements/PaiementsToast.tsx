/**
 * Toast Notifications pour Validation Paiements
 * Feedback visuel pour erreurs et succès
 */

'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaiementsToastProps {
  open: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export function PaiementsToast({
  open,
  type,
  title,
  message,
  onClose,
  duration = 5000,
}: PaiementsToastProps) {
  useEffect(() => {
    if (!open || duration === 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  const Icon = icons[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className={cn(
        'min-w-[320px] max-w-md rounded-lg border p-4 shadow-lg backdrop-blur-xl',
        colors[type]
      )}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">{title}</p>
            {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

