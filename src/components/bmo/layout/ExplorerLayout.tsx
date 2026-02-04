'use client';

/**
 * ExplorerLayout — Layout maître/détail type explorateur (nav à gauche, contenu à droite).
 * Réutilisable pour Documents, Chantiers, Engagements, Gouvernance.
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface ExplorerLayoutProps {
  /** Volet de navigation gauche (arborescence, dossiers, filtres) */
  nav: React.ReactNode;
  /** Panneau droit (contenu principal) */
  content: React.ReactNode;
  className?: string;
}

export function ExplorerLayout({ nav, content, className }: ExplorerLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-1 min-h-0 min-w-0 max-w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 overflow-hidden',
        className
      )}
    >
      {/* Navigation pane (arborescence, dossiers, filtres) */}
      <aside
        className="w-64 max-w-xs min-w-[14rem] border-r border-slate-800/70 bg-slate-950/90 overflow-y-auto shrink-0"
        aria-label="Navigation"
      >
        {nav}
      </aside>

      {/* Panneau droit (contenu principal) */}
      <section
        className="flex-1 min-w-0 overflow-hidden flex flex-col bg-slate-950/60"
        aria-label="Contenu"
      >
        {content}
      </section>
    </div>
  );
}
