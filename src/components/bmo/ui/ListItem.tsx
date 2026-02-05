'use client';

/**
 * ListItem — Composant de ligne de liste générique type Outlook
 * 
 * Features :
 * - Effet hover avec bordure gauche (style Outlook)
 * - États selected, unread, urgent
 * - Focus visible WCAG
 * - Quick actions au survol
 * - Support clavier complet
 */

import React from 'react';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface ListItemProps {
  /** Contenu principal */
  children: React.ReactNode;
  /** ID unique */
  id: string;
  /** État sélectionné */
  selected?: boolean;
  /** État non lu (mise en évidence) */
  unread?: boolean;
  /** État urgent (indicateur rouge) */
  urgent?: boolean;
  /** Callback au clic */
  onClick?: () => void;
  /** Callback au double-clic */
  onDoubleClick?: () => void;
  /** Actions rapides (affichées au survol) */
  quickActions?: QuickAction[];
  /** Indicateur de couleur à gauche */
  indicator?: 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray';
  /** Désactivé */
  disabled?: boolean;
  /** Classes additionnelles */
  className?: string;
}

const indicatorColors = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  blue: 'bg-sky-500',
  green: 'bg-emerald-500',
  purple: 'bg-purple-500',
  gray: 'bg-slate-400',
};

const quickActionVariants = {
  default: 'hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30',
  success: 'hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
  warning: 'hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30',
  danger: 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30',
};

export function ListItem({
  children,
  id,
  selected = false,
  unread = false,
  urgent = false,
  onClick,
  onDoubleClick,
  quickActions = [],
  indicator,
  disabled = false,
  className,
}: ListItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : onClick}
        onDoubleClick={disabled ? undefined : onDoubleClick}
        onKeyDown={handleKeyDown}
        aria-selected={selected}
        aria-disabled={disabled}
        data-list-item-id={id}
        className={cn(
          'group relative w-full min-w-0 overflow-hidden shrink-0',
          (indicator || urgent) ? 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3' : 'flex',
          'px-4 py-3 border-b border-slate-100 dark:border-slate-800/40',
          'transition-all duration-150 ease-out',
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]',
          'before:bg-transparent before:transition-colors before:duration-150',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : [
                'cursor-pointer',
                'hover:bg-slate-50 dark:hover:bg-slate-800/30',
                'hover:before:bg-sky-400',
              ],
          selected && [
            'bg-sky-50 dark:bg-sky-900/20',
            'before:bg-sky-500',
          ],
          unread && 'font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
          quickActions.length > 0 && 'pr-16',
          className
        )}
      >
        {/* Colonne indicateurs */}
        {(indicator || (urgent && !indicator)) && (
          <div className="flex flex-col items-center gap-2 pt-1 shrink-0 w-6 min-w-6" aria-hidden>
            {indicator && <div className={cn('w-2 h-2 rounded-full', indicatorColors[indicator])} />}
            {urgent && !indicator && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </div>
        )}

        {/* Contenu — largeur contrainte */}
        <div className={cn('min-w-0 overflow-hidden', (indicator || urgent) ? '' : 'flex-1')}>
          {children}
        </div>

        {/* Quick Actions — position fixe */}
        {quickActions.length > 0 && (
          <div
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'flex items-center gap-1',
              'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
              'transition-opacity duration-150',
              'bg-white dark:bg-slate-900 rounded-lg shadow-lg',
              'border border-slate-200 dark:border-slate-700 p-1'
            )}
            role="group"
            aria-label="Actions rapides"
          >
            {quickActions.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 text-slate-600 dark:text-slate-300 transition-colors',
                      quickActionVariants[action.variant ?? 'default']
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    aria-label={action.label}
                  >
                    {action.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{action.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * ListItemContent — Structure de contenu standard pour ListItem
 */
export interface ListItemContentProps {
  /** Ligne supérieure (métadonnées, date) */
  topLine?: React.ReactNode;
  /** Titre principal */
  title: React.ReactNode;
  /** Badge ou tag à droite du titre */
  badge?: React.ReactNode;
  /** Ligne de sous-titre (expéditeur, assigné, etc.) */
  subtitle?: React.ReactNode;
  /** Description / preview */
  description?: React.ReactNode;
  /** Ligne de tags/badges additionnels */
  tags?: React.ReactNode;
}

export function ListItemContent({
  topLine,
  title,
  badge,
  subtitle,
  description,
  tags,
}: ListItemContentProps) {
  return (
    <div className="space-y-1.5 min-w-0 overflow-hidden">
      {/* Top line - métadonnées */}
      {topLine && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0 flex-nowrap">
          {topLine}
        </div>
      )}

      {/* Title line */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 min-w-0">
        <h4 className="font-semibold text-sm truncate min-w-0 text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Subtitle line */}
      {subtitle && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 min-w-0 overflow-hidden">
          {subtitle}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 truncate min-w-0">
          {description}
        </p>
      )}

      {/* Tags line — une ligne, pas de wrap pour éviter débordement */}
      {tags && (
        <div className="flex items-center gap-2 flex-nowrap min-w-0 overflow-hidden">
          {tags}
        </div>
      )}
    </div>
  );
}
