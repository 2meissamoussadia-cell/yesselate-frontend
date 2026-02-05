/**
 * Page Tendances - Graphiques de tendances temporelles avec Recharts
 */

'use client';

import React, { useMemo } from 'react';
import { useDemandesTrends } from '../../hooks/useDemandesData';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function TrendsPage() {
  const { data: trends, isLoading } = useDemandesTrends(30);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-96 bg-slate-800/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const chartData = trends || generateMockTrendsData(30);

  // Formater les données pour Recharts
  const formattedData = useMemo(() => {
    return chartData.map((item) => ({
      date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      count: item.count,
    }));
  }, [chartData]);

  // Répartition par statut pour PieChart
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    chartData.forEach((item) => {
      const status = item.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + item.count;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [chartData]);

  const COLORS = ['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Tendances des demandes</h1>
        <p className="text-slate-400">Évolution sur 30 derniers jours</p>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AreaChart - Évolution temporelle */}
        <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Évolution du volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#9ca3af" />
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
                dataKey="count"
                stroke="#f97316"
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart - Répartition par statut */}
        <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Répartition par statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BarChart - Comparaison hebdomadaire */}
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Comparaison hebdomadaire</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData.slice(-7)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Détails par période */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Répartition par période</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PeriodCard label="7 derniers jours" value={chartData.slice(-7).reduce((sum, d) => sum + d.count, 0)} />
          <PeriodCard label="14 derniers jours" value={chartData.slice(-14).reduce((sum, d) => sum + d.count, 0)} />
          <PeriodCard label="30 derniers jours" value={chartData.reduce((sum, d) => sum + d.count, 0)} />
        </div>
      </section>
    </div>
  );
}

function PeriodCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
      <div className="text-sm text-slate-400 mb-2">{label}</div>
      <div className="text-3xl font-bold text-slate-200">{value}</div>
    </div>
  );
}

function generateMockTrendsData(days: number) {
  const data = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10,
      status: 'pending' as const,
    });
  }
  return data;
}
