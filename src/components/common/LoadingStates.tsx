'use client';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

// ============================================
// LOADING SPINNER
// ============================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-blue-500', sizeClasses[size])} />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
}

// ============================================
// PAGE LOADER
// ============================================

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = 'Chargement...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

// ============================================
// SKELETON LOADER
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-700/50',
        variantClasses[variant],
        className
      )}
    />
  );
}

// ============================================
// SKELETON COMPONENTS
// ============================================

export function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-3">
      <Skeleton className="h-6 w-3/4" variant="text" />
      <Skeleton className="h-4 w-full" variant="text" />
      <Skeleton className="h-4 w-5/6" variant="text" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" variant="rectangular" />
        <Skeleton className="h-8 w-20" variant="rectangular" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-slate-700/50">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" variant="text" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" variant="text" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <Skeleton className="w-12 h-12" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// BUTTON LOADING STATE
// ============================================

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLoading({ isLoading, children, className }: ButtonLoadingProps) {
  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        </div>
      )}
      <div className={cn(isLoading && 'opacity-0')}>{children}</div>
    </div>
  );
}

// ============================================
// INLINE LOADER
// ============================================

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      {text && <span>{text}</span>}
    </div>
  );
}

// ============================================
// FULL SCREEN LOADER (Overlay)
// ============================================

interface FullScreenLoaderProps {
  isLoading: boolean;
  text?: string;
}

export function FullScreenLoader({ isLoading, text = 'Chargement...' }: FullScreenLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}
