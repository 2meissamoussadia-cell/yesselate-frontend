'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';

interface TrendChartProps {
  data: Array<{ period: string; value: number; previous?: number }>;
  color: string;
  height?: number;
  showComparison?: boolean;
  type?: 'area' | 'line';
  className?: string;
}

export function TrendChart({
  data,
  color,
  height = 120,
  showComparison = false,
  type = 'area',
  className,
}: TrendChartProps) {
  const { darkMode } = useAppStore();

  const chartData = useMemo(() => {
    return data.map((d, idx) => ({
      name: d.period,
      value: d.value,
      previous: d.previous,
      index: idx,
    }));
  }, [data]);

  const ChartComponent = type === 'area' ? AreaChart : LineChart;

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }}
            stroke={darkMode ? '#475569' : '#cbd5e1'}
          />
          <YAxis
            tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }}
            stroke={darkMode ? '#475569' : '#cbd5e1'}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: darkMode ? '#cbd5e8' : '#1e293b' }}
          />
          {type === 'area' ? (
            <>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#gradient-${color.replace('#', '')})`}
                strokeWidth={2}
              />
              {showComparison && (
                <Area
                  type="monotone"
                  dataKey="previous"
                  stroke={darkMode ? '#64748b' : '#94a3b8'}
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  opacity={0.6}
                />
              )}
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
              />
              {showComparison && (
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke={darkMode ? '#64748b' : '#94a3b8'}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={{ r: 2 }}
                  opacity={0.6}
                />
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

