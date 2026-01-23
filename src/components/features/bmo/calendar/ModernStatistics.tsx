'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, AlertCircle, Clock, Users, Activity } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { bureaux } from '@/lib/data';

interface ModernStatisticsProps {
  activities: CalendarEvent[];
  actionLogs: Array<{
    module: string;
    action: string;
    timestamp: string;
    targetId: string;
  }>;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function ModernStatistics({ activities, actionLogs }: ModernStatisticsProps) {
  // Données pour graphique en barres - Charge par bureau
  const bureauLoadData = useMemo(() => {
    return bureaux
      .map((bureau) => {
        const bureauActivities = activities.filter(a => a.bureau === bureau.code);
        const totalCharge = bureauActivities.reduce((sum, a) => sum + (a.estimatedCharge || 1), 0);
        const critical = bureauActivities.filter(a => 
          a.priority === 'critical' || a.priority === 'urgent'
        ).length;
        
        return {
          bureau: bureau.code,
          nom: bureau.name,
          charge: totalCharge,
          activites: bureauActivities.length,
          critiques: critical,
          completed: bureauActivities.filter(a => a.status === 'completed').length,
        };
      })
      .filter(b => b.activites > 0)
      .sort((a, b) => b.charge - a.charge);
  }, [activities]);

  // Données pour graphique linéaire - Évolution sur 7 jours
  const weeklyTrendData = useMemo(() => {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      days.push(day);
    }

    return days.map((day) => {
      const dateStr = day.toISOString().split('T')[0];
      const dayActivities = activities.filter(a => a.date === dateStr);
      const criticalCount = dayActivities.filter(a => 
        a.priority === 'critical' || a.priority === 'urgent'
      ).length;
      const completedCount = dayActivities.filter(a => a.status === 'completed').length;

      return {
        jour: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
        date: dateStr,
        total: dayActivities.length,
        critiques: criticalCount,
        completes: completedCount,
      };
    });
  }, [activities]);

  // Données pour graphique en secteurs - Répartition par priorité
  const priorityDistribution = useMemo(() => {
    const distribution = {
      Critique: activities.filter(a => a.priority === 'critical').length,
      Urgent: activities.filter(a => a.priority === 'urgent').length,
      Haute: activities.filter(a => a.priority === 'high').length,
      Normale: activities.filter(a => !a.priority || a.priority === 'normal' || a.priority === 'low').length,
    };

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [activities]);

  // Données pour graphique aires - Charge par type d'activité
  const activityTypeData = useMemo(() => {
    const typeMap = new Map<string, number>();
    activities.forEach((activity) => {
      const type = activity.type || 'autre';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [activities]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'completed').length;
    const critical = activities.filter(a => 
      a.priority === 'critical' || a.priority === 'urgent'
    ).length;
    const today = activities.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.date === today;
    }).length;

    return { total, completed, critical, today, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [activities]);

  return (
    <div className="space-y-4">
      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <Badge variant="info" className="text-xs">{globalStats.completionRate}%</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400">{globalStats.total}</p>
            <p className="text-xs text-slate-400 mt-1">Total activités</p>
            <p className="text-[10px] text-emerald-400 mt-1">{globalStats.completed} complétées</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              {globalStats.critical > 0 && (
                <Badge variant="urgent" className="text-xs">{globalStats.critical}</Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-red-400">{globalStats.critical}</p>
            <p className="text-xs text-slate-400 mt-1">Critiques/Urgentes</p>
            <p className="text-[10px] text-amber-400 mt-1">Attention requise</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <Badge variant="warning" className="text-xs">Aujourd'hui</Badge>
            </div>
            <p className="text-2xl font-bold text-orange-400">{globalStats.today}</p>
            <p className="text-xs text-slate-400 mt-1">Activités du jour</p>
            <p className="text-[10px] text-slate-400 mt-1">En cours</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <Badge variant="success" className="text-xs">+{globalStats.completionRate}%</Badge>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{globalStats.completionRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Taux complétion</p>
            <p className="text-[10px] text-slate-400 mt-1">Performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Graphique en barres - Charge par bureau */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Charge par Bureau (heures)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bureauLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="bureau" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend />
                <Bar dataKey="charge" fill="#3b82f6" name="Charge (h)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="critiques" fill="#ef4444" name="Critiques" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique linéaire - Évolution 7 jours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Évolution sur 7 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritiques" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="jour" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)"
                  name="Total activités"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="critiques" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorCritiques)"
                  name="Critiques"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="completes" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Complétées"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique en secteurs - Répartition par priorité */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Répartition par Priorité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique barres horizontales - Top 5 types d'activités */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Top 5 Types d'Activités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={activityTypeData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Nombre" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

