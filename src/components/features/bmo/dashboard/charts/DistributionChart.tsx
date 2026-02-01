/**
 * Graphique de distribution (PieChart / BarChart)
 * Utilisé pour répartitions par bureau, type, etc.
 */

'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface DistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  type?: 'pie' | 'bar';
  height?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

export function DistributionChart({
  data,
  type = 'pie',
  height = 300,
  showLegend = true,
}: DistributionChartProps) {
  if (type === 'pie') {
    return (
      <div className="w-full" style={{ height, minHeight: 120 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#cbd5e1', fontSize: 12 }}
              itemStyle={{ color: '#e2e8f0', fontSize: 11 }}
            />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
                iconType="circle"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Bar Chart
  return (
    <div className="w-full" style={{ height, minHeight: 120 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={120}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#475569' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#cbd5e1', fontSize: 12 }}
            itemStyle={{ color: '#e2e8f0', fontSize: 11 }}
            cursor={{ fill: '#334155', opacity: 0.3 }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
              iconType="circle"
            />
          )}
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

