'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { FileText, TrendingUp, Activity } from 'lucide-react';

interface JournalChartsProps {
  actionLogs: Array<{
    module: string;
    action: string;
    timestamp: string;
    targetId: string;
    bureau?: string;
  }>;
  journalFilters: {
    bureau?: string;
    project?: string;
    actionType?: string;
  };
}

export function JournalCharts({ actionLogs, journalFilters }: JournalChartsProps) {
  // Filtrer les logs selon les filtres
  const filteredLogs = useMemo(() => {
    return actionLogs.filter((log) => {
      if (log.module !== 'calendar' && log.module !== 'alerts') return false;
      if (journalFilters.bureau && log.bureau !== journalFilters.bureau) return false;
      if (journalFilters.actionType && log.action !== journalFilters.actionType) return false;
      return true;
    });
  }, [actionLogs, journalFilters]);

  // Graphique - Actions par jour (7 derniers jours)
  const dailyActions = useMemo(() => {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      days.push(day);
    }

    return days.map((day) => {
      const dateStr = day.toISOString().split('T')[0];
      const dayLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === dateStr;
      });

      const planning = dayLogs.filter(l => l.action.includes('planifié') || l.action.includes('créé')).length;
      const resolved = dayLogs.filter(l => l.action.includes('résolu') || l.action.includes('terminé')).length;
      const modified = dayLogs.filter(l => l.action.includes('modifié') || l.action.includes('replanifié')).length;

      return {
        jour: day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        date: dateStr,
        planification: planning,
        resolution: resolved,
        modification: modified,
        total: dayLogs.length,
      };
    });
  }, [filteredLogs]);

  // Graphique - Actions par type
  const actionsByType = useMemo(() => {
    const typeMap = new Map<string, number>();
    filteredLogs.forEach((log) => {
      let type = 'Autre';
      if (log.action.includes('planifié') || log.action.includes('créé')) {
        type = 'Planification';
      } else if (log.action.includes('résolu') || log.action.includes('terminé')) {
        type = 'Résolution';
      } else if (log.action.includes('modifié') || log.action.includes('replanifié')) {
        type = 'Modification';
      } else if (log.action.includes('escaladé')) {
        type = 'Escalade';
      } else if (log.action.includes('substitué')) {
        type = 'Substitution';
      }
      
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredLogs]);

  // Graphique - Actions par bureau
  const actionsByBureau = useMemo(() => {
    const bureauMap = new Map<string, number>();
    filteredLogs.forEach((log) => {
      const bureau = log.bureau || 'Non défini';
      bureauMap.set(bureau, (bureauMap.get(bureau) || 0) + 1);
    });

    return Array.from(bureauMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredLogs]);

  // Graphique Radar - Répartition par type d'action
  const radarData = useMemo(() => {
    const types = ['Planification', 'Résolution', 'Modification', 'Escalade', 'Substitution', 'Autre'];
    return [{
      subject: '',
      ...Object.fromEntries(
        types.map(type => {
          const count = actionsByType.find(a => a.name === type)?.value || 0;
          return [type, count];
        })
      ),
    }];
  }, [actionsByType]);

  const radarKeys = ['Planification', 'Résolution', 'Modification', 'Escalade', 'Substitution', 'Autre'];
  const radarColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  if (filteredLogs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-slate-400">Aucune donnée à afficher</p>
          <p className="text-xs text-slate-500 mt-1">Les graphiques apparaîtront avec des actions enregistrées</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Graphiques en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Évolution des actions sur 7 jours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Évolution des Actions (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyActions}>
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
                <Bar dataKey="planification" fill="#3b82f6" name="Planification" radius={[8, 8, 0, 0]} />
                <Bar dataKey="resolution" fill="#10b981" name="Résolution" radius={[8, 8, 0, 0]} />
                <Bar dataKey="modification" fill="#f59e0b" name="Modification" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actions par type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Répartition par Type d'Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={actionsByType} layout="vertical">
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
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Nombre d'actions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actions par bureau */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Actions par Bureau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={actionsByBureau}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Bar dataKey="value" fill="#ec4899" name="Actions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique Radar - Répartition multidimensionnelle */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Vue Radar des Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, Math.max(...radarKeys.map(k => (radarData[0] as any)?.[k] || 0))]} 
                  tick={{ fill: '#9ca3af', fontSize: 9 }}
                />
                {radarKeys.map((key, index) => (
                  <Radar
                    key={key}
                    name={key}
                    dataKey={key}
                    stroke={radarColors[index]}
                    fill={radarColors[index]}
                    fillOpacity={0.6}
                  />
                ))}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

