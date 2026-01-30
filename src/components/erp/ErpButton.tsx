/**
 * ErpButton — Bouton avec microinteractions ERP (feedback pression, loader, succès/erreur).
 * active:scale-95, hover, disabled + spinner.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ErpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** Afficher un état succès (check) après clic (optionnel, à gérer par le parent) */
  success?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default:
    'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:border-slate-600 active:bg-slate-700',
  outline:
    'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/50 hover:border-slate-600',
  ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-slate-100',
  destructive:
    'border-rose-500/50 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 hover:border-rose-500/70',
  success:
    'border-emerald-500/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 hover:border-emerald-500/70',
};

const sizeClasses = {
  xs: 'h-6 px-2 text-[10px] rounded-md',
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-9 px-4 text-sm rounded-lg',
  lg: 'h-10 px-5 text-sm rounded-xl',
};

export function ErpButton({
  variant = 'default',
  size = 'sm',
  loading = false,
  success = false,
  disabled,
  children,
  className,
  ...props
}: ErpButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
      ) : success ? (
        <span className="inline-block h-4 w-4 shrink-0 rounded-full bg-emerald-500/80" aria-hidden />
      ) : null}
      {children}
    </button>
  );
}
