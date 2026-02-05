/**
 * Badge "enterprise" sobre pour les niveaux de criticité
 * Design minimaliste : pas de gradients, pas de bordures épaisses
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/cn';

export type EnterpriseBadgeVariant = 'critique' | 'haute' | 'moyenne' | 'faible' | 'success' | 'warning' | 'info';

interface EnterpriseBadgeProps {
  variant: EnterpriseBadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<EnterpriseBadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  critique: {
    bg: 'bg-red-500/10',
    text: 'text-red-300',
    border: 'border-red-500/20',
    dot: 'bg-red-400/70',
  },
  haute: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400/70',
  },
  moyenne: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400/70',
  },
  faible: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400/70',
  },
  success: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400/70',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400/70',
  },
  info: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400/70',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export const EnterpriseBadge = memo(function EnterpriseBadge({
  variant,
  children,
  className,
  size = 'md',
}: EnterpriseBadgeProps) {
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        styles.bg,
        styles.text,
        styles.border,
        sizeStyle,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {children}
    </span>
  );
});
