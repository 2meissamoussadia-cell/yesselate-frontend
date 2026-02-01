/**
 * BarChartImpl - Implémentation du graphique en barres avec ChartKit
 */

'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { chartStyles, chartColors, chartMargins } from './chartTheme';
import type { ChartData, ChartSeries } from './types';

export interface BarChartImplProps {
  data: ChartData;
  xAxisKey: string;
  series: ChartSeries[];
  title?: string;
  description?: string;
  height?: number;
  margin?: typeof chartMargins.default;
  showLegend?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  className?: string;
}

export function BarChartImpl({
  data,
  xAxisKey,
  series,
  title,
  description,
  height = 300,
  margin = chartMargins.default,
  showLegend = true,
  xAxisFormatter,
  yAxisFormatter,
  className,
}: BarChartImplProps) {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title={title} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-400">Aucune donnée disponible</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} className={className}>
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <RechartsBarChart data={data} margin={margin}>
          <CartesianGrid {...chartStyles.grid} />
          <XAxis
            {...chartStyles.axis}
            dataKey={xAxisKey}
            tickFormatter={xAxisFormatter}
          />
          <YAxis
            {...chartStyles.axis}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip {...chartStyles.tooltip} />
          {showLegend && <Legend {...chartStyles.legend} />}
          
          {series.map((serie, index) => {
            const color = serie.color || chartColors.palette[index % chartColors.palette.length];
            
            return (
              <Bar
                key={serie.dataKey}
                dataKey={serie.dataKey}
                name={serie.name || serie.dataKey}
                fill={color}
                fillOpacity={serie.opacity ?? 0.8}
              />
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
