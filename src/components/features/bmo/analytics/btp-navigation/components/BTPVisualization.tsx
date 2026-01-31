/**
 * Composant de Visualisation BTP
 * Affiche les graphiques selon la configuration de visualisation
 */

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import type { VisualizationDefinition } from '@/lib/config/analyticsDisplayLogic';
import { cn } from '@/lib/utils';
import { transformTrendDataForChart, transformDataForDonut, transformDataForBar } from '@/lib/utils/dataTransformers';

interface BTPVisualizationProps {
  visualization: VisualizationDefinition;
  data?: any[];
  className?: string;
  height?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function BTPVisualization({
  visualization,
  data = [],
  className,
  height = 300,
}: BTPVisualizationProps) {
  // Transformer les données selon le type de graphique
  const transformedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    switch (visualization.type) {
      case 'line':
      case 'area':
        return transformTrendDataForChart(data, visualization.config.yAxis, visualization.config.xAxis);
      case 'pie':
      case 'donut':
        return transformDataForDonut(data, visualization.config.valueKey || 'value', visualization.config.labelKey || 'label');
      case 'bar':
        return transformDataForBar(data, visualization.config.xAxis || 'name', visualization.config.yAxis || 'value');
      default:
        return data;
    }
  }, [data, visualization]);

  const renderChart = () => {
    const commonProps = {
      data: transformedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (visualization.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={visualization.config.xAxis} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={visualization.config.yAxis}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
            {visualization.config.comparison && (
              <Line
                type="monotone"
                dataKey={`${visualization.config.yAxis}_prev`}
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#64748b', r: 4 }}
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={visualization.config.xAxis || 'name'} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey={visualization.config.yAxis || 'value'} fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={visualization.type === 'donut' ? 40 : 0}
              fill="#8884d8"
              dataKey={visualization.config.valueKey || 'value'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={visualization.config.xAxis} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={visualization.config.yAxis}
              stroke="#3b82f6"
              fill="url(#colorValue)"
            />
          </AreaChart>
        );

      case 'radar':
        return (
          <RadarChart data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey={visualization.config.labelKey || 'name'} stroke="#9ca3af" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
            <Radar
              name="Performance"
              dataKey={visualization.config.valueKey || 'value'}
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </RadarChart>
        );

      case 'scatter':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={visualization.config.xAxis} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={visualization.config.yAxis}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 6 }}
            />
          </LineChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-sm">
              Type de graphique "{visualization.type}" non supporté
            </p>
          </div>
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

