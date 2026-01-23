/**
 * Composant KPI Card réutilisable et optimisé
 * Avec memo pour éviter les re-renders inutiles
 */

'use client';

import React, { memo, useCallback } from 'react';
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            'rounded-xl p-5 border-2 transition-all duration-300',
            onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
            colors.card
          )}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={handleKeyDown}
          aria-label={onClick ? `${label}: ${value}. Cliquez pour voir les détails` : `${label}: ${value}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center transition-all', colors.icon)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400 truncate">{label}</p>
                {onClick && <Info className="h-3 w-3 text-slate-500 flex-shrink-0" aria-hidden="true" />}
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
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
              'flex items-center justify-between text-xs',
              hasPositiveTrend && 'text-emerald-400',
              hasNegativeTrend && 'text-red-400',
              !hasPositiveTrend && !hasNegativeTrend && 'text-slate-400'
            )}
          >
            <div className="flex items-center gap-1 font-medium">
              {trendDirection !== 'neutral' && (
                <>
                  {hasPositiveTrend ? (
                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>{trend}</span>
                </>
              )}
              {trendDirection === 'neutral' && <span>{trend}</span>}
            </div>
            {onClick && (
              <span className="text-slate-500 text-[10px]" aria-hidden="true">
                Cliquer pour détails
              </span>
            )}
          </div>
        </div>
      </TooltipTrigger>
      {description && (
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{label}</p>
            <p className="text-xs text-slate-300">{description}</p>
            {onClick && (
              <p className="text-xs text-slate-400 pt-1 border-t border-slate-700">
                Cliquez pour voir les détails et l'historique
              </p>
            )}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
});

