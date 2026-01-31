'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonWidgetProps {
  current: number;
  previous: number;
  label: string;
  format?: (value: number) => string;
  className?: string;
}

export function ComparisonWidget({
  current,
  previous,
  label,
  format = (v) => v.toLocaleString('fr-FR'),
  className,
}: ComparisonWidgetProps) {
  const { darkMode } = useAppStore();

  const comparison = useMemo(() => {
    if (previous === 0) return { change: 0, percent: 0, isPositive: true };
    const change = current - previous;
    const percent = Math.abs((change / previous) * 100);
    return {
      change,
      percent: Number(percent.toFixed(1)),
      isPositive: change >= 0,
    };
  }, [current, previous]);

  const Icon = comparison.isPositive ? TrendingUp : comparison.change === 0 ? Minus : TrendingDown;
  const colorClass = comparison.isPositive
    ? 'text-emerald-400'
    : comparison.change === 0
    ? 'text-slate-400'
    : 'text-red-400';

  return (
    <div
      className={cn(
        'rounded-lg p-3 border',
        darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-gray-200',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn('text-[10px] uppercase tracking-wide', darkMode ? 'text-slate-400' : 'text-gray-500')}>
            {label}
          </p>
          <p className="text-lg font-bold mt-1">{format(current)}</p>
          {previous > 0 && (
            <p className={cn('text-[10px] mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
              Période précédente: {format(previous)}
            </p>
          )}
        </div>
        {previous > 0 && (
          <div className={cn('flex items-center gap-1', colorClass)}>
            <Icon className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {comparison.isPositive ? '+' : ''}
              {comparison.percent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

