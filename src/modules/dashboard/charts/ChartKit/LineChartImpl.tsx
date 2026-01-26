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
  if (!data?.length) {
    return (
      <ChartContainer title={title} className={className}>
        <div className="text-slate-400 flex items-center justify-center h-full">
          Aucune donnée
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartUI.grid.stroke}
            opacity={0.3}
          />
          <XAxis 
            dataKey="date" 
            stroke={chartUI.axis.stroke}
            {...chartStyles.axis}
          />
          <YAxis 
            stroke={chartUI.axis.stroke}
            {...chartStyles.axis}
          />
          <Tooltip {...chartStyles.tooltip} />
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
