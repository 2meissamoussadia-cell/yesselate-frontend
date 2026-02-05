'use client';

/**
 * Heatmap RACI interactive
 * Visualisation des responsabilités par activité et bureau
 * Permet de détecter rapidement les surcharges, conflits, et patterns
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';

interface RACIHeatmapProps {
  raciData: Array<{
    activity: string;
    category: string;
    criticality: string;
    roles: Record<string, string>;
    locked?: boolean;
  }>;
  bureaux: string[];
}

export function RACIHeatmap({ raciData, bureaux }: RACIHeatmapProps) {
  const { darkMode } = useAppStore();

  // Calculer la distribution des rôles par bureau
  const bureauStats = useMemo(() => {
    const stats: Record<string, { R: number; A: number; C: number; I: number; total: number }> = {};

    bureaux.forEach(bureau => {
      stats[bureau] = { R: 0, A: 0, C: 0, I: 0, total: 0 };
    });

    raciData.forEach(row => {
      bureaux.forEach(bureau => {
        const role = row.roles[bureau] || '-';
        if (role !== '-' && stats[bureau]) {
          stats[bureau][role as 'R' | 'A' | 'C' | 'I']++;
          stats[bureau].total++;
        }
      });
    });

    return stats;
  }, [raciData, bureaux]);

  // Détecter les anomalies (surcharges, absences)
  const anomalies = useMemo(() => {
    const issues: Array<{ bureau: string; type: 'overload' | 'underload' | 'noA'; severity: 'high' | 'medium'; message: string }> = [];

    Object.entries(bureauStats).forEach(([bureau, stats]) => {
      const totalActivities = raciData.length;
      const participationRate = (stats.total / totalActivities) * 100;

      // Surcharge : plus de 50% des activités
      if (participationRate > 50) {
        issues.push({
          bureau,
          type: 'overload',
          severity: participationRate > 70 ? 'high' : 'medium',
          message: `${Math.round(participationRate)}% des activités (${stats.total}/${totalActivities})`,
        });
      }

      // Sous-charge : moins de 10% des activités
      if (participationRate < 10 && bureau !== 'BMO') {
        issues.push({
          bureau,
          type: 'underload',
          severity: 'medium',
          message: `Seulement ${Math.round(participationRate)}% des activités`,
        });
      }

      // Pas de rôle Accountable
      if (stats.A === 0 && bureau === 'BMO') {
        issues.push({
          bureau,
          type: 'noA',
          severity: 'high',
          message: 'Aucun rôle Accountable attribué',
        });
      }
    });

    return issues;
  }, [bureauStats, raciData.length]);

  const maxTotal = Math.max(...Object.values(bureauStats).map(s => s.total), 1);

  const getIntensityColor = (value: number, max: number) => {
    if (max === 0) return 'bg-slate-800';
    const normalized = value / max;
    if (normalized === 0) return 'bg-slate-800';
    if (normalized < 0.25) return 'bg-blue-900/30';
    if (normalized < 0.5) return 'bg-blue-700/50';
    if (normalized < 0.75) return 'bg-amber-600/50';
    return 'bg-red-600/60';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'R': return 'bg-emerald-400/80';
      case 'A': return 'bg-blue-400/80';
      case 'C': return 'bg-amber-400/80';
      case 'I': return 'bg-slate-400/80';
      default: return 'bg-slate-700/30';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>🔥 Heatmap RACI - Distribution des responsabilités</span>
          <Badge variant="info" className="text-[9px]">
            {raciData.length} activités
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Anomalies détectées */}
        {anomalies.length > 0 && (
          <div className="space-y-2 p-3 rounded-lg bg-amber-400/8 border border-amber-400/20">
            <p className="text-xs font-semibold text-amber-300/80 mb-2">⚠️ Anomalies détectées</p>
            {anomalies.map((issue, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Badge
                  variant={issue.severity === 'high' ? 'urgent' : 'warning'}
                  className="text-[9px]"
                >
                  {issue.bureau}
                </Badge>
                <span className="text-slate-300">
                  {issue.type === 'overload' && '📈 Surcharge: '}
                  {issue.type === 'underload' && '📉 Sous-charge: '}
                  {issue.type === 'noA' && '❌ Absence rôle A: '}
                  {issue.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Heatmap principale */}
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] sm:text-xs">
            <thead>
              <tr className={cn("border-b", darkMode ? "border-slate-700" : "border-gray-200")}>
                <th className="p-2 text-left font-bold">Bureau</th>
                <th className="p-2 text-center font-bold">Total</th>
                <th className="p-2 text-center font-bold">R</th>
                <th className="p-2 text-center font-bold">A</th>
                <th className="p-2 text-center font-bold">C</th>
                <th className="p-2 text-center font-bold">I</th>
                <th className="p-2 text-center font-bold">Visualisation</th>
              </tr>
            </thead>
            <tbody>
              {bureaux.map(bureau => {
                const stats = bureauStats[bureau];
                return (
                  <tr
                    key={bureau}
                    className={cn(
                      "border-b transition-colors",
                      darkMode ? "border-slate-700/50 hover:bg-slate-800/30" : "border-gray-100 hover:bg-gray-50"
                    )}
                  >
                    <td className="p-2 font-semibold">{bureau}</td>
                    <td className={cn("p-2 text-center font-bold", getIntensityColor(stats.total, maxTotal))}>
                      {stats.total}
                    </td>
                    <td className="p-2 text-center">
                      <span className={cn("inline-block w-6 h-6 rounded text-white text-[10px] font-bold flex items-center justify-center", getRoleColor('R'))}>
                        {stats.R}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={cn("inline-block w-6 h-6 rounded text-white text-[10px] font-bold flex items-center justify-center", getRoleColor('A'))}>
                        {stats.A}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={cn("inline-block w-6 h-6 rounded text-white text-[10px] font-bold flex items-center justify-center", getRoleColor('C'))}>
                        {stats.C}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={cn("inline-block w-6 h-6 rounded text-white text-[10px] font-bold flex items-center justify-center", getRoleColor('I'))}>
                        {stats.I}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-0.5 items-center justify-center">
                        {['R', 'A', 'C', 'I'].map(role => {
                          const count = stats[role as 'R' | 'A' | 'C' | 'I'];
                          const width = count > 0 ? Math.max((count / maxTotal) * 100, 10) : 0;
                          return (
                            <div
                              key={role}
                              className={cn(
                                "h-4 rounded-sm transition-all",
                                getRoleColor(role),
                                count === 0 && "opacity-20"
                              )}
                              style={{ width: `${width}%` }}
                              title={`${role}: ${count}`}
                            />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-3 p-2 rounded bg-slate-800/50">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Intensité:</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map((val, idx) => (
                <div
                  key={idx}
                  className={cn("w-4 h-3 rounded", getIntensityColor((val / 100) * maxTotal, maxTotal))}
                  title={`${val}%`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

