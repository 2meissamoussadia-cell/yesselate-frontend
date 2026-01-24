/**
 * Composant SectionTitle - Titre de section harmonisé
 * Utilisé pour tous les titres de sections du dashboard
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionTitleProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    title: 'text-base font-semibold',
    subtitle: 'text-xs',
    icon: 'w-4 h-4',
    gap: 'gap-1.5',
  },
  md: {
    title: 'text-xl font-bold',
    subtitle: 'text-sm',
    icon: 'w-5 h-5',
    gap: 'gap-2',
  },
  lg: {
    title: 'text-2xl font-bold',
    subtitle: 'text-base',
    icon: 'w-6 h-6',
    gap: 'gap-3',
  },
};

/**
 * Composant SectionTitle harmonisé
 */
export const SectionTitle = memo(function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  size = 'md',
  className,
}: SectionTitleProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon className={cn(sizes.icon, 'text-slate-300 flex-shrink-0')} />
        )}
        <div>
          <h2 className={cn('text-slate-200', sizes.title)}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn('text-slate-400 mt-0.5', sizes.subtitle)}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actionLabel && onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="text-slate-400 hover:text-slate-200"
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
});

SectionTitle.displayName = 'SectionTitle';
