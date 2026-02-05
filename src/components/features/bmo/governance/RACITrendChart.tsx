'use client';

/**
 * Graphique de tendances RACI
 * Affiche l'évolution des responsabilités par bureau sur le temps
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { TrendingUp } from 'lucide-react';

interface RACITrendChartProps {
  raciData: Array<{
    activity: string;
    category: string;
    criticality: string;
    roles: Record<string, string>;
    lastModified?: string;
  }>;
  bureaux: string[];
}

export function RACITrendChart({ raciData, bureaux }: RACITrendChartProps) {
  const { darkMode } = useAppStore();

  // Simuler des données historiques (en prod: récupérer depuis l'historique)
  const trendData = useMemo(() => {
    const months = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'];
    const data: Array<Record<string, number | string>> = [];

    months.forEach((month, idx) => {
      const entry: Record<string, number | string> = { month };
      bureaux.forEach(bureau => {
        // Simulation : comptage des rôles R/A par bureau
        const count = raciData.filter(r => 
          r.roles[bureau] === 'R' || r.roles[bureau] === 'A'
        ).length;
        // Simuler une tendance
        const trend = idx === months.length - 1 ? count : Math.max(0, count - (months.length - 1 - idx) * 2);
        entry[bureau] = trend;
      });
      data.push(entry);
    });

    return data;
  }, [raciData, bureaux]);

  const colors = {
    'BMO': '#3b82f6',
    'BF': '#10b981',
    'BM': '#f59e0b',
    'BA': '#ef4444',
    'BCT': '#8b5cf6',
    'BQC': '#ec4899',
    'BJ': '#06b6d4',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-300/80" />
          Évolution des responsabilités (6 mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
              <XAxis 
                dataKey="month" 
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                style={{ fontSize: '10px' }}
              />
              <YAxis 
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                style={{ fontSize: '10px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
              />
              {bureaux.map((bureau, idx) => (
                <Line
                  key={bureau}
                  type="monotone"
                  dataKey={bureau}
                  stroke={colors[bureau as keyof typeof colors] || '#94a3b8'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={bureau}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 text-center">
          Nombre d'activités avec rôle R ou A par bureau sur 6 mois
        </p>
      </CardContent>
    </Card>
  );
}

