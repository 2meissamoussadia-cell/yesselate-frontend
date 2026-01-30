'use client';

/**
 * ContentPaneWithGrid — Panneau droit avec structure Tailwind pour agGrid.
 * flex-1 min-h-0 sur tous les parents + h-full sur le conteneur agGrid pour que la grille prenne toute la hauteur.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ContentPaneWithGridProps {
  /** Barre de commandes au-dessus de la grille */
  commandBar?: React.ReactNode;
  /** Contenu principal (ex. AgGridReact dans un div .h-full.w-full) */
  children: React.ReactNode;
  className?: string;
}

export function ContentPaneWithGrid({
  commandBar,
  children,
  className,
}: ContentPaneWithGridProps) {
  return (
    <div
      className={cn(
        'flex-1 min-h-0 min-w-0 flex flex-col bg-slate-950/60',
        className
      )}
    >
      {/* Command bar */}
      {commandBar && (
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/80 text-xs shrink-0">
          {commandBar}
        </div>
      )}

      {/* Conteneur grille : flex-1 min-h-0 pour prendre la place restante */}
      <div className="flex-1 min-h-0 min-w-0">
        {/* La div parent de AgGridReact doit avoir une hauteur explicite (h-full) */}
        <div className="h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
