/**
 * Badge Variants Component
 * Variantes de badges améliorées
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  onRemove?: () => void;
  className?: string;
  dot?: boolean;
}

const variantStyles = {
  default: 'bg-slate-700 text-slate-200 border-slate-600',
  primary: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  outline: 'bg-transparent text-slate-300 border-slate-600',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  onRemove,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'default' && 'bg-slate-400',
            variant === 'primary' && 'bg-blue-400',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'error' && 'bg-red-400',
            variant === 'info' && 'bg-cyan-400',
            variant === 'outline' && 'bg-slate-400',
          )}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 rounded-full p-0.5 hover:bg-black/20 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

/**
 * BadgeGroup - Groupe de badges
 */
interface BadgeGroupProps {
  badges: Array<{
    id: string;
    label: string;
    variant?: BadgeVariant;
    icon?: ReactNode;
    onRemove?: () => void;
  }>;
  maxVisible?: number;
  className?: string;
}

export function BadgeGroup({
  badges,
  maxVisible,
  className,
}: BadgeGroupProps) {
  const visibleBadges = maxVisible ? badges.slice(0, maxVisible) : badges;
  const hiddenCount = maxVisible ? badges.length - maxVisible : 0;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleBadges.map(badge => (
        <Badge
          key={badge.id}
          variant={badge.variant}
          icon={badge.icon}
          onRemove={badge.onRemove}
        >
          {badge.label}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge variant="outline">
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
}

