/**
 * Composant Sparkline réutilisable pour visualiser les tendances.
 * Audit ERP BTP 2026 : tooltip au survol pour afficher la valeur à chaque point.
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface SparklineChartProps {
  data: number[];
  color?: 'emerald' | 'amber' | 'red' | 'rose' | 'blue' | 'purple' | 'orange' | 'cyan' | 'slate';
  height?: number;
  width?: number;
  className?: string;
  /** Libellé pour le tooltip (ex. "Risque délais") */
  label?: string;
  /** Unité affichée dans le tooltip (ex. "%", "j", "k XOF") */
  unit?: string;
  /** Afficher un tooltip au survol (valeur au point) */
  showTooltip?: boolean;
}

export const SparklineChart = memo(function SparklineChart({
  data,
  color = 'blue',
  height = 20,
  width = 60,
  className,
  label,
  unit = '',
  showTooltip = true,
}: SparklineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return { x, y, value };
    });

    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');
    const lastValue = data[data.length - 1];

    return { points, pointsStr, maxValue, minValue, range, lastValue };
  }, [data, height, width]);

  const getSegmentWidth = useCallback(() => {
    if (!chartData || chartData.points.length <= 1) return width;
    return width / (chartData.points.length - 1);
  }, [chartData, width]);

  if (!chartData) return null;

  const { points, pointsStr, minValue, range, lastValue } = chartData;
  const segmentWidth = getSegmentWidth();

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

  const chart = (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      aria-hidden="true"
      role="img"
      aria-label={label ?? 'Graphique sparkline'}
    >
      <defs>
        <linearGradient id={`gradient-${color}-${width}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline
        points={pointsStr}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(colorClasses[color], 'transition-opacity duration-200')}
      />
      <polygon
        points={`0,${height} ${pointsStr} ${width},${height}`}
        fill={`url(#gradient-${color}-${width})`}
        className="opacity-50"
      />
      {showTooltip &&
        points.map((p, i) => (
          <rect
            key={i}
            x={i === 0 ? 0 : p.x - segmentWidth / 2}
            y={0}
            width={i === 0 ? segmentWidth / 2 : i === points.length - 1 ? width - p.x + segmentWidth / 2 : segmentWidth}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-default"
          />
        ))}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <circle
          cx={points[hoveredIndex].x}
          cy={points[hoveredIndex].y}
          r="3"
          className={cn('fill-current', colorClasses[color].split(' ')[0])}
        />
      )}
      {hoveredIndex === null && (
        <circle
          cx={width}
          cy={height - ((lastValue - minValue) / range) * height}
          r="2"
          className={cn('fill-current', colorClasses[color].split(' ')[0])}
        />
      )}
    </svg>
  );

  const tooltipText =
    hoveredIndex !== null && points[hoveredIndex]
      ? label
        ? `${label} : ${points[hoveredIndex].value}${unit}`
        : `${points[hoveredIndex].value}${unit}`
      : null;
  const tooltipLeft = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex].x : 0;

  return (
    <div className={cn('relative inline-block', className)}>
      {chart}
      {showTooltip && tooltipText && (
        <div
          className="pointer-events-none absolute bottom-full mb-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200 whitespace-nowrap z-10 shadow-lg"
          style={{ left: tooltipLeft, transform: 'translate(-50%, 0)' }}
          role="tooltip"
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
});

