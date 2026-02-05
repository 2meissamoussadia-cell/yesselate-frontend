'use client';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================
// SPINNER
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'slate';
}

export function Spinner({ size = 'md', className, color = 'primary' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-500',
    white: 'text-white',
    slate: 'text-slate-400',
  };

  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)}
    />
  );
}

// ============================================
// SKELETON LOADER
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  style?: React.CSSProperties;
}

export function Skeleton({ className, variant = 'rectangular', style }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-700/50',
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
}

// ============================================
// SKELETON TABLE
// ============================================

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* En-tête */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5" />
        ))}
      </div>

      {/* Lignes */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-10" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// SKELETON CARD
// ============================================

interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({ className, showAvatar = false, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn('p-4 rounded-xl bg-slate-800/30 border border-slate-700/50', className)}>
      <div className="flex gap-4">
        {showAvatar && <Skeleton variant="circular" className="w-12 h-12" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          {Array.from({ length: lines }).map((_, i) => {
            const widthPercent = 100 - i * 10;
            return (
              <Skeleton 
                key={i} 
                className="h-4" 
                style={{ width: `${widthPercent}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOADING OVERLAY
// ============================================

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingOverlay({ message, fullScreen = false, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-slate-900/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 rounded-xl',
        className
      )}
    >
      <div className="text-center">
        <Spinner size="xl" />
        {message && (
          <p className="mt-4 text-sm text-slate-400 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// LOADING BUTTON
// ============================================

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  loading,
  children,
  className,
  disabled,
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ============================================
// PULSE DOTS
// ============================================

export function PulseDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// SKELETON LIST
// ============================================

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export function SkeletonList({ items = 5, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} showAvatar lines={2} />
      ))}
    </div>
  );
}


