'use client';

/**
 * RightHoverSidebar — Sidebar droite qui se replie (6px) et s’ouvre au survol (w-72).
 * Sans hover : poignée visuelle ; au survol : panneau de détails.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface RightHoverSidebarProps {
  /** Contenu principal (page BMO) */
  children: React.ReactNode;
  /** Contenu de la sidebar droite (détails, infos) */
  sidebarContent: React.ReactNode;
  className?: string;
}

export function RightHoverSidebar({
  children,
  sidebarContent,
  className,
}: RightHoverSidebarProps) {
  return (
    <div className={cn('group flex h-full min-h-0 min-w-0', className)}>
      {/* Contenu principal */}
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Sidebar droite : w-6 par défaut, w-72 au hover */}
      <aside
        className={cn(
          'relative h-full shrink-0 overflow-hidden',
          'w-6 group-hover:w-72',
          'transition-[width] duration-300 ease-out',
          'border-l border-slate-800 bg-slate-950/95'
        )}
        aria-label="Panneau de détails"
      >
        {/* Poignée visible quand repliée */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r bg-slate-700/80 pointer-events-none"
          aria-hidden
        />

        {/* Contenu visible quand élargie (w-72 = 18rem) */}
        <div className="h-full w-72 min-w-[18rem] px-3 py-2 text-xs text-slate-200 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </div>
  );
}
