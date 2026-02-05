'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================
interface ValidationStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  anomalies: number;
  urgent: number;
  byService?: { service: string; pending: number; total: number }[];
  byType?: { type: string; count: number }[];
}

interface ChartProps {
  data: ValidationStats;
  className?: string;
}

// ============================================
// Couleurs neutres pour les graphiques
// ============================================
const CHART_COLORS = {
  pending: '#64748b', // slate-500
  validated: '#10b981', // emerald-500
  rejected: '#6b7280', // gray-500
  anomalies: '#f43f5e', // rose-500
  urgent: '#f59e0b', // amber-500
  total: '#6366f1', // indigo-500
};

const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#06b6d4'];

// ============================================
// Tooltip personnalisé
// ============================================
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {payload[0].name}
      </p>
      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {payload[0].value}
      </p>
    </div>
  );
};

// ============================================
// Graphique en barres - Vue d'ensemble des statuts
// ============================================
export function ValidationStatsBarChart({ data, className }: ChartProps) {
  const chartData = useMemo(() => [
    { name: 'En attente', value: data.pending, color: CHART_COLORS.pending },
    { name: 'Validés', value: data.validated, color: CHART_COLORS.validated },
    { name: 'Rejetés', value: data.rejected, color: CHART_COLORS.rejected },
    { name: 'Anomalies', value: data.anomalies, color: CHART_COLORS.anomalies },
  ], [data]);

  return (
    <div className={cn('w-full h-64', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Graphique camembert - Répartition par type
// ============================================
export function ValidationTypePieChart({ data, className }: ChartProps) {
  const chartData = useMemo(() => 
    data.byType?.map((item, index) => ({
      name: item.type,
      value: item.count,
      color: PIE_COLORS[index % PIE_COLORS.length],
    })) || [],
    [data.byType]
  );

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / data.total) * 100).toFixed(0);
    return `${entry.name} (${percent}%)`;
  };

  return (
    <div className={cn('w-full h-64', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Graphique par service - Barres empilées
// ============================================
export function ValidationByServiceChart({ data, className }: ChartProps) {
  const chartData = useMemo(() => 
    data.byService?.map((item) => ({
      service: item.service,
      'En attente': item.pending,
      'Traités': item.total - item.pending,
    })) || [],
    [data.byService]
  );

  return (
    <div className={cn('w-full h-64', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
          <XAxis
            dataKey="service"
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Legend />
          <Bar dataKey="En attente" stackId="a" fill={CHART_COLORS.pending} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Traités" stackId="a" fill={CHART_COLORS.validated} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Mini graphique de tendance (Sparkline)
// ============================================
interface TrendData {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendData[];
  color?: string;
  className?: string;
}

export function ValidationTrendChart({ data, color = CHART_COLORS.pending, className }: TrendChartProps) {
  return (
    <div className={cn('w-full h-16', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTrend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Dashboard graphique complet
// ============================================
export function ValidationDashboardCharts({ data, className }: ChartProps) {
  if (!data) {
    return (
      <div className={cn('flex items-center justify-center h-64 text-slate-400', className)}>
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
      {/* Graphique statuts */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
          Répartition par statut
        </h3>
        <ValidationStatsBarChart data={data} />
      </div>

      {/* Graphique types */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
          Répartition par type
        </h3>
        <ValidationTypePieChart data={data} />
      </div>

      {/* Graphique services */}
      {data.byService && data.byService.length > 0 && (
        <div className="md:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
            Répartition par service
          </h3>
          <ValidationByServiceChart data={data} />
        </div>
      )}
    </div>
  );
}

