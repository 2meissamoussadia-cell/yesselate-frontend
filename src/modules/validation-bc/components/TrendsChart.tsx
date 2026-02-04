/**
 * Composant de graphique de tendances pour Validation-BC
 * Utilise Recharts pour visualiser les tendances de validation
 */

'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/cn';
import type { ValidationStats } from '../types/validationTypes';

interface TrendsChartProps {
  data: ValidationStats;
  type?: 'line' | 'area' | 'bar';
  height?: number;
  showLegend?: boolean;
  className?: string;
}

// Générer des données de tendances sur les 7 derniers jours
function generateTrendData(stats: ValidationStats) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  
  return days.map((day, index) => {
    const dayOffset = 6 - index;
    const baseValue = {
      jour: day,
      documents: stats.totalDocuments,
      valides: stats.valides,
      enAttente: stats.enAttente,
      rejetes: stats.rejetes,
    };
    
    // Ajouter de la variation pour simuler des tendances
    const variation = (dayOffset * 0.1) + (Math.random() * 0.2 - 0.1);
    return {
      ...baseValue,
      documents: Math.round(baseValue.documents * (1 + variation)),
      valides: Math.round(baseValue.valides * (1 + variation * 0.5)),
      enAttente: Math.round(baseValue.enAttente * (1 + variation)),
      rejetes: Math.round(baseValue.rejetes * (1 + variation * 0.3)),
    };
  }).reverse();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-200 font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function TrendsChart({
  data,
  type = 'line',
  height = 300,
  showLegend = true,
  className,
}: TrendsChartProps) {
  const chartData = useMemo(() => generateTrendData(data), [data]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="jour" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="valides"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Validés"
            />
            <Area
              type="monotone"
              dataKey="enAttente"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
              name="En Attente"
            />
            <Area
              type="monotone"
              dataKey="rejetes"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
              name="Rejetés"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="jour" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar dataKey="valides" fill="#10b981" radius={[4, 4, 0, 0]} name="Validés" />
            <Bar dataKey="enAttente" fill="#f59e0b" radius={[4, 4, 0, 0]} name="En Attente" />
            <Bar dataKey="rejetes" fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejetés" />
          </BarChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="jour" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="documents"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
              name="Total Documents"
            />
            <Line
              type="monotone"
              dataKey="valides"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 6 }}
              name="Validés"
            />
            <Line
              type="monotone"
              dataKey="enAttente"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f59e0b' }}
              activeDot={{ r: 6 }}
              name="En Attente"
            />
            <Line
              type="monotone"
              dataKey="rejetes"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4, fill: '#ef4444' }}
              activeDot={{ r: 6 }}
              name="Rejetés"
            />
          </LineChart>
        );
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
