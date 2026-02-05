'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * FluentSkeleton - Style Windows 11 avec nouveau système de couleurs
 * 
 * Animation subtile de "shimmer" pour les états de chargement
 * Utilise les variables CSS : --surface-2, --border
 */
const FluentSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'text' | 'circular' | 'rectangular';
  }
>(({ className, variant = 'rectangular', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'animate-pulse',
        'bg-[rgb(var(--surface-2)/0.6)]',
        'rounded-lg',
        // Shimmer effect (Windows 11 style)
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-[rgb(var(--border)/0.3)] before:to-transparent',
        // Variants
        variant === 'text' && 'h-4 w-full',
        variant === 'circular' && 'rounded-full aspect-square',
        variant === 'rectangular' && 'h-20 w-full',
        className
      )}
      {...props}
    />
  );
});
FluentSkeleton.displayName = 'FluentSkeleton';

export { FluentSkeleton };
