'use client';

/**
 * Placeholder BMO — Zone de contenu à venir (graphique, tableau).
 * courbe = true pour un placeholder type courbe (paiements prévus vs réalisés).
 */

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { LineChart } from 'lucide-react';

export interface PlaceholderProps {
  children: React.ReactNode;
  courbe?: boolean;
  className?: string;
}

export const Placeholder = memo(function Placeholder({
  children,
  courbe = false,
  className,
}: PlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 text-center text-slate-500 text-sm',
        'min-h-[120px]',
        className
      )}
      aria-hidden
    >
      {courbe && (
        <LineChart className="h-8 w-8 text-slate-600/60" aria-hidden />
      )}
      <span className="max-w-[280px]">{children}</span>
    </div>
  );
});
