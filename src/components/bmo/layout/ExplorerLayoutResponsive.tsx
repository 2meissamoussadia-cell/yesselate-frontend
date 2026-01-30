'use client';

/**
 * ExplorerLayoutResponsive — Navigation pane responsive.
 * Desktop : sidebar à gauche ; mobile : drawer ouvert par bouton burger.
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExplorerLayoutResponsiveProps {
  nav: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function ExplorerLayoutResponsive({
  nav,
  content,
  className,
}: ExplorerLayoutResponsiveProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-1 min-h-0 min-w-0 max-w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 overflow-hidden',
        className
      )}
    >
      {/* Desktop sidebar */}
      <aside
        className="hidden md:block w-64 min-w-[16rem] border-r border-slate-800/70 bg-slate-950/90 overflow-y-auto shrink-0"
        aria-label="Navigation"
      >
        {nav}
      </aside>

      {/* Section droite : toggle mobile + contenu */}
      <section className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Barre mobile : bouton burger */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Ouvrir la navigation"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>
          <span className="text-xs text-slate-200">Navigation</span>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="fixed inset-0 z-40 flex md:hidden"
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <div
              className="w-64 max-w-[75vw] h-full border-r border-slate-800 bg-slate-950/95 overflow-y-auto shrink-0 flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 shrink-0">
                <span className="text-xs font-medium text-slate-200">Navigation</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                  aria-label="Fermer la navigation"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{nav}</div>
            </div>
            <div className="flex-1 bg-black/60" aria-hidden />
          </div>
        )}

        {/* Panneau droit (contenu principal) */}
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col bg-slate-950/60">
          {content}
        </div>
      </section>
    </div>
  );
}
