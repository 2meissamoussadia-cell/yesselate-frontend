'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface OutlookLikeLoadingSkeletonProps {
  /** Libellé pour les lecteurs d'écran (ex. "Chargement des demandes") */
  ariaLabel: string;
  /**
   * - 'default' : sidebar + barre + liste (380px) + zone détail (layout type Outlook 3 colonnes)
   * - 'simple' : sidebar + barre + zone principale unique (ex. planning)
   */
  variant?: 'default' | 'simple';
  /** Hauteur du conteneur (ex. "h-full" ou "h-[calc(100vh-8rem)]") */
  className?: string;
}

/**
 * Skeleton réutilisable pour les vues type Outlook (sidebar | barre | liste | détail).
 * Utilisé par tous les loadings des modules Outlook-like (demandes, validation-bc, alertes, etc.).
 */
export function OutlookLikeLoadingSkeleton({
  ariaLabel,
  variant = 'default',
  className = 'h-full',
}: OutlookLikeLoadingSkeletonProps) {
  return (
    <div
      className={`flex gap-0 animate-pulse ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      {/* Sous-nav gauche */}
      <div className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 shrink-0">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barre d'outils */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 px-4 shrink-0">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
          {variant === 'default' && <Skeleton className="h-9 w-24" />}
        </div>
        {/* Contenu */}
        {variant === 'default' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr]">
            <div className="border-r border-slate-200 dark:border-slate-800 p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <div className="hidden md:flex items-center justify-center p-8">
              <Skeleton className="h-32 w-64" />
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
