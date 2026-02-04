'use client';

/**
 * ReadingPane — Panneau de lecture enrichi (style Outlook)
 * 
 * Caractéristiques :
 * - Header avec titre, badges et actions
 * - Metadata section
 * - Contenu scrollable
 * - Footer avec actions principales
 * - Empty state enrichi
 * - Loading skeleton
 */

import React from 'react';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Inbox,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  User,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Keyboard,
} from 'lucide-react';
import { ActionButton, IconButton } from './ActionButton';
import { StatusBadge } from './StatusBadge';
import { TimeAgo } from './TimeAgo';
import { ReferenceNumber } from './ReferenceNumber';
import { PriorityBadge, type PriorityLevel } from './PriorityIndicator';
import { DetailPanelSkeleton } from './LoadingStates';

export interface ReadingPaneProps<T = unknown> {
  /** Élément sélectionné */
  item?: T | null;
  /** Titre de l'élément */
  title?: string;
  /** Référence/ID */
  reference?: string | number;
  /** Statut */
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  };
  /** Priorité */
  priority?: PriorityLevel;
  /** Métadonnées à afficher */
  metadata?: Array<{
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode;
  }>;
  /** Contenu principal */
  children?: React.ReactNode;
  /** Actions principales (footer) */
  primaryActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
  }>;
  /** Actions secondaires (header) */
  secondaryActions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
  /** Navigation */
  navigation?: {
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    currentIndex?: number;
    totalCount?: number;
  };
  /** État de chargement */
  loading?: boolean;
  /** Message état vide */
  emptyMessage?: string;
  emptyDescription?: string;
  /** Mode plein écran */
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** Fermer le panneau */
  onClose?: () => void;
  /** Classes additionnelles */
  className?: string;
}

export function ReadingPane<T>({
  item,
  title,
  reference,
  status,
  priority,
  metadata = [],
  children,
  primaryActions = [],
  secondaryActions = [],
  navigation,
  loading = false,
  emptyMessage = 'Sélectionnez un élément',
  emptyDescription = 'Cliquez sur un élément de la liste pour afficher ses détails',
  fullscreen = false,
  onToggleFullscreen,
  onClose,
  className,
}: ReadingPaneProps<T>) {
  // État de chargement
  if (loading) {
    return <DetailPanelSkeleton className={className} />;
  }

  // État vide
  if (!item) {
    return (
      <EmptyReadingPane
        message={emptyMessage}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('flex flex-col h-full bg-white dark:bg-slate-950', className)}>
        {/* Header */}
        <header className="shrink-0 border-b border-slate-200 dark:border-slate-800/60">
          {/* Top bar with navigation and actions */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800/40">
            {/* Navigation */}
            {navigation && (
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconButton
                      icon={<ChevronLeft />}
                      aria-label="Précédent"
                      variant="ghost"
                      size="sm"
                      disabled={!navigation.hasPrevious}
                      onClick={navigation.onPrevious}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Précédent</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconButton
                      icon={<ChevronRight />}
                      aria-label="Suivant"
                      variant="ghost"
                      size="sm"
                      disabled={!navigation.hasNext}
                      onClick={navigation.onNext}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Suivant</TooltipContent>
                </Tooltip>
                {navigation.currentIndex !== undefined && navigation.totalCount !== undefined && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    {navigation.currentIndex + 1} / {navigation.totalCount}
                  </span>
                )}
              </div>
            )}

            <div className="flex-1" />

            {/* Secondary actions */}
            {secondaryActions.map((action, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <IconButton
                    icon={action.icon}
                    aria-label={action.label}
                    variant="ghost"
                    size="sm"
                    disabled={action.disabled}
                    onClick={action.onClick}
                  />
                </TooltipTrigger>
                <TooltipContent>{action.label}</TooltipContent>
              </Tooltip>
            ))}

            {onToggleFullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconButton
                    icon={fullscreen ? <Minimize2 /> : <Maximize2 />}
                    aria-label={fullscreen ? 'Réduire' : 'Agrandir'}
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFullscreen}
                  />
                </TooltipTrigger>
                <TooltipContent>{fullscreen ? 'Réduire' : 'Agrandir'}</TooltipContent>
              </Tooltip>
            )}

            {onClose && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconButton
                    icon={<X />}
                    aria-label="Fermer"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  />
                </TooltipTrigger>
                <TooltipContent>Fermer</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Title section */}
          <div className="px-4 py-4 space-y-3">
            {/* Reference + Title */}
            <div className="flex items-start gap-3">
              {reference && (
                <ReferenceNumber value={reference} variant="badge" />
              )}
              <h2 className="flex-1 text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {title}
              </h2>
            </div>

            {/* Status + Priority */}
            {(status || priority) && (
              <div className="flex items-center gap-2">
                {status && (
                  <StatusBadge variant={status.variant} size="sm">
                    {status.label}
                  </StatusBadge>
                )}
                {priority && priority !== 'none' && (
                  <PriorityBadge priority={priority} size="sm" />
                )}
              </div>
            )}
          </div>
        </header>

        {/* Metadata section */}
        {metadata.length > 0 && (
          <div className="shrink-0 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/60">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {metadata.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.icon && (
                    <span className="text-slate-400 dark:text-slate-500 shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <dt className="text-slate-500 dark:text-slate-400 shrink-0">
                    {item.label}:
                  </dt>
                  <dd className="text-slate-700 dark:text-slate-300 truncate">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer with primary actions */}
        {primaryActions.length > 0 && (
          <footer className="shrink-0 border-t border-slate-200 dark:border-slate-800/60 px-4 py-3">
            <div className="flex items-center gap-2">
              {primaryActions.map((action, i) => (
                <ActionButton
                  key={i}
                  variant={action.variant ?? 'primary'}
                  iconLeft={action.icon}
                  loading={action.loading}
                  disabled={action.disabled}
                  onClick={action.onClick}
                >
                  {action.label}
                </ActionButton>
              ))}
            </div>
          </footer>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * EmptyReadingPane — État vide enrichi
 */
export function EmptyReadingPane({
  message = 'Sélectionnez un élément',
  description = 'Cliquez sur un élément de la liste pour afficher ses détails',
  shortcuts,
  className,
}: {
  message?: string;
  description?: string;
  shortcuts?: Array<{ key: string; label: string }>;
  className?: string;
}) {
  const defaultShortcuts = [
    { key: '↑/↓', label: 'Naviguer' },
    { key: 'Enter', label: 'Ouvrir' },
    { key: 'E', label: 'Éditer' },
    { key: 'Del', label: 'Supprimer' },
  ];

  const displayShortcuts = shortcuts ?? defaultShortcuts;

  return (
    <div className={cn('flex flex-col items-center justify-center h-full p-8', className)}>
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4 text-sky-500" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <ArrowDownRight className="w-3 h-3 text-amber-500" />
        </div>
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 text-center mb-2">
        {message}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-6">
        {description}
      </p>

      {/* Keyboard shortcuts */}
      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-4">
        <Keyboard className="w-3.5 h-3.5 mr-1" />
        <span>Raccourcis clavier</span>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {displayShortcuts.map((shortcut, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400">
              {shortcut.key}
            </kbd>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {shortcut.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ReadingPaneSection — Section avec titre dans le contenu
 */
export function ReadingPaneSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-6', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}
