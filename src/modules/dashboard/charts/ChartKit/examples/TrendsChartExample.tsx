/**
 * Exemple de migration : TrendsChart avec ChartKit
 * 
 * Ce fichier montre comment migrer un chart existant vers ChartKit
 * Comparer avec : modules/dashboard/components/charts/TrendsChart.tsx
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
} from 'recharts';
import { ChartContainer, chartStyles, chartColors } from '../index';

// ============================================
// TYPES
// ============================================

export interface TrendData {
  date: string;
  demandes: number;
  validations: number;
  budget: number;
}

interface TrendsChartExampleProps {
  trends?: TrendData[];
  isLoading?: boolean;
  error?: string | Error | null;
}

// ============================================
// COMPOSANT
// ============================================

export function TrendsChartExample({ 
  trends, 
  isLoading = false,
  error = null,
}: TrendsChartExampleProps) {
  // ============================================
  // TRANSFORMATION DES DONNÉES
  // ============================================
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];

    return trends.map(t => {
      const date = new Date(t.date);
      return {
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        demandes: t.demandes,
        validations: Math.round(t.validations * 100),
      };
    });
  }, [trends]);

  // ============================================
  // RENDU
  // ============================================
  
  // Gestion des états (à faire manuellement avec la version simplifiée)
  if (isLoading) {
    return (
      <ChartContainer title="Évolution (30 derniers jours)">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-slate-400" />
            <p className="text-sm text-slate-400">Chargement des données...</p>
          </div>
        </div>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer title="Évolution (30 derniers jours)">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-red-300">Erreur de chargement</p>
            <p className="text-xs text-slate-400">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </ChartContainer>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <ChartContainer title="Évolution (30 derniers jours)">
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-400">Aucune donnée disponible</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Évolution (30 derniers jours)">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          {/* Grid standardisé */}
          <CartesianGrid {...chartStyles.grid} />

          {/* Axes standardisés */}
          <XAxis 
            {...chartStyles.axis} 
            dataKey="date" 
          />
          <YAxis 
            {...chartStyles.axis} 
            yAxisId="left" 
          />
          <YAxis
            {...chartStyles.axis}
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value}%`}
          />

          {/* Tooltip standardisé */}
          <Tooltip {...chartStyles.tooltip} />

          {/* Legend standardisée */}
          <Legend {...chartStyles.legend} />

          {/* Ligne 1 : Demandes (couleur primaire) */}
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

          {/* Ligne 2 : Validations (couleur secondaire) */}
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
