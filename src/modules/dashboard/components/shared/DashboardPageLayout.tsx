/**
 * DashboardPageLayout
 * Wrapper global pour standardiser toutes les pages du dashboard
 * Applique un layout cohérent : max-width, padding, sections avec gap-4
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface DashboardPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1440px]',
  '2xl': 'max-w-[1600px]',
  full: 'max-w-full',
};

const paddingClasses = {
  sm: 'p-4 sm:p-5',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * Layout wrapper pour toutes les pages du dashboard
 * Standardise : max-width, padding, espacement entre sections
 */
export function DashboardPageLayout({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
}: DashboardPageLayoutProps) {
  return (
    <div className={cn('w-full min-w-0 max-w-full overflow-x-hidden mx-auto', maxWidthClasses[maxWidth], paddingClasses[padding], className)}>
      <div className="space-y-4 sm:space-y-6 min-w-0">
        {children}
      </div>
    </div>
  );
}

/**
 * Section wrapper pour regrouper du contenu avec un titre
 */
export interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  /** Alias for subtitle (used by many pages); rendered as subtitle when subtitle is not set */
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  subtitle,
  description,
  icon: Icon,
  action,
  children,
  className,
}: DashboardSectionProps) {
  const sectionSubtitle = subtitle ?? description;
  return (
    <div className={cn('space-y-4', className)}>
      {(title || sectionSubtitle || Icon || action) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="inline-flex items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/40 p-2 flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-slate-50 font-semibold text-base sm:text-lg truncate">
                  {title}
                </h3>
              )}
              {sectionSubtitle && (
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5 truncate">
                  {sectionSubtitle}
                </p>
              )}
            </div>
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Grid wrapper pour les cartes KPI et autres éléments en grille
 */
export interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gridColumnsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

const gridGapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export function DashboardGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
}: DashboardGridProps) {
  return (
    <div className={cn('grid min-w-0', gridColumnsClasses[columns], gridGapClasses[gap], className)}>
      {children}
    </div>
  );
}
