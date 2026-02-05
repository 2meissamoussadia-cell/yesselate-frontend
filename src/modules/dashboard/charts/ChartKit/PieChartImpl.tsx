/**
 * PieChartImpl - Implémentation du graphique en camembert avec ChartKit
 */

'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { chartStyles, chartColors } from './chartTheme';
import type { ChartData } from './types';

export interface PieChartImplProps {
  data: ChartData;
  dataKey: string;
  nameKey: string;
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
  colors?: string[];
}

export function PieChartImpl({
  data,
  dataKey,
  nameKey,
  title,
  description,
  height = 300,
  showLegend = true,
  className,
  colors = [...chartColors.palette],
}: PieChartImplProps) {
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
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip {...chartStyles.tooltip} />
          {showLegend && <Legend {...chartStyles.legend} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
