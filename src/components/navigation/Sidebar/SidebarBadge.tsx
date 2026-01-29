'use client';

/**
 * Badge pour la sidebar - Design YESSALATE BMO
 * Compteur avec variantes (critical, warning, default), option pulse.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type SidebarBadgeVariant = 'default' | 'warning' | 'critical' | 'success';

export interface SidebarBadgeProps {
  count: number | string;
  variant?: SidebarBadgeVariant;
  /** Animation pulse (temps réel) */
  pulse?: boolean;
  className?: string;
  /** Masquer si 0 */
  hideZero?: boolean;
}

const variantClasses: Record<SidebarBadgeVariant, string> = {
  default: 'bg-slate-800/50 text-slate-200 border-slate-700/60',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  critical: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
};

export const SidebarBadge = React.memo(function SidebarBadge({
  count,
  variant = 'default',
  pulse = false,
  className,
  hideZero = true,
}: SidebarBadgeProps) {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;
  if (hideZero && (num === 0 || Number.isNaN(num))) return null;

  const display = typeof count === 'string' ? count : (num > 99 ? '99+' : num);
  const resolvedVariant =
    typeof num === 'number' && variant === 'default'
      ? num > 10
        ? 'critical'
        : num > 5
          ? 'warning'
          : 'default'
      : variant;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-md text-xs font-medium border transition-all duration-200',
        variantClasses[resolvedVariant],
        pulse && 'animate-pulse',
        className
      )}
      aria-label={typeof display === 'number' ? `${display} éléments` : `${display}`}
    >
      {display}
      {pulse && (
        <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" aria-hidden />
      )}
    </span>
  );
});
