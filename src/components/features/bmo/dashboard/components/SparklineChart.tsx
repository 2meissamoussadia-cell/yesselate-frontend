'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';

export type SparklineColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';

const strokeByColor: Record<SparklineColor, string> = {
  blue: '#60a5fa', // blue-400
  emerald: '#34d399', // emerald-400
  amber: '#fbbf24', // amber-400
  purple: '#a78bfa', // purple-400
  rose: '#fb7185', // rose-400
  cyan: '#22d3ee', // cyan-400
};

export interface SparklineChartProps {
  data: number[];
  color?: SparklineColor;
  width?: number;
  height?: number;
  className?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function SparklineChart({
  data,
  color = 'blue',
  width = 90,
  height = 22,
  className,
}: SparklineChartProps) {
  const { points, areaD, gradientId } = useMemo(() => {
    const safe = Array.isArray(data) ? data.filter((v) => Number.isFinite(v)) : [];
    if (safe.length < 2) return { points: '', areaD: '', gradientId: '' };

    const pad = 1.5;
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const span = max - min || 1;

    const w = Math.max(8, width);
    const h = Math.max(8, height);
    const xStep = (w - pad * 2) / (safe.length - 1);

    const pts: Array<[number, number]> = safe.map((v, i) => {
      const x = pad + i * xStep;
      const t = (v - min) / span;
      const y = h - pad - t * (h - pad * 2);
      return [clamp(x, 0, w), clamp(y, 0, h)];
    });

    const pointsStr = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const areaPath =
      `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} ` +
      pts.slice(1).map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') +
      ` L ${pts[pts.length - 1][0].toFixed(2)} ${(h - pad).toFixed(2)}` +
      ` L ${pts[0][0].toFixed(2)} ${(h - pad).toFixed(2)} Z`;

    // stable-ish id per shape (good enough for this UI)
    const id = `spark-${safe.length}-${Math.round(min * 100)}-${Math.round(max * 100)}-${w}-${h}`;

    return { points: pointsStr, areaD: areaPath, gradientId: id };
  }, [data, width, height]);

  if (!points) return null;

  const stroke = strokeByColor[color] ?? strokeByColor.blue;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('block', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaD} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

