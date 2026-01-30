/**
 * DashboardShell (layout partagé)
 *
 * Layout seul : header optionnel, subnav optionnel, zone contenu scrollable.
 * À utiliser quand la page fournit déjà la sidebar et le reste (ex. maitre-ouvrage/dashboard).
 *
 * Pour un shell complet (Sidebar + KPI + ViewRouter), voir le module root : DashboardShell
 * (src/modules/dashboard/DashboardShell.tsx) ou l’alias DashboardShellShared.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { colors, spacing, borderRadius, transitions, interactive } from '../../utils/dashboardDesignTokens';

type DashboardShellProps = {
  header?: React.ReactNode;
  subnav?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** À true quand le shell est déjà dans un main (ex. BmoLayoutShell) pour éviter doublon main / id main-content */
  embedded?: boolean;
};

export function DashboardShell({ header, subnav, children, className, embedded }: DashboardShellProps) {
  return (
    <div
      className={cn(
        // Fond sobre "produit" : cadre strict = viewport, pas de scroll horizontal
        'h-full w-full min-w-0 max-w-full overflow-x-hidden overflow-hidden',
        'bg-slate-950',
        'relative',
        className
      )}
    >
      {/* Glow discret (pas d'effet tape-à-l'œil) - adouci pour moins de distraction */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-blue-500/[0.07] blur-3xl" />
        <div className="absolute -bottom-52 -right-52 h-[560px] w-[560px] rounded-full bg-slate-500/[0.05] blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {header ? (
          <div className={cn('shrink-0 min-w-0 border-b backdrop-blur-sm', colors.border.default, 'bg-slate-950/50')}>
            <div className={cn('min-w-0', spacing.paddingX.md, 'sm:px-6', 'py-3 sm:py-3.5')}>{header}</div>
          </div>
        ) : null}

        {subnav ? (
          <div className={cn('shrink-0 min-w-0 border-b backdrop-blur-sm', colors.border.default, 'bg-slate-950/25')}>
            <div className={cn('min-w-0', spacing.paddingX.md, 'sm:px-6', 'py-2')}>{subnav}</div>
          </div>
        ) : null}

        {/* Zone contenu - cadre horizontal, défilement vertical uniquement (évite doublon main/id si embedded) */}
        {embedded ? (
          <div
            role="region"
            aria-label="Contenu dashboard"
            className="flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto scroll-smooth scroll-touch scrollbar-dashboard"
          >
            <div className={cn('min-w-0 max-w-full', spacing.paddingX.md, 'sm:px-6', spacing.paddingY.md, 'sm:py-6')}>{children}</div>
          </div>
        ) : (
          <main id="main-content" className="flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto scroll-smooth scroll-touch scrollbar-dashboard" role="main">
            <div className={cn('min-w-0 max-w-full', spacing.paddingX.md, 'sm:px-6', spacing.paddingY.md, 'sm:py-6')}>{children}</div>
          </main>
        )}
      </div>
    </div>
  );
}
