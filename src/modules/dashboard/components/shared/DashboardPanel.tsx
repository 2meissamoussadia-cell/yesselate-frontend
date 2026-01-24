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
  style?: React.CSSProperties;
};

export function DashboardPanel({ children, className, style }: DashboardPanelProps) {
  return (
    <div
      className={cn(
        borderRadius.lg,
        'border',
        colors.border.default,
        colors.bg.panel,
        'shadow-[0_0_0_1px_rgba(255,255,255,0.03)]',
        'backdrop-blur-sm',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

