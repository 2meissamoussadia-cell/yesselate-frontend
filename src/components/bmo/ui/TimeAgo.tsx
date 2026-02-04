'use client';

/**
 * TimeAgo — Composant d'affichage de date relative avec tooltip
 * 
 * Affiche une date relative précise (sans "environ") avec un tooltip
 * montrant la date et l'heure exactes.
 * 
 * Usage :
 * <TimeAgo date={alert.createdAt} />
 * <TimeAgo date={alert.deadline} variant="deadline" />
 */

import React from 'react';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  formatRelativeTime,
  formatExactDateTime,
  formatDeadline,
  formatShortDate,
} from '@/lib/utils/formatTime';

export interface TimeAgoProps {
  /** Date à afficher */
  date: Date | string | number | null | undefined;
  /** Variante d'affichage */
  variant?: 'default' | 'short' | 'deadline';
  /** Afficher une icône */
  showIcon?: boolean;
  /** Classes additionnelles */
  className?: string;
}

export function TimeAgo({
  date,
  variant = 'default',
  showIcon = false,
  className,
}: TimeAgoProps) {
  if (!date) {
    return <span className={cn('text-slate-400', className)}>—</span>;
  }

  const d = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(d.getTime())) {
    return <span className={cn('text-slate-400', className)}>—</span>;
  }

  // Variante deadline avec indicateur de retard
  if (variant === 'deadline') {
    const { text, isOverdue, isDueSoon } = formatDeadline(d);
    
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm',
                isOverdue && 'text-red-600 dark:text-red-400 font-medium',
                isDueSoon && !isOverdue && 'text-amber-600 dark:text-amber-400 font-medium',
                !isOverdue && !isDueSoon && 'text-slate-600 dark:text-slate-400',
                className
              )}
            >
              {showIcon && (
                isOverdue ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : isDueSoon ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )
              )}
              <span>{text}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Échéance</p>
            <p className="text-xs text-slate-400">{formatExactDateTime(d)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variante short (pour tableaux)
  if (variant === 'short') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn('text-sm text-slate-500 dark:text-slate-400', className)}>
              {formatShortDate(d)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{formatExactDateTime(d)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variante default
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <time
            dateTime={d.toISOString()}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400',
              className
            )}
          >
            {showIcon && <Clock className="w-3.5 h-3.5" />}
            <span>{formatRelativeTime(d)}</span>
          </time>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formatExactDateTime(d)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Composant DeadlineBadge — Badge d'échéance avec couleur sémantique
 */
export function DeadlineBadge({
  date,
  className,
}: {
  date: Date | string | number | null | undefined;
  className?: string;
}) {
  if (!date) return null;

  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(d.getTime())) return null;

  const { text, isOverdue, isDueSoon } = formatDeadline(d);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
              isOverdue && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
              isDueSoon && !isOverdue && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
              !isOverdue && !isDueSoon && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
              className
            )}
          >
            <Clock className="w-3 h-3" />
            <span>{text}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Échéance</p>
          <p className="text-xs text-slate-400">{formatExactDateTime(d)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
