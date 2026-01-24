/**
 * Composant DataCard - Carte de données harmonisée
 * Utilisé pour afficher des données structurées dans les sections
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DataCardProps {
  title?: string;
  value: string | number | React.ReactNode;
  label?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'warning' | 'critical' | 'success';
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Composant DataCard harmonisé
 */
export const DataCard = memo(function DataCard({
  title,
  value,
  label,
  badge,
  badgeVariant = 'default',
  icon: Icon,
  onClick,
  className,
  children,
}: DataCardProps) {
  const badgeClasses = {
    default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div
      className={cn(
        // Surface premium (pas de hover:scale, pas de border-2)
        'rounded-2xl border border-slate-800/60 bg-slate-900/25',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm',
        'p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-slate-900/40 hover:border-slate-700/60',
        className
      )}
      onClick={onClick}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
          )}
          {Icon && (
            <Icon className="w-4 h-4 text-slate-400" />
          )}
        </div>
      )}

      <div className="flex items-baseline justify-between gap-2">
        <div className="flex-1 min-w-0">
          {typeof value === 'string' || typeof value === 'number' ? (
            <p className="text-2xl font-bold text-slate-200 mb-1">{value}</p>
          ) : (
            <div className="mb-1">{value}</div>
          )}
          {label && (
            <p className="text-xs text-slate-400">{label}</p>
          )}
        </div>
        
        {badge !== undefined && (
          <Badge
            variant="default"
            className={cn('text-xs flex-shrink-0', badgeClasses[badgeVariant])}
          >
            {badge}
          </Badge>
        )}
      </div>

      {children && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          {children}
        </div>
      )}
    </div>
  );
});

DataCard.displayName = 'DataCard';
