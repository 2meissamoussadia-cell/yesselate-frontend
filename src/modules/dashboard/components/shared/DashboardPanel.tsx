/**
 * DashboardPanel
 * Surface standardisée (sobre, lisible, "outil métier").
 * Utilise les design tokens pour la cohérence (voir lib/design-tokens.ts).
 */

'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { colors, borderRadius, shadows, transitions } from '../../utils/dashboardDesignTokens';

export type DashboardPanelProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'sm' | 'md' | 'lg';
  /** Titre du bloc (style 3P/Odoo) */
  title?: string;
  /** Sous-titre ou description courte */
  subtitle?: string;
  /** Icône affichée à côté du titre */
  icon?: React.ComponentType<{ className?: string }>;
};

const paddingClasses = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
} as const;

export function DashboardPanel({
  children,
  className,
  style,
  padding = 'md',
  title,
  subtitle,
  icon: Icon,
}: DashboardPanelProps) {
  const titleId = useId();
  return (
    <div
      className={cn(
        borderRadius.lg,
        'backdrop-blur-sm',
        'border border-slate-200 bg-white dark:border-slate-800/70 dark:bg-slate-900/40',
        'shadow-sm dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)]',
        transitions.standard,
        'hover:shadow-md dark:hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]',
        paddingClasses[padding],
        className
      )}
      style={style}
      role={title ? 'region' : undefined}
      aria-labelledby={title ? titleId : undefined}
    >
      {(title || subtitle || Icon) && (
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800/60 dark:bg-slate-900/40" aria-hidden>
                <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
            )}
            {title && (
              <h2 id={titleId} className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {title}
              </h2>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
