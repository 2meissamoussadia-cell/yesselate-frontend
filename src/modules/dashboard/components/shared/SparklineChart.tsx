/**
 * Composant Sparkline réutilisable pour visualiser les tendances
 */

'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  color?: 'emerald' | 'amber' | 'red' | 'rose' | 'blue' | 'purple' | 'orange' | 'cyan' | 'slate';
  height?: number;
  width?: number;
  className?: string;
}

export const SparklineChart = memo(function SparklineChart({ 
  data, 
  color = 'blue', 
  height = 20, 
  width = 60,
  className 
}: SparklineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return { points, maxValue, minValue, range, lastValue: data[data.length - 1] };
  }, [data, height, width]);

  if (!chartData) return null;

  const { points, minValue, range, lastValue } = chartData;

  const colorClasses = {
    emerald: 'stroke-emerald-400 fill-emerald-400/20',
    amber: 'stroke-amber-400 fill-amber-400/20',
    red: 'stroke-red-400 fill-red-400/20',
    rose: 'stroke-rose-400 fill-rose-400/20',
    blue: 'stroke-blue-400 fill-blue-400/20',
    purple: 'stroke-purple-400 fill-purple-400/20',
    orange: 'stroke-orange-400 fill-orange-400/20',
    cyan: 'stroke-cyan-400 fill-cyan-400/20',
    slate: 'stroke-slate-300 fill-slate-300/20',
  };

  return (
    <div className={cn('inline-block', className)}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(colorClasses[color], 'transition-opacity duration-200')}
        />
        {/* Zone remplie sous la courbe */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#gradient-${color})`}
          className="opacity-50"
        />
        {/* Point final */}
        <circle
          cx={width}
          cy={height - ((lastValue - minValue) / range) * height}
          r="2"
          className={cn('fill-current', colorClasses[color].split(' ')[0])}
        />
      </svg>
    </div>
  );
});

