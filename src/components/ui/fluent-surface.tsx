'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Surface "Fluent-like" (Mica/Acrylic) en Tailwind.
 * Idée: reproduire les surfaces Windows 11 sans changer le stack.
 */
export const FluentSurface = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    tone?: 'mica' | 'acrylic' | 'solid';
  }
>(({ className, tone = 'mica', ...props }, ref) => {
  const base =
    'rounded-xl border shadow-sm';

  const tones: Record<'mica' | 'acrylic' | 'solid', string> = {
    // Mica-like: légèrement translucide + blur léger
    mica:
      'bg-white/70 border-slate-200/80 backdrop-blur-md ' +
      'dark:bg-slate-900/40 dark:border-slate-700/60',
    // Acrylic: plus transparent + blur plus fort
    acrylic:
      'bg-white/55 border-slate-200/70 backdrop-blur-lg ' +
      'dark:bg-slate-900/30 dark:border-slate-700/50',
    // Solid: fallback stable
    solid:
      'bg-white border-slate-200 ' +
      'dark:bg-slate-900 dark:border-slate-700/60',
  };

  return (
    <div
      ref={ref}
      className={cn(base, tones[tone], className)}
      {...props}
    />
  );
});
FluentSurface.displayName = 'FluentSurface';


