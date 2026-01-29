'use client';

/**
 * Pied de la sidebar — Bouton réduire/déplier
 * Design YESSALATE BMO, ARIA, clavier
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SidebarFooterProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const SidebarFooter = React.memo(function SidebarFooter({
  collapsed = false,
  onToggleCollapse,
  className,
}: SidebarFooterProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 p-2 border-t border-slate-700/60',
        className
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium',
          'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200',
          'focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
          'transition-all duration-300'
        )}
        aria-label={
          collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'
        }
      >
        {collapsed ? (
          <span aria-hidden>▶</span>
        ) : (
          <>
            <span aria-hidden>◀</span>
            <span>Réduire</span>
          </>
        )}
      </button>
    </div>
  );
});
