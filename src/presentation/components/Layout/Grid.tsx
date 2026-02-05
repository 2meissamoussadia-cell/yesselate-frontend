/**
 * Grid Component
 * Grille responsive
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  className?: string;
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
};

const responsiveColsClasses = {
  1: { sm: 'sm:grid-cols-1', md: 'md:grid-cols-1', lg: 'lg:grid-cols-1', xl: 'xl:grid-cols-1' },
  2: { sm: 'sm:grid-cols-2', md: 'md:grid-cols-2', lg: 'lg:grid-cols-2', xl: 'xl:grid-cols-2' },
  3: { sm: 'sm:grid-cols-3', md: 'md:grid-cols-3', lg: 'lg:grid-cols-3', xl: 'xl:grid-cols-3' },
  4: { sm: 'sm:grid-cols-4', md: 'md:grid-cols-4', lg: 'lg:grid-cols-4', xl: 'xl:grid-cols-4' },
  5: { sm: 'sm:grid-cols-5', md: 'md:grid-cols-5', lg: 'lg:grid-cols-5', xl: 'xl:grid-cols-5' },
  6: { sm: 'sm:grid-cols-6', md: 'md:grid-cols-6', lg: 'lg:grid-cols-6', xl: 'xl:grid-cols-6' },
  12: { sm: 'sm:grid-cols-12', md: 'md:grid-cols-12', lg: 'lg:grid-cols-12', xl: 'xl:grid-cols-12' },
};

export function Grid({
  children,
  cols = 1,
  gap = 4,
  className,
  responsive,
}: GridProps) {
  const responsiveClasses = responsive
    ? Object.entries(responsive)
        .map(([breakpoint, cols]) => {
          const classes = responsiveColsClasses[cols];
          return classes[breakpoint as 'sm' | 'md' | 'lg' | 'xl'];
        })
        .join(' ')
    : '';

  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        gapClasses[gap],
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

