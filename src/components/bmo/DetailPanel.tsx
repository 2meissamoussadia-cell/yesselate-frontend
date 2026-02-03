'use client';

/**
 * DetailPanel — Panneau de détail générique type Outlook.
 * Slots pour header et contenu, réutilisable pour tous les modules BMO.
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : item, renderHeader, renderContent, emptyMessage, loading.
 * - Page gère : chargement, données, actions.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface DetailPanelProps<T> {
  item: T | null;
  /** Rendu du header (titre, métadonnées, actions) */
  renderHeader?: (item: T) => React.ReactNode;
  /** Rendu du contenu principal */
  renderContent: (item: T) => React.ReactNode;
  emptyMessage?: string;
  /** État de chargement du détail */
  loading?: boolean;
  /** Actions secondaires optionnelles en pied de panneau */
  renderFooter?: (item: T) => React.ReactNode;
  className?: string;
}

export function DetailPanel<T>({
  item,
  renderHeader,
  renderContent,
  emptyMessage = 'Sélectionnez un élément',
  loading = false,
  renderFooter,
  className,
}: DetailPanelProps<T>) {
  if (!item) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-8 text-slate-500 dark:text-slate-400 text-center',
          className
        )}
        aria-live="polite"
      >
        {emptyMessage}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col flex-1 min-h-0 overflow-hidden', className)}
      aria-label="Détail"
    >
      {renderHeader && (
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 overflow-hidden">
          {renderHeader(item)}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {renderContent(item)}
      </div>

      {renderFooter && (
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800/60">
          {renderFooter(item)}
        </div>
      )}
    </div>
  );
}
