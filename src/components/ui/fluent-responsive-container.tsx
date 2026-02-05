'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * FluentResponsiveContainer - Container responsive Windows 11
 * S'adapte automatiquement aux différentes tailles d'écran
 */

interface FluentResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'full' | 'centered';
}

export const FluentResponsiveContainer = React.forwardRef<
  HTMLDivElement,
  FluentResponsiveContainerProps
>(({ className, variant = 'default', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'w-full',
        variant === 'default' && 'max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8',
        variant === 'full' && 'px-4 sm:px-6 lg:px-8',
        variant === 'centered' && 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
FluentResponsiveContainer.displayName = 'FluentResponsiveContainer';

/**
 * FluentResponsiveGrid - Grille responsive
 */
interface FluentResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const FluentResponsiveGrid = React.forwardRef<
  HTMLDivElement,
  FluentResponsiveGridProps
>(({ className, cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 4 }, gap = 4, children, ...props }, ref) => {
  const colClasses = cn(
    'grid',
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`
  );

  return (
    <div
      ref={ref}
      className={cn(colClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
});
FluentResponsiveGrid.displayName = 'FluentResponsiveGrid';

/**
 * FluentResponsiveStack - Stack responsive (horizontal sur desktop, vertical sur mobile)
 */
interface FluentResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  breakpoint?: 'sm' | 'md' | 'lg';
}

export const FluentResponsiveStack = React.forwardRef<
  HTMLDivElement,
  FluentResponsiveStackProps
>(({ className, direction = 'horizontal', breakpoint = 'md', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex gap-4',
        direction === 'horizontal'
          ? `flex-col ${breakpoint}:flex-row`
          : `flex-row ${breakpoint}:flex-col`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
FluentResponsiveStack.displayName = 'FluentResponsiveStack';

