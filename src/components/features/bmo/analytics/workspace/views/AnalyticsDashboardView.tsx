/**
 * AnalyticsDashboardView.tsx
 * ===========================
 * 
 * Vue dashboard principal avec graphiques et insights
 * Intégration complète avec recharts
 */

'use client';

import { useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Users } from 'lucide-react';
import { calculateKPIs, generateTrendData, calculateBureauPerformance, mockComparisons, mockFinancialData } from '@/lib/data/analytics';

const COLORS = {
  primary: '#F97316',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
};

export function AnalyticsDashboardView() {
  const kpis = useMemo(() => calculateKPIs(), []);
  const trendData = useMemo(() => generateTrendData('month'), []);
  const bureauPerf = useMemo(() => calculateBureauPerformance(), []);
  
  // Top 3 KPIs
  const topKPIs = kpis.slice(0, 3);
  
  // Données pour graphique évolution
  const evolutionData = trendData.map((point, idx) => ({
    date: point.label || point.date.split('-').slice(1).join('/'),
    valeur: point.value,
    tendance: idx > 0 ? point.value - trendData[idx - 1].value : 0,
  }));

  // Données comparaison mois
  const comparisonData = [
    { name: 'Mois dernier', value: mockComparisons.lastMonth.validated },
    { name: 'Ce mois', value: mockComparisons.thisMonth.validated },
  ];

  // Données répartition bureaux
  const bureauData = bureauPerf.slice(0, 5).map(b => ({
    name: b.bureauCode,
    score: b.score,
    demandes: b.totalDemands,
  }));

  // Données financières pie chart
  const financialData = mockFinancialData.byCategory.map(cat => ({
    name: cat.category,
    value: cat.amount / 1000000, // En millions
    percentage: cat.percentage,
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header avec KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topKPIs.map((kpi) => (
          <FluentCard key={kpi.id} className={
            kpi.status === 'good' ? 'border-l-4 border-l-emerald-500' :
            kpi.status === 'warning' ? 'border-l-4 border-l-amber-500' :
            'border-l-4 border-l-red-500'
          }>
            <FluentCardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{kpi.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {kpi.value}
                    </span>
                    <span className="text-lg text-slate-400">{kpi.unit}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${
                  kpi.status === 'good' ? 'bg-emerald-500/10' :
                  kpi.status === 'warning' ? 'bg-amber-500/10' :
                  'bg-red-500/10'
                }`}>
                  <Target className={`w-6 h-6 ${
                    kpi.status === 'good' ? 'text-emerald-500' :
                    kpi.status === 'warning' ? 'text-amber-500' :
                    'text-red-500'
                  }`} />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Objectif: {kpi.target}{kpi.unit}
                </span>
                <div className="flex items-center gap-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : kpi.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : null}
                  <span className={
                    kpi.trend === 'up' ? 'text-emerald-400' :
                    kpi.trend === 'down' ? 'text-red-400' :
                    'text-slate-400'
                  }>
                    {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
                  </span>
                </div>
              </div>
            </FluentCardContent>
          </FluentCard>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution tendance */}
        <FluentCard>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm">📈 Évolution (30 derniers jours)</FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <div className="h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valeur"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fill="url(#colorValue)"
                    name="Valeur"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </FluentCardContent>
        </FluentCard>

        {/* Comparaison mois */}
        <FluentCard>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm">📊 Comparaison mensuelle</FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <div className="h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.success}
                    radius={[8, 8, 0, 0]}
                    name="Validations"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Stats comparaison */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400 mb-1">Évolution</div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">
                      +{Math.round(((mockComparisons.thisMonth.validated - mockComparisons.lastMonth.validated) / mockComparisons.lastMonth.validated) * 100)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">SLA</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{mockComparisons.thisMonth.slaCompliance}%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </FluentCardContent>
        </FluentCard>
      </div>

      {/* Performance bureaux + Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance bureaux */}
        <FluentCard>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm">🏢 Top 5 Bureaux (Score)</FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <div className="h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={bureauData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    type="number"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill={COLORS.info}
                    radius={[0, 8, 8, 0]}
                    name="Score /100"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FluentCardContent>
        </FluentCard>

        {/* Répartition financière */}
        <FluentCard>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm">💰 Répartition Budget</FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <div className="h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                  <Pie
                    data={financialData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${((entry.percent ?? 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number | undefined) => `${(value ?? 0).toFixed(0)}M FCFA`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Budget total</span>
                <span className="font-semibold text-slate-200">{(mockFinancialData.budgetTotal / 1000000000).toFixed(1)} Mds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Consommé</span>
                <span className="font-semibold text-amber-400">{Math.round((mockFinancialData.budgetConsumed / mockFinancialData.budgetTotal) * 100)}%</span>
              </div>
            </div>
          </FluentCardContent>
        </FluentCard>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{mockComparisons.thisMonth.total}</div>
              <div className="text-xs text-slate-400">Demandes ce mois</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {Math.round((mockComparisons.thisMonth.validated / mockComparisons.thisMonth.total) * 100)}%
              </div>
              <div className="text-xs text-slate-400">Taux validation</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{mockComparisons.thisMonth.avgDelay}j</div>
              <div className="text-xs text-slate-400">Délai moyen</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{bureauPerf.length}</div>
              <div className="text-xs text-slate-400">Bureaux actifs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

