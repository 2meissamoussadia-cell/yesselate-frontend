/**
 * Vue Tendances - Graphiques et analyses
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Clock,
  Users,
  FileText,
  BarChart3,
  Building2,
} from 'lucide-react';
import {
  LineChart,
  Line,
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

interface TrendsViewProps {
  subCategory?: string;
}

export function TrendsView({ subCategory = 'performance' }: TrendsViewProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);

  // Données mockées pour démonstration
  const performanceData = [
    { date: 'Sem 1', validates: 45, rejetes: 5, delai: 2.1 },
    { date: 'Sem 2', validates: 52, rejetes: 3, delai: 1.9 },
    { date: 'Sem 3', validates: 48, rejetes: 7, delai: 2.3 },
    { date: 'Sem 4', validates: 58, rejetes: 4, delai: 1.8 },
  ];

  const volumesData = [
    { mois: 'Sep', bc: 120, factures: 85, avenants: 15 },
    { mois: 'Oct', bc: 135, factures: 92, avenants: 18 },
    { mois: 'Nov', bc: 128, factures: 88, avenants: 20 },
    { mois: 'Déc', bc: 156, factures: 98, avenants: 25 },
  ];

  const bureauData = [
    { name: 'Achats', value: 187, color: '#3b82f6' },
    { name: 'Finance', value: 223, color: '#8b5cf6' },
    { name: 'Juridique', value: 43, color: '#06b6d4' },
  ];

  const delaisData = [
    { categorie: '< 1 jour', count: 45, pourcentage: 28 },
    { categorie: '1-2 jours', count: 78, pourcentage: 49 },
    { categorie: '2-3 jours', count: 25, pourcentage: 16 },
    { categorie: '> 3 jours', count: 12, pourcentage: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Tendances et Analyses</h2>
          <p className="text-slate-400 text-sm">
            {subCategory === 'performance' && 'Performance de validation'}
            {subCategory === 'volumes' && 'Évolution des volumes'}
            {subCategory === 'delais' && 'Analyse des délais'}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="h-8"
            >
              {range === '7d' && '7 jours'}
              {range === '30d' && '30 jours'}
              {range === '90d' && '90 jours'}
              {range === '1y' && '1 an'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Taux de Validation</p>
                <p className="text-2xl font-bold text-emerald-400">94.2%</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.3% vs mois dernier
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Délai Moyen</p>
                <p className="text-2xl font-bold text-blue-400">1.9j</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -0.4j vs mois dernier
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Volume Total</p>
                <p className="text-2xl font-bold text-purple-400">453</p>
                <p className="text-xs text-purple-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs mois dernier
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Validateurs Actifs</p>
                <p className="text-2xl font-bold text-cyan-400">12</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  Moyenne: 37.8 docs/validateur
                </p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Performance de Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
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
                  dataKey="validates"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Validés"
                />
                <Line
                  type="monotone"
                  dataKey="rejetes"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Rejetés"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volumes Chart */}
        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Évolution des Volumes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mois" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="bc" fill="#3b82f6" name="BC" />
                <Bar dataKey="factures" fill="#8b5cf6" name="Factures" />
                <Bar dataKey="avenants" fill="#06b6d4" name="Avenants" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par Bureau */}
        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-400" />
              Répartition par Bureau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bureauData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bureauData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
          </CardContent>
        </Card>

        {/* Délais de Traitement */}
        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Délais de Traitement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {delaisData.map((item) => (
                <div key={item.categorie} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.categorie}</span>
                    <span className="text-slate-400">
                      {item.count} docs ({item.pourcentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        item.pourcentage > 40 ? 'bg-emerald-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${item.pourcentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

