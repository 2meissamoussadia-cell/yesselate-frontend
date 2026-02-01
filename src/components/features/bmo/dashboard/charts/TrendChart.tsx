/**
 * Graphique de tendances avec Recharts
 * Utilisé dans PerformanceView et Analytics
 */

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: Array<{
    period: string;
    [key: string]: string | number;
  }>;
  dataKeys: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function TrendChart({
  data,
  dataKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
}: TrendChartProps) {
  return (
    <div className="w-full" style={{ height, minHeight: 120 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={120}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          )}
          <XAxis
            dataKey="period"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#475569', strokeWidth: 1 }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#475569', strokeWidth: 1 }}
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
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
              iconType="circle"
            />
          )}
          {dataKeys.map((dk) => (
            <Line
              key={dk.key}
              type="monotone"
              dataKey={dk.key}
              name={dk.label}
              stroke={dk.color}
              strokeWidth={2}
              dot={{ fill: dk.color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

