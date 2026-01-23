/**
 * Composant EmptyState - Affiche un état vide avec un message
 */

'use client';

import React from 'react';
import { FileQuestion, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Message à afficher */
  message?: string;
  /** Titre optionnel */
  title?: string;
  /** Icône personnalisée */
  icon?: React.ComponentType<{ className?: string }>;
  /** Actions optionnelles à afficher */
  actions?: React.ReactNode;
  /** Variante du style */
  variant?: 'default' | 'warning' | 'info';
  /** Classe CSS personnalisée */
  className?: string;
}

export function EmptyState({
  message = 'Aucun contenu disponible pour cette section.',
  title,
  icon: Icon = FileQuestion,
  actions,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const variantStyles = {
    default: {
      container: 'bg-slate-800/40 border-slate-700/40',
      icon: 'text-slate-400',
      title: 'text-slate-200',
      message: 'text-slate-400',
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/30',
      icon: 'text-amber-400',
      title: 'text-amber-300',
      message: 'text-amber-400/80',
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/30',
      icon: 'text-blue-400',
      title: 'text-blue-300',
      message: 'text-blue-400/80',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 rounded-xl border',
        'animate-fadeIn',
        styles.container,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-4">
        <Icon className={cn('h-12 w-12', styles.icon)} aria-hidden="true" />
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-20 blur-xl',
            variant === 'default' && 'bg-slate-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'info' && 'bg-blue-400'
          )}
        />
      </div>

      {title && (
        <h3 className={cn('text-lg font-semibold mb-2', styles.title)}>
          {title}
        </h3>
      )}

      <p className={cn('text-sm text-center max-w-md', styles.message)}>
        {message}
      </p>

      {actions && (
        <div className="mt-6 flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

