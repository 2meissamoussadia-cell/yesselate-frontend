/**
 * Composant EmptyState - Affiche un état vide avec un message
 * Source unique pour tout le module dashboard (variants: default, warning, info, error, comingSoon).
 */

'use client';

import React from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Message à afficher */
  message?: string;
  /** Description à afficher (alternative à message) */
  description?: string;
  /** Titre optionnel */
  title?: string;
  /** Icône personnalisée */
  icon?: React.ComponentType<{ className?: string }>;
  /** Actions optionnelles à afficher */
  actions?: React.ReactNode;
  /** Label du bouton d'action */
  actionLabel?: string;
  /** aria-label pour le bouton d'action (accessibilité) */
  actionAriaLabel?: string;
  /** Handler pour le bouton d'action */
  onAction?: () => void;
  /** Variante du style */
  variant?: 'default' | 'warning' | 'info' | 'error' | 'comingSoon' | 'search';
  /** Contenu d'action (ex: bouton "Effacer la recherche") */
  action?: React.ReactNode;
  /** Classe CSS personnalisée */
  className?: string;
}

export function EmptyState({
  message,
  description,
  title,
  icon: Icon = FileQuestion,
  actions,
  action,
  actionLabel,
  actionAriaLabel,
  onAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const displayMessage = description || message || 'Aucun contenu disponible pour cette section.';
  const variantStyles: Record<NonNullable<EmptyStateProps['variant']>, { container: string; icon: string; title: string; message: string }> = {
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
    error: {
      container: 'bg-red-500/10 border-red-500/30',
      icon: 'text-red-400',
      title: 'text-red-300',
      message: 'text-red-400/80',
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/30',
      icon: 'text-blue-400',
      title: 'text-blue-300',
      message: 'text-blue-400/80',
    },
    comingSoon: {
      container: 'bg-slate-800/40 border-slate-600/50 border-dashed',
      icon: 'text-slate-400',
      title: 'text-slate-300',
      message: 'text-slate-400',
    },
    search: {
      container: 'bg-slate-800/40 border-slate-700/40',
      icon: 'text-slate-400',
      title: 'text-slate-200',
      message: 'text-slate-400',
    },
  };

  const styles = variantStyles[variant];

  const isAlert = variant === 'warning' || variant === 'error';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border',
        'animate-fadeIn',
        styles.container,
      className
    )}
      style={{ padding: 'clamp(2rem, 3vw, 3rem)', minHeight: '200px' }}
      role={isAlert ? 'alert' : 'status'}
      aria-live="polite"
      aria-labelledby={title ? 'empty-state-title' : undefined}
      aria-describedby="empty-state-desc"
    >
      <div className="relative mb-4" style={{ width: 'clamp(2.5rem, 3.5vw, 3rem)', height: 'clamp(2.5rem, 3.5vw, 3rem)', minWidth: '2.5rem', minHeight: '2.5rem' }} aria-hidden="true">
        <Icon className={cn(styles.icon, 'w-full h-full')} />
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-20 blur-xl',
            variant === 'default' && 'bg-slate-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'error' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'comingSoon' && 'bg-slate-500'
          )}
        />
      </div>

      {title && (
        <h3 id="empty-state-title" className={cn('font-semibold mb-2', styles.title)} style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}>
          {title}
        </h3>
      )}

      <p id="empty-state-desc" className={cn('text-center max-w-md', styles.message)} style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
        {displayMessage}
      </p>

      {(actions || action || (actionLabel && onAction)) && (
        <div className="mt-6 flex items-center gap-3">
          {actions}
          {action}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={cn(
                'px-4 py-2 rounded-lg border transition-colors',
                'border-slate-700/50 bg-slate-800/50 text-slate-200',
                'hover:bg-slate-800/70 hover:border-slate-600/50',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                'min-h-[44px]'
              )}
              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
              aria-label={actionAriaLabel ?? actionLabel}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
