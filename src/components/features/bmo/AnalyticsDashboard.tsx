'use client';
import { useState, useEffect } from 'react';
import { analyticsService, type ProjetsAnalytics, type KPIData } from '../../../../lib/services/analyticsService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Download, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props {
  type: 'projets' | 'finances' | 'rh' | 'clients';
  className?: string;
}

export function AnalyticsDashboard({ type, className }: Props) {
  const [data, setData] = useState<any>(null);
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ debut: '2026-01-01', fin: '2026-12-31' });

  useEffect(() => {
    loadAnalytics();
  }, [type, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      let analyticsData;
      switch (type) {
        case 'projets':
          analyticsData = await analyticsService.getProjetsAnalytics(dateRange.debut, dateRange.fin);
          break;
        case 'finances':
          analyticsData = await analyticsService.getFinancesAnalytics(dateRange.debut, dateRange.fin);
          break;
        case 'rh':
          analyticsData = await analyticsService.getRHAnalytics(dateRange.debut, dateRange.fin);
          break;
        case 'clients':
          analyticsData = await analyticsService.getClientsAnalytics(dateRange.debut, dateRange.fin);
          break;
      }

      setData(analyticsData);

      // Convertir les KPIs
      if (analyticsData.kpis) {
        const kpiData: KPIData[] = Object.entries(analyticsData.kpis).map(([key, value]) => ({
          id: key,
          titre: key.replace(/([A-Z])/g, ' $1').trim(),
          valeur: value as number,
          format: 'number',
        }));
        setKpis(kpiData);
      }
    } catch (e) {
      logger.error('Erreur chargement analytics', e instanceof Error ? e : undefined, { component: 'AnalyticsDashboard' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!data) return;

    try {
      if (format === 'csv') {
        await analyticsService.exportToCSV(data, `analytics-${type}-${Date.now()}`);
      } else {
        await analyticsService.exportToPDF(data, `analytics-${type}-${Date.now()}`);
      }
    } catch (e) {
      logger.error('Erreur export', e instanceof Error ? e : undefined, { component: 'AnalyticsDashboard' });
    }
  };

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-6', className)}>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-800/30" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-slate-800/30" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn('p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center', className)}>
        <p className="text-slate-400">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">
            Analytics {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Période: {new Date(dateRange.debut).toLocaleDateString('fr-FR')} - {new Date(dateRange.fin).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Graphiques spécifiques par type */}
      {type === 'projets' && <ProjetsCharts data={data} />}
      {type === 'finances' && <FinancesCharts data={data} />}
      {type === 'rh' && <RHCharts data={data} />}
      {type === 'clients' && <ClientsCharts data={data} />}
    </div>
  );
}

// Composant KPI Card
function KPICard({ kpi }: { kpi: KPIData }) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-slate-400">{kpi.titre}</span>
        {kpi.tendance && (
          <div className={cn(
            'p-1 rounded-lg',
            kpi.tendance === 'up' && 'bg-green-500/20',
            kpi.tendance === 'down' && 'bg-red-500/20',
            kpi.tendance === 'stable' && 'bg-slate-500/20'
          )}>
            {kpi.tendance === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
            {kpi.tendance === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            {kpi.tendance === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-200">
          {kpi.format === 'currency' ? analyticsService.formatCurrency(kpi.valeur as number) : kpi.valeur}
        </span>
        {kpi.unite && <span className="text-sm text-slate-400">{kpi.unite}</span>}
      </div>

      {kpi.evolution !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span className={cn(
            'font-semibold',
            kpi.evolution > 0 ? 'text-green-400' : kpi.evolution < 0 ? 'text-red-400' : 'text-slate-400'
          )}>
            {kpi.evolution > 0 ? '+' : ''}{kpi.evolution}%
          </span>
          <span className="text-slate-400">{kpi.evolutionPeriode}</span>
        </div>
      )}
    </div>
  );
}

// Graphiques pour Projets
function ProjetsCharts({ data }: { data: ProjetsAnalytics }) {
  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Évolution Budget */}
      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Évolution du Budget</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.evolutionBudget}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} tickFormatter={(val) => analyticsService.formatCurrency(val)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#cbd5e1' }}
              formatter={(value: any) => [analyticsService.formatCurrency(value), 'Budget']}
            />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition Statuts */}
      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Répartition par Statut</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.repartitionStatuts as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }: any) => `${category} (${percentage}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.repartitionStatuts.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Projets Budget */}
      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 lg:col-span-2">
        <h3 className="font-semibold text-slate-200 mb-4">Top Projets par Budget</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.topProjetsBudget}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="projet" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} tickFormatter={(val) => analyticsService.formatCurrency(val)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(value: any) => [analyticsService.formatCurrency(value), '']}
            />
            <Legend />
            <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
            <Bar dataKey="consomme" fill="#10b981" name="Consommé" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Graphiques pour Finances (similaire à Projets, adaptée aux données finances)
function FinancesCharts({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Évolution Trésorerie</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.evolutionTresorerie}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} tickFormatter={(val) => analyticsService.formatCurrency(val)} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Répartition Dépenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data.repartitionDepenses as any} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ category, percentage }: any) => `${category} (${percentage}%)`}>
              {data.repartitionDepenses.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Graphiques pour RH
function RHCharts({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Évolution Effectifs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.evolutionEffectifs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Répartition Compétences</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data.repartitionCompetences as any} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ category, percentage }: any) => `${category} (${percentage}%)`}>
              {data.repartitionCompetences.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Graphiques pour Clients
function ClientsCharts({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Évolution Clients</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.evolutionClients}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-semibold text-slate-200 mb-4">Top Clients CA</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.topClientsCA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="client" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} tickFormatter={(val) => analyticsService.formatCurrency(val)} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value: any) => [analyticsService.formatCurrency(value), 'CA']} />
            <Bar dataKey="ca" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

