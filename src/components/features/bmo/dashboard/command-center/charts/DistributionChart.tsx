/**
 * Graphique de distribution pour les statistiques
 * Affiche des graphiques en barres, camembert, etc.
 */

'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
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

export type DistributionType = 'pie' | 'bar' | 'horizontal-bar';

interface DistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  type?: DistributionType;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className="bg-slate-900/95 border border-slate-700/50 rounded-lg p-3 shadow-xl backdrop-blur-xl">
        <p className="text-sm font-medium text-slate-200 mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-sm text-slate-300">
            Valeur: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-xs text-slate-400">
            Pourcentage: <span className="font-semibold">{percentage}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function DistributionChart({
  data,
  type = 'bar',
  height = 300,
  showLegend = true,
  showTooltip = true,
  className,
}: DistributionChartProps) {
  const colors = data.map((item, index) => item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]);

  const renderChart = () => {
    const commonProps = {
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (type) {
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'bar':
        return (
          <BarChart data={data} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'horizontal-bar':
        return (
          <BarChart
            layout="vertical"
            data={data}
            {...commonProps}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        );

      default:
        return null;
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


