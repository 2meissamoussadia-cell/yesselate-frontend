/**
 * Skeleton Procore-style pour le chargement de la grille 3D (Health Spheres)
 * Affiche une grille de cercles animés pendant le chargement du portfolio.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { colors } from '../../utils/dashboardDesignTokens';

const ROWS = 4;
const COLS = 5;
const TOTAL = ROWS * COLS;

export function CockpitSpheresLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden min-h-[320px] md:min-h-[480px]',
        colors.border.default,
        colors.bg.secondary,
        className
      )}
    >
      {/* Header skeleton */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800/60 bg-slate-950/40 flex-wrap gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-4 w-48 rounded-lg dashboard-skeleton-shimmer" />
          <div className="h-6 w-16 rounded-full dashboard-skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-20 rounded dashboard-skeleton-shimmer" />
          <div className="h-4 w-16 rounded dashboard-skeleton-shimmer" />
        </div>
      </div>
      {/* Grille de sphères (cercles) en placeholder */}
      <div className="h-[320px] md:h-[420px] w-full bg-slate-950/80 flex flex-col items-center justify-center gap-4 p-6">
        <div
          className="grid gap-3 sm:gap-4 items-center justify-center"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            maxWidth: 320,
            aspectRatio: '5 / 4',
          }}
        >
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-full dashboard-skeleton-shimmer w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              style={{ animationDelay: `${(i % 5) * 0.05}s` }}
            />
          ))}
        </div>
        <p className="text-center text-slate-500 text-sm">Chargement du portfolio 3D…</p>
      </div>
    </div>
  );
}
