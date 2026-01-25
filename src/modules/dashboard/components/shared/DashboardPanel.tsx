/**
 * DashboardPanel
 * Surface standardisée (sobre, lisible, "outil métier").
 * Style enterprise moderne avec bordures discrètes et fond sobre
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type DashboardPanelProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'sm' | 'md' | 'lg';
};

export function DashboardPanel({ 
  children, 
  className, 
  style,
  padding = 'md'
}: DashboardPanelProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-800/70',
        'bg-slate-950/35 backdrop-blur',
        'shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]',
        paddingClasses[padding],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
