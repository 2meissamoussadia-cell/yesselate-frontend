/* eslint-disable react/no-unescaped-entities */
/**
 * DashboardPageShell
 * Conteneur standardisé pour toutes les vues /maitre-ouvrage/dashboard
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type DashboardPageShellProps = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode; // search / export / filtres
  children: React.ReactNode;
  className?: string;
};

export function DashboardPageShell({
  title,
  subtitle,
  rightSlot,
  children,
  className,
}: DashboardPageShellProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-50">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            ) : null}
          </div>

          {rightSlot ? (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {rightSlot}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

