'use client';

/**
 * SectionHeader BMO — Titre + description pour blocs métier (pipeline, tableaux, etc.).
 */

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = memo(function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
});
