'use client';

/**
 * LoadingStates — Composants de chargement type Outlook
 * 
 * Skeletons et états de chargement professionnels.
 * Remplace le badge "Compiling..." par des indicateurs subtils.
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

/**
 * Skeleton de base avec animation pulse
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton pour une ligne de liste (type alerte/message)
 */
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40', className)}>
      {/* Indicateur */}
      <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
        <Skeleton className="w-2 h-2 rounded-full" />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Top line */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>

        {/* Title line */}
        <div className="flex items-start gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-20 rounded-md ml-auto" />
        </div>

        {/* Subtitle line */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Description */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour la liste complète
 */
export function ListSkeleton({ 
  count = 5, 
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('divide-y divide-slate-100 dark:divide-slate-800/40', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour le panneau de détail
 */
export function DetailPanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-4 w-32 ml-auto" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800/60 p-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md ml-auto" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour la sidebar
 */
export function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full p-2', className)}>
      {/* Header */}
      <div className="px-3 py-3 mb-2">
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Section 1 */}
      <div className="mb-4">
        <Skeleton className="h-3 w-16 mx-3 mb-2" />
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-6 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div>
        <Skeleton className="h-3 w-20 mx-3 mb-2" />
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-6 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Indicateur de chargement inline (remplace "Compiling...")
 */
export function InlineLoader({
  text = 'Chargement...',
  size = 'sm',
  className,
}: {
  text?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const sizeClasses = {
    xs: 'text-xs gap-1',
    sm: 'text-sm gap-1.5',
    md: 'text-base gap-2',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-slate-500 dark:text-slate-400',
        sizeClasses[size],
        className
      )}
    >
      <Loader2 className={cn('animate-spin', iconSizes[size])} />
      <span>{text}</span>
    </span>
  );
}

/**
 * État de chargement plein écran (pour les pages)
 */
export function PageLoader({
  title = 'Chargement...',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700" />
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Overlay de chargement (pour les modales/panneaux)
 */
export function LoadingOverlay({
  visible,
  text = 'Traitement...',
}: {
  visible: boolean;
  text?: string;
}) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {text}
        </span>
      </div>
    </div>
  );
}
