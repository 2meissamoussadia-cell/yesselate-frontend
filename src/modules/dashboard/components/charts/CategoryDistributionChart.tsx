/**
 * Graphique de répartition par catégorie - Standardisé avec ChartKit
 * Utilise ChartContainer, chartStyles et chartColors du ChartKit
 */

'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, chartStyles, chartColors } from '@/modules/dashboard/charts/ChartKit';
import type { CategoryDistributionData } from '../DashboardCharts';
import { useI18n } from '@/lib/i18n';

export function CategoryDistributionChart({ data }: { data?: CategoryDistributionData[] }) {
  const { fmt } = useI18n();
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(d => ({
      name: d.category,
      value: d.count,
      percentage: d.percentage,
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <ChartContainer>
        <div className="h-full flex items-center justify-center text-slate-400">
          <p className="text-sm">Aucune donnée disponible</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Répartition par catégorie" exportFilename="repartition-categories">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors.palette[index % chartColors.palette.length]}
              />
            ))}
          </Pie>
          <Tooltip
            {...chartStyles.tooltip}
            formatter={(value: number | undefined, name: string | undefined, props: unknown) => [
              `${fmt.number(value ?? 0)} (${fmt.percent((props && typeof props === 'object' && 'payload' in props && props.payload && typeof props.payload === 'object' && 'percent' in props.payload ? Number((props.payload as { percent?: number }).percent) : 0))})`,
              name ?? '',
            ]}
          />
          <Legend
            {...chartStyles.legend}
            verticalAlign="middle"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
