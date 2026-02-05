'use client';

/**
 * AccessibleButton — Bouton accessible ERP BTP (WCAG).
 * Contraste élevé, focus visible, aria-label, navigation clavier.
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface AccessibleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: React.ReactNode;
  /** Label pour lecteur d'écran (déduit du children si string) */
  ariaLabel?: string;
  /** Style variant */
  variant?: 'default' | 'primary' | 'ghost';
  className?: string;
}

export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  variant = 'default',
  className,
  type = 'button',
  ...rest
}: AccessibleButtonProps) {
  const resolvedLabel =
    ariaLabel ??
    (typeof children === 'string' ? children : 'Action');

  const variantClasses = {
    default:
      'border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    primary:
      'border border-slate-600 bg-slate-700 text-white hover:bg-slate-600 dark:border-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500',
    ghost:
      'border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className
      )}
      aria-label={resolvedLabel}
      {...rest}
    >
      {children}
    </button>
  );
}
