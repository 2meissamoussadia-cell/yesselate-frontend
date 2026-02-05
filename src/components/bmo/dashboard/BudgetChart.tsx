'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface BudgetData {
  mois: string;
  previsionnel: number;
  realise: number;
  engage?: number;
}

export function BudgetChart({
  data,
  type = 'area',
}: {
  data: BudgetData[];
  type?: 'area' | 'line' | 'bar';
}) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 text-sm">
        Aucune donnée
      </div>
    );
  }

  const mapped = data.map((d) => ({
    mois: d.mois,
    previsionnel: d.previsionnel ?? (d as { prevu?: number }).prevu ?? 0,
    realise: d.realise,
    engage: d.engage ?? d.realise,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mapped}>
          <defs>
            <linearGradient id="colorPrevisionnel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRealise" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />

          <XAxis dataKey="mois" className="text-gray-600 dark:text-gray-400" fontSize={12} />

          <YAxis
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
            formatter={(value: number | undefined) => (value != null ? `${value.toLocaleString('fr-FR')} FCFA` : '')}
          />

          <Legend />

          <Area
            type="monotone"
            dataKey="previsionnel"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrevisionnel)"
            name="Prévisionnel"
          />

          <Area
            type="monotone"
            dataKey="realise"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRealise)"
            name="Réalisé"
          />

          <Area
            type="monotone"
            dataKey="engage"
            stroke="#F59E0B"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEngage)"
            name="Engagé"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
