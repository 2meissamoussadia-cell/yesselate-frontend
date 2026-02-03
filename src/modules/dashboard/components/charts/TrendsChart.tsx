/**
 * Graphique de tendances - Standardisé avec ChartKit
 * Utilise ChartContainer, chartStyles et chartColors du ChartKit
 */

'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { ChartContainer, chartStyles, chartColors } from '@/modules/dashboard/charts/ChartKit';
import type { TrendData } from '../DashboardCharts';
import { useI18n } from '@/lib/i18n';

export function TrendsChart({ trends }: { trends?: TrendData[] }) {
  const { fmt } = useI18n();
  
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];

    return trends.map(t => {
      const date = new Date(t.date);
      return {
        date: fmt.date(date, { day: 'numeric', month: 'numeric' }),
        demandes: t.demandes,
        validations: Math.round(t.validations * 100),
      };
    });
  }, [trends, fmt]);

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
    <ChartContainer title="Évolution (30 derniers jours)" exportFilename="evolution-30j">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid {...chartStyles.grid} />
          <XAxis dataKey="date" {...chartStyles.axis} />
          <YAxis yAxisId="left" {...chartStyles.axis} />
          <YAxis
            yAxisId="right"
            orientation="right"
            {...chartStyles.axis}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            {...chartStyles.tooltip}
            formatter={(value: number) => fmt.number(value)}
            labelFormatter={(label) => label}
          />
          <Legend {...chartStyles.legend} />
          {chartData.length > 12 && (
            <Brush
              dataKey="date"
              height={24}
              stroke={chartColors.primary.main}
              fill="rgba(59, 130, 246, 0.08)"
              tickFormatter={() => ''}
            />
          )}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="demandes"
            stroke={chartColors.primary.main}
            strokeWidth={2}
            fill={chartColors.primary.main}
            fillOpacity={0.1}
            name="Demandes"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="validations"
            stroke={chartColors.secondary.main}
            strokeWidth={2}
            fill={chartColors.secondary.main}
            fillOpacity={0.1}
            name="Validations (%)"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
