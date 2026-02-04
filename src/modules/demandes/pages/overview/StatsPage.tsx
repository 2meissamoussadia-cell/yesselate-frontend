/**
 * Page Statistiques - Statistiques détaillées des demandes
 */

'use client';

import React, { useMemo } from 'react';
import { useDemandesStats } from '../../hooks/useDemandesStats';
import { useServiceStats } from '../../hooks/useDemandesData';
import { cn } from '@/lib/cn';
import { Clock, AlertCircle, CheckCircle2, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export function StatsPage() {
  const { data: stats, isLoading } = useDemandesStats();
  const { data: serviceStats, isLoading: serviceStatsLoading } = useServiceStats();

  if (isLoading || serviceStatsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-64 bg-slate-800/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const statsData = stats || {
    total: 453,
    pending: 45,
    urgent: 12,
    validated: 378,
    rejected: 15,
    overdue: 8,
    avgResponseTime: 2.3,
    approvalRate: 83,
    completionRate: 87,
    satisfactionScore: 4.2,
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Statistiques détaillées</h1>
        <p className="text-slate-400">Analyse complète des demandes BMO</p>
      </div>

      {/* Statistiques par statut */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Répartition par statut</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Clock}
            label="En attente"
            value={statsData.pending}
            color="amber"
            percentage={Math.round((statsData.pending / statsData.total) * 100)}
          />
          <StatCard
            icon={AlertCircle}
            label="Urgentes"
            value={statsData.urgent}
            color="red"
            percentage={Math.round((statsData.urgent / statsData.total) * 100)}
          />
          <StatCard
            icon={CheckCircle2}
            label="Validées"
            value={statsData.validated}
            color="green"
            percentage={Math.round((statsData.validated / statsData.total) * 100)}
          />
          <StatCard
            icon={XCircle}
            label="Rejetées"
            value={statsData.rejected}
            color="slate"
            percentage={Math.round((statsData.rejected / statsData.total) * 100)}
          />
          <StatCard
            icon={AlertCircle}
            label="En retard"
            value={statsData.overdue}
            color="orange"
            percentage={Math.round((statsData.overdue / statsData.total) * 100)}
          />
        </div>
      </section>

      {/* Indicateurs de performance */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Indicateurs de performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="text-sm text-slate-400 mb-2">Temps de réponse moyen</div>
            <div className="text-3xl font-bold text-slate-200">{statsData.avgResponseTime}h</div>
            <div className="flex items-center gap-1 text-green-500 text-xs mt-2">
              <TrendingDown className="h-3 w-3" />
              <span>-0.5h</span>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="text-sm text-slate-400 mb-2">Taux d'approbation</div>
            <div className="text-3xl font-bold text-slate-200">{statsData.approvalRate}%</div>
            <div className="flex items-center gap-1 text-green-500 text-xs mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+2%</span>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="text-sm text-slate-400 mb-2">Taux de complétion</div>
            <div className="text-3xl font-bold text-slate-200">{statsData.completionRate}%</div>
            <div className="flex items-center gap-1 text-green-500 text-xs mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+1%</span>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="text-sm text-slate-400 mb-2">Score de satisfaction</div>
            <div className="text-3xl font-bold text-slate-200">{statsData.satisfactionScore}/5</div>
            <div className="flex items-center gap-1 text-green-500 text-xs mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+0.2</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques par service */}
      {serviceStats && serviceStats.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-200">Statistiques par service</h2>
          
          {/* PieChart - Répartition par service */}
          <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Répartition par service</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceStats.map(s => ({ name: s.service, value: s.total }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceStats.map((entry, index) => {
                    const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                  })}
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

          {/* BarChart - Comparaison par service */}
          <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Comparaison par service</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceStats.map(s => ({ name: s.service, ...s }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="pending" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                <Bar dataKey="urgent" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="validated" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="rejected" fill="#64748b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Liste détaillée */}
          <div className="space-y-3">
            {serviceStats.map((service) => (
              <div
                key={service.service}
                className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-base font-medium text-slate-200 capitalize">{service.service}</div>
                  <div className="text-2xl font-bold text-slate-200">{service.total}</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">En attente</div>
                    <div className="text-slate-200 font-medium">{service.pending}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Urgentes</div>
                    <div className="text-red-400 font-medium">{service.urgent}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Validées</div>
                    <div className="text-green-400 font-medium">{service.validated}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Rejetées</div>
                    <div className="text-slate-400 font-medium">{service.rejected}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  percentage,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  percentage: number;
}) {
  return (
    <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn('h-5 w-5', `text-${color}-400`)} />
        <span className="text-xs text-slate-400">{percentage}%</span>
      </div>
      <div className="text-2xl font-bold text-slate-200 mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

