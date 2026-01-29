/**
 * DashboardPanel
 * Surface standardisée (sobre, lisible, "outil métier").
 * Utilise les design tokens pour la cohérence (voir lib/design-tokens.ts).
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { colors, borderRadius, shadows, transitions } from '../../utils/dashboardDesignTokens';

export type DashboardPanelProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'sm' | 'md' | 'lg';
};

const paddingClasses = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
} as const;

export function DashboardPanel({
  children,
  className,
  style,
  padding = 'md',
}: DashboardPanelProps) {
  return (
    <div
      className={cn(
        colors.border.accent,
        colors.bg.panel,
        borderRadius.lg,
        'backdrop-blur',
        'shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]',
        transitions.standard,
        'hover:shadow-[0_12px_36px_-18px_rgba(0,0,0,0.9)]',
        paddingClasses[padding],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
