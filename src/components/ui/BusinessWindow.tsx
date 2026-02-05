'use client';

/**
 * BusinessWindow — Fenêtre métier type Windows / Explorer.
 * Cadre central avec header local (titre + icônes), contenu, footer optionnel.
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface BusinessWindowProps {
  /** Titre affiché dans la barre de la fenêtre (optionnel : si absent, pas de barre de titre) */
  title?: string;
  children: React.ReactNode;
  /** Afficher la barre de titre (défaut true si title fourni) */
  showHeader?: boolean;
  /** Afficher les pastilles type fenêtre (vert / jaune / rouge) */
  showWindowButtons?: boolean;
  /** Contenu optionnel à droite du titre (actions, etc.) */
  headerActions?: React.ReactNode;
  /** Footer léger sous le contenu */
  footer?: React.ReactNode;
  className?: string;
}

export function BusinessWindow({
  title,
  children,
  showHeader = true,
  showWindowButtons = true,
  headerActions,
  footer,
  className,
}: BusinessWindowProps) {
  const hasHeader = showHeader && title != null && title !== '';

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-800/70 bg-slate-950/80',
        'shadow-[0_18px_50px_rgba(0,0,0,0.6)] overflow-hidden',
        className
      )}
      aria-label={title ?? undefined}
    >
      {hasHeader && (
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/70 bg-slate-900/70">
          <h2 className="text-sm font-semibold text-slate-100 truncate min-w-0">
            {title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            {showWindowButtons && (
              <div className="flex items-center gap-1" aria-hidden>
                <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                <span className="h-2 w-2 rounded-full bg-rose-500/60" />
              </div>
            )}
          </div>
        </header>
      )}
      <div className={cn('min-h-0', hasHeader ? 'p-4' : 'p-4 pt-2')}>{children}</div>
      {footer && (
        <footer className="px-4 py-2 border-t border-slate-800/70 bg-slate-900/50">
          {footer}
        </footer>
      )}
    </section>
  );
}
