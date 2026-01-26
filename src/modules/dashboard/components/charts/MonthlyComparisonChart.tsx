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
} from 'recharts';
import { ChartContainer, chartStyles, chartColors, chartUI } from '@/modules/dashboard/charts/ChartKit';
import type { MonthlyComparisonData } from '../DashboardCharts';
import { useI18n } from '@/src/lib/i18n';

export function MonthlyComparisonChart({ data }: { data?: MonthlyComparisonData[] }) {
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
    <ChartContainer title="Comparaison mensuelle">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid {...chartStyles.grid} />
          <XAxis dataKey="month" {...chartStyles.axis} />
          <YAxis {...chartStyles.axis} />
          <Tooltip 
            {...chartStyles.tooltip}
            formatter={(value: number) => fmt.number(value)}
          />
          <Legend {...chartStyles.legend} />
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
