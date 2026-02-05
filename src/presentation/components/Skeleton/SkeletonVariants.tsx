/**
 * Skeleton Variants
 * Variantes de skeleton pour différents cas d'usage
 */

'use client';

import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700/50';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer', // Nécessite une animation custom
    none: '',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? undefined : '1em'),
      }}
    />
  );
}

/**
 * SkeletonText - Pour le texte
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Pour les cartes
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-xl border border-slate-700/50 space-y-3', className)}>
      <Skeleton variant="rounded" height={20} width="40%" />
      <Skeleton variant="rounded" height={32} width="80%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="70%" />
    </div>
  );
}

/**
 * SkeletonTable - Pour les tableaux
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-slate-700/50">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width={i === 0 ? 200 : '100%'} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              variant="text"
              width={colIdx === 0 ? 200 : '100%'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonAvatar - Pour les avatars
 */
export function SkeletonAvatar({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

/**
 * SkeletonButton - Pour les boutons
 */
export function SkeletonButton({
  width = 100,
  height = 36,
  className,
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={height}
      className={className}
    />
  );
}

