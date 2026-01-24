'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTrendIcon, getTrendColor } from './getTrendIcon';
import { SparklineChart } from './SparklineChart';

export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  trend?: number;
  trendType?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  description?: string;
  onClick?: () => void;
  sparkline?: number[];
}

interface KPICardProps {
  kpi: KPICardData;
  size?: 'sm' | 'md' | 'lg';
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

const sizeTokens = {
  sm: { root: 'p-3', label: 'text-[11px]', value: 'text-lg', icon: 'h-4 w-4' },
  md: { root: 'p-4', label: 'text-xs', value: 'text-xl', icon: 'h-5 w-5' },
  lg: { root: 'p-5', label: 'text-sm', value: 'text-2xl', icon: 'h-5 w-5' },
} as const;

export const KPICard = memo(function KPICard({ kpi, size = 'md', className }: KPICardProps) {
  const Icon = kpi.icon;
  const tokens = sizeTokens[size];
  const color = kpi.color ?? 'blue';
  const accent = accentByColor[color];

  const TrendIcon = useMemo(() => getTrendIcon(kpi.trendType, kpi.trend), [kpi.trendType, kpi.trend]);
  const trendColor = useMemo(() => getTrendColor(kpi.trendType, kpi.trend), [kpi.trendType, kpi.trend]);

  const clickable = Boolean(kpi.onClick);

  const Card = (
    <button
      type="button"
      onClick={kpi.onClick}
      className={cn(
        // surface
        'relative w-full text-left rounded-2xl border bg-slate-950/35 backdrop-blur',
        'border-slate-800/70 hover:border-slate-700/80',
        'shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]',
        'transition-colors',
        clickable ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60' : 'cursor-default',
        tokens.root,
        className
      )}
      aria-label={kpi.description ? `${kpi.label} — ${kpi.description}` : kpi.label}
      disabled={!clickable}
    >
      {/* Accent bar */}
      <span className={cn('absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-90', accent)} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('text-slate-300/90 font-medium tracking-wide truncate', tokens.label)}>
            {kpi.label}
          </div>
          <div className={cn('mt-1 font-semibold text-slate-50 leading-none', tokens.value)}>
            {kpi.value}
          </div>

          <div className="mt-2 flex items-center gap-2">
            {TrendIcon ? <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} /> : null}
            {typeof kpi.trend === 'number' ? (
              <span className={cn('text-xs font-medium tabular-nums', trendColor)}>
                {kpi.trend > 0 ? `+${kpi.trend}%` : `${kpi.trend}%`}
              </span>
            ) : (
              <span className="text-xs text-slate-500">—</span>
            )}
            {kpi.description ? (
              <span className="text-xs text-slate-500 truncate">• {kpi.description}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={cn('inline-flex items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/40 p-2')}>
            <Icon className={cn(tokens.icon, 'text-slate-200')} />
          </div>

          {kpi.sparkline?.length ? (
            <div className="w-[92px] opacity-90">
              <SparklineChart data={kpi.sparkline} />
            </div>
          ) : null}
        </div>
      </div>
    </button>
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
