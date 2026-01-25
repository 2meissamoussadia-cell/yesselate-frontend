/**
 * DashboardShell
 * Layout premium "logiciel métier" - Structure sobre et respirante
 * Remplace les effets "gaming" par une hiérarchie visuelle claire
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
};

export function DashboardShell({ header, subnav, children, className }: DashboardShellProps) {
  return (
    <div
      className={cn(
        // Fond sobre "produit" : profond, avec une lumière très légère
        'h-full w-full min-w-0 overflow-hidden',
        'bg-slate-950',
        'relative',
        className
      )}
    >
      {/* Glow discret (pas d'effet tape-à-l'œil) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-52 -right-52 h-[620px] w-[620px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {header ? (
          <div className={cn('shrink-0 border-b backdrop-blur', colors.border.default, 'bg-slate-950/40')}>
            <div className={cn(spacing.paddingX.md, 'sm:px-6', 'py-3 sm:py-3.5')}>{header}</div>
          </div>
        ) : null}

        {subnav ? (
          <div className={cn('shrink-0 border-b backdrop-blur', colors.border.default, 'bg-slate-950/20')}>
            <div className={cn(spacing.paddingX.md, 'sm:px-6', 'py-2')}>{subnav}</div>
          </div>
        ) : null}

        {/* Zone contenu - respiration et rythme */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className={cn(spacing.paddingX.md, 'sm:px-6', spacing.paddingY.md, 'sm:py-6')}>{children}</div>
        </div>
      </div>
    </div>
  );
}
