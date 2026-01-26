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

// Helper pour générer des styles adaptatifs
const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  const base = {
    sm: {
      title: { fontSize: 'clamp(0.875rem, 1vw, 1rem)' },
      subtitle: { fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' },
      icon: { width: 'clamp(1rem, 1.25vw, 1.125rem)', height: 'clamp(1rem, 1.25vw, 1.125rem)', minWidth: '1rem', minHeight: '1rem', maxWidth: '1.125rem', maxHeight: '1.125rem' },
    },
    md: {
      title: { fontSize: 'clamp(0.875rem, 1.25vw, 1rem)' },
      subtitle: { fontSize: 'clamp(0.75rem, 0.875vw, 0.8125rem)' },
      icon: { width: 'clamp(1rem, 1.25vw, 1.125rem)', height: 'clamp(1rem, 1.25vw, 1.125rem)', minWidth: '1rem', minHeight: '1rem', maxWidth: '1.125rem', maxHeight: '1.125rem' },
    },
    lg: {
      title: { fontSize: 'clamp(1rem, 1.75vw, 1.25rem)' },
      subtitle: { fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' },
      icon: { width: 'clamp(1.125rem, 1.5vw, 1.25rem)', height: 'clamp(1.125rem, 1.5vw, 1.25rem)', minWidth: '1.125rem', minHeight: '1.125rem', maxWidth: '1.25rem', maxHeight: '1.25rem' },
    },
  };
  return base[size];
};

const sizeClasses = {
  sm: {
    title: 'font-semibold',
    subtitle: '',
    icon: '',
    gap: 'gap-1.5',
  },
  md: {
    title: 'font-bold',
    subtitle: '',
    icon: '',
    gap: 'gap-2',
  },
  lg: {
    title: 'font-bold',
    subtitle: '',
    icon: '',
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
  const sizeStyles = getSizeStyles(size);

  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="inline-flex items-center justify-center rounded-lg border border-slate-800/60 bg-slate-900/40 p-1.5 overflow-hidden relative [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:h-full">
            <span 
              style={sizeStyles.icon} 
              className="inline-flex items-center justify-center flex-shrink-0 relative z-10 overflow-hidden"
            >
              <Icon 
                className={cn('text-slate-300 flex-shrink-0', sizes.icon)} 
                style={{ 
                  width: sizeStyles.icon.width,
                  height: sizeStyles.icon.height,
                  maxWidth: sizeStyles.icon.maxWidth,
                  maxHeight: sizeStyles.icon.maxHeight,
                  minWidth: sizeStyles.icon.minWidth,
                  minHeight: sizeStyles.icon.minHeight,
                }} 
              />
            </span>
          </div>
        )}
        <div>
          <h2 className={cn('text-slate-50', sizes.title)} style={sizeStyles.title}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn('text-slate-400 mt-0.5', sizes.subtitle)} style={sizeStyles.subtitle}>
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
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 rounded-lg"
          style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
        >
          {actionLabel}
          <ChevronRight className="ml-1" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
        </Button>
      )}
    </div>
  );
});

SectionTitle.displayName = 'SectionTitle';
