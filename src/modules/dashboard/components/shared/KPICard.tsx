/**
 * Composant KPI Card réutilisable et optimisé
 * Avec memo pour éviter les re-renders inutiles
 */

'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparklineChart } from './SparklineChart';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'orange' | 'cyan';
  sparkline?: number[];
  description?: string;
  onClick?: () => void;
  isPositive?: boolean;
  isNegative?: boolean;
}

const colorClasses = {
  blue: {
    card: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/50 hover:border-blue-400',
    icon: 'bg-blue-500/20 text-blue-400',
  },
  emerald: {
    card: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 hover:border-emerald-400',
    icon: 'bg-emerald-500/20 text-emerald-400',
  },
  amber: {
    card: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/50 hover:border-amber-400',
    icon: 'bg-amber-500/20 text-amber-400',
  },
  red: {
    card: 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/50 hover:border-red-400',
    icon: 'bg-red-500/20 text-red-400',
  },
  purple: {
    card: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/50 hover:border-purple-400',
    icon: 'bg-purple-500/20 text-purple-400',
  },
  orange: {
    card: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/50 hover:border-orange-400',
    icon: 'bg-orange-500/20 text-orange-400',
  },
  cyan: {
    card: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/50 hover:border-cyan-400',
    icon: 'bg-cyan-500/20 text-cyan-400',
  },
};

export const KPICard = memo(function KPICard({
  id,
  label,
  value,
  trend,
  trendDirection,
  icon: Icon,
  color,
  sparkline,
  description,
  onClick,
  isPositive,
  isNegative,
}: KPICardProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  const colors = colorClasses[color];
  const hasPositiveTrend = isPositive ?? false;
  const hasNegativeTrend = isNegative ?? false;

  // Mémoriser className pour éviter les re-renders
  // ✅ Utilise container queries pour adaptation basée sur la taille du conteneur
  const cardClassName = useMemo(() => cn(
    '@container rounded-xl p-4 sm:p-5 @container/sm:p-5 @container/md:p-6 border-2 transition-all duration-300 min-w-0 overflow-hidden',
    onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    colors.card
  ), [onClick, colors.card]);

  // Mémoriser aria-label pour éviter les re-renders
  const ariaLabel = useMemo(() => 
    onClick ? `${label}: ${value}. Cliquez pour voir les détails` : `${label}: ${value}`,
    [label, value, onClick]
  );

  // Mémoriser le contenu du tooltip
  const tooltipContent = useMemo(() => {
    if (!description) return null;
    return (
      <div className="space-y-1">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-slate-300">{description}</p>
        {onClick && (
          <p className="text-xs text-slate-300 pt-1 border-t border-slate-700">
            Cliquez pour voir les détails et l'historique
          </p>
        )}
      </div>
    );
  }, [description, label, onClick]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={cardClassName}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 min-w-0">
            <div className={cn('w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0', colors.icon)}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <p className="text-xs sm:text-sm text-slate-300 truncate min-w-0">{label}</p>
                {onClick && <Info className="h-3 w-3 text-slate-400 flex-shrink-0" aria-hidden="true" />}
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white truncate min-w-0">{value}</p>
            </div>
          </div>

          {sparkline && (
            <div className="mb-2" aria-hidden="true">
              <SparklineChart
                data={sparkline}
                color={color}
                width={60}
                height={20}
              />
            </div>
          )}

          <div
            className={cn(
              'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs min-w-0',
              hasPositiveTrend && 'text-emerald-400',
              hasNegativeTrend && 'text-red-400',
              !hasPositiveTrend && !hasNegativeTrend && 'text-slate-300'
            )}
          >
            <div className="flex items-center gap-1 font-medium min-w-0">
              {trendDirection !== 'neutral' && (
                <>
                  {hasPositiveTrend ? (
                    <TrendingUp className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate min-w-0">{trend}</span>
                </>
              )}
              {trendDirection === 'neutral' && <span className="truncate min-w-0">{trend}</span>}
            </div>
            {onClick && (
              <span className="text-slate-400 text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0" aria-hidden="true">
                Cliquer pour détails
              </span>
            )}
          </div>
        </div>
      </TooltipTrigger>
      {tooltipContent && (
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      )}
    </Tooltip>
  );
});

