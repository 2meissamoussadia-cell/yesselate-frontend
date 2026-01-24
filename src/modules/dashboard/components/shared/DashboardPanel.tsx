/**
 * DashboardPanel
 * Surface standardisée (sobre, lisible, “outil métier”).
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type DashboardPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardPanel({ children, className }: DashboardPanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-800/60 bg-slate-900/25',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.03)]',
        'backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

