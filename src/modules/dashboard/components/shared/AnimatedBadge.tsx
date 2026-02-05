/**
 * Badge animé avec indicateur de statut
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/cn';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'critical' | 'info';
  pulse?: boolean;
  className?: string;
}

export const AnimatedBadge = memo(function AnimatedBadge({ 
  children, 
  variant = 'info', 
  pulse = false,
  className 
}: AnimatedBadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        variantStyles[variant],
        pulse && 'animate-pulse',
        className
      )}
    >
      {pulse && (
        <span
          className={cn(
            'relative flex h-2 w-2',
            variant === 'success' && 'before:bg-emerald-400',
            variant === 'warning' && 'before:bg-amber-400',
            variant === 'critical' && 'before:bg-red-400',
            variant === 'info' && 'before:bg-blue-400'
          )}
        >
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              variant === 'success' && 'bg-emerald-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'critical' && 'bg-red-400',
              variant === 'info' && 'bg-blue-400'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'success' && 'bg-emerald-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'critical' && 'bg-red-400',
              variant === 'info' && 'bg-blue-400'
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
});

