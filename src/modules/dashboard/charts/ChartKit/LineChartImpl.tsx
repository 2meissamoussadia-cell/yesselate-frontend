/**
 * LineChartImpl - Implémentation du graphique en ligne avec ChartKit
 * 
 * Version simplifiée cohérente avec TendancesPage
 */

'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { chartStyles, chartColors, chartUI } from './chartTheme';
import type { ChartData } from './types';
import { useI18n } from '@/lib/i18n';

// ============================================
// TYPES
// ============================================

export interface LineChartImplProps {
  /**
   * Données du graphique
   * Format attendu : [{ date: string, demandes: number, validations: number, budget: number }]
   */
  data: ChartData;

  /**
   * Titre du graphique (optionnel)
   */
  title?: string;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ============================================
// COMPOSANT
// ============================================

export default function LineChartImpl({ data, title, className }: LineChartImplProps) {
  const { t, fmt } = useI18n();
  
  if (!data?.length) {
    return (
      <ChartContainer title={title} className={className}>
        <div className="text-slate-400 flex items-center justify-center h-full">
          {t('empty.noData')}
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} className={className}>
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <RechartsLineChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartUI.grid.stroke}
            opacity={0.3}
          />
          <XAxis 
            dataKey="date" 
            tickFormatter={(v) => fmt.date(v, { month: 'short', day: '2-digit' })}
            {...chartStyles.axis}
          />
          <YAxis 
            tickFormatter={(v: number | undefined) => fmt.number(v ?? 0)}
            {...chartStyles.axis}
          />
          <Tooltip 
            {...chartStyles.tooltip}
            formatter={(value: number | undefined) => fmt.number(value ?? 0)}
            labelFormatter={(label) => {
              if (typeof label === 'string') {
                const date = new Date(label);
                return fmt.date(date);
              }
              return String(label);
            }}
          />
          <Legend {...chartStyles.legend} />
          <Line 
            type="monotone" 
            dataKey="demandes" 
            stroke={chartColors.primary.main}
            dot={false}
            name="Demandes"
          />
          <Line 
            type="monotone" 
            dataKey="validations" 
            stroke={chartColors.secondary.main}
            dot={false}
            name="Validations"
          />
          <Line 
            type="monotone" 
            dataKey="budget" 
            stroke={chartColors.success.main}
            dot={false}
            name="Budget"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Export nommé pour compatibilité
export { LineChartImpl };
