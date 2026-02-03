'use client';

import React, { memo, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTrendIcon, getTrendColor } from './getTrendIcon';

export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  trend?: number;
  trendType?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  description?: string;
  onClick?: () => void;
  sparkline?: number[];
}

export interface KPICardProps {
  kpi: KPICardData;
  /** Spec audit : XL = KPIs critiques (CA, Trésorerie), L = importants, M = secondaires, S = détails */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const accentByColor: Record<NonNullable<KPICardData['color']>, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
};

/** Affiche "—" pour valeurs invalides (audit KPI NaN/undefined/null). Exporté pour tests P4. */
export function sanitizeKpiValue(value: string | number): string | number {
  if (value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value)) || value === '') return '—';
  return value;
}

const sizeTokens = {
  sm: { root: 'p-3', label: 'text-[11px]', value: 'text-lg', icon: 'h-3 w-3' },
  md: { root: 'p-4', label: 'text-xs', value: 'text-xl', icon: 'h-3.5 w-3.5' },
  lg: { root: 'p-5', label: 'text-sm', value: 'text-2xl', icon: 'h-3.5 w-3.5' },
  xl: { root: 'p-5 sm:p-6', label: 'text-xs sm:text-sm', value: 'text-2xl sm:text-3xl', icon: 'h-4 w-4' },
} as const;

export const KPICard = memo(function KPICard({ kpi, size = 'md', className }: KPICardProps) {
  const Icon = kpi.icon ?? BarChart2;
  const tokens = sizeTokens[size];
  const color = kpi.color ?? 'blue';
  const accent = accentByColor[color];

  const TrendIcon = useMemo(() => getTrendIcon(kpi.trendType, kpi.trend), [kpi.trendType, kpi.trend]);
  const trendColor = useMemo(() => getTrendColor(kpi.trendType, kpi.trend), [kpi.trendType, kpi.trend]);

  const clickable = Boolean(kpi.onClick);
  const ariaLabel = kpi.description ? `${kpi.label} — ${kpi.description}` : kpi.label;
  const surfaceClass = cn(
    'relative w-full text-left rounded-2xl border backdrop-blur transition-colors overflow-hidden',
    'bg-white dark:bg-slate-950/35 border-slate-200 dark:border-slate-800/70',
    'shadow-sm dark:shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]',
    clickable
      ? 'hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 active:scale-[0.99]'
      : 'cursor-default',
    tokens.root,
    className
  );

  const CardContent = (
    <>
      {/* Accent bar (décoratif) */}
      <span className={cn('absolute left-0 top-0 bottom-0 w-[3px] opacity-80', accent)} aria-hidden />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="min-w-0 flex-1">
          <div className={cn('text-slate-600 dark:text-slate-300/90 font-medium tracking-wide line-clamp-2 leading-tight', tokens.label)}>
            {kpi.label}
          </div>
          <div className={cn('mt-1 font-semibold text-slate-900 dark:text-slate-50 leading-none', tokens.value)}>
            {sanitizeKpiValue(kpi.value)}
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {TrendIcon ? <TrendIcon className={cn('h-3.5 w-3.5 flex-shrink-0', trendColor)} /> : null}
            {typeof kpi.trend === 'number' ? (
              <span className={cn('text-xs font-medium tabular-nums whitespace-nowrap', trendColor)}>
                {kpi.trend > 0 ? `+${kpi.trend}%` : `${kpi.trend}%`}
              </span>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
            {kpi.description ? (
              <span className="text-xs text-slate-500 dark:text-slate-300 truncate">• {kpi.description}</span>
            ) : null}
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className={cn('inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800/60 dark:bg-slate-900/40 p-2')}>
            <Icon className={cn(tokens.icon, 'text-slate-600 dark:text-slate-200')} style={{ width: '0.875rem', height: '0.875rem', minWidth: '0.875rem', minHeight: '0.875rem', maxWidth: '0.875rem', maxHeight: '0.875rem' }} />
          </div>
        </div>
      </div>
    </>
  );

  const Card = clickable ? (
    <button type="button" onClick={kpi.onClick} className={surfaceClass} aria-label={ariaLabel}>
      {CardContent}
    </button>
  ) : (
    <div role="group" className={surfaceClass} aria-label={ariaLabel}>
      {CardContent}
    </div>
  );

  if (!kpi.description) return Card;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{Card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs">
            <div className="font-semibold text-slate-100">{kpi.label}</div>
            <div className="mt-1 text-slate-300">{kpi.description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
