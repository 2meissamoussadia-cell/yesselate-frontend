/**
 * Graphique de comparaison mensuelle - Standardisé avec ChartKit
 * Utilise ChartContainer, chartStyles et chartColors du ChartKit
 */

'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { ChartContainer, chartStyles, chartColors, chartUI } from '@/modules/dashboard/charts/ChartKit';
import type { MonthlyComparisonData } from '../DashboardCharts';
import { useI18n } from '@/lib/i18n';

export function MonthlyComparisonChart({ data }: { data?: MonthlyComparisonData[] }) {
  const { fmt } = useI18n();
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
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
    <ChartContainer title="Comparaison mensuelle" exportFilename="comparaison-mensuelle">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid {...chartStyles.grid} />
          <XAxis dataKey="month" {...chartStyles.axis} />
          <YAxis {...chartStyles.axis} />
          <Tooltip 
            {...chartStyles.tooltip}
            formatter={(value: number | undefined) => fmt.number(value ?? 0)}
          />
          <Legend {...chartStyles.legend} />
          {chartData.length > 8 && (
            <Brush
              dataKey="month"
              height={24}
              stroke={chartColors.primary.main}
              fill="rgba(59, 130, 246, 0.08)"
              tickFormatter={() => ''}
            />
          )}
          <Bar
            dataKey="actuel"
            fill={chartColors.primary.main}
            name="Mois actuel"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="precedent"
            fill={chartUI.axis.tick}
            name="Mois précédent"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
