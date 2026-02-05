'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import type { Demand } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface DemandHeatmapProps {
  demands: Demand[];
  bureaux: any[];
  groupBy: 'bureau' | 'priority' | 'type';
}

export function DemandHeatmap({ demands, bureaux, groupBy }: DemandHeatmapProps) {
  const { darkMode } = useAppStore();

  const heatmapData = useMemo(() => {
    if (groupBy === 'bureau') {
      const data: Record<string, { total: number; urgent: number; high: number; normal: number }> = {};
      
      bureaux.forEach(bureau => {
        const bureauDemands = demands.filter(d => d.bureau === bureau.code);
        data[bureau.code] = {
          total: bureauDemands.length,
          urgent: bureauDemands.filter(d => d.priority === 'urgent').length,
          high: bureauDemands.filter(d => d.priority === 'high').length,
          normal: bureauDemands.filter(d => d.priority === 'normal').length,
        };
      });

      return { type: 'bureau' as const, data };
    }

    if (groupBy === 'priority') {
      const data: Record<string, number> = {
        urgent: demands.filter(d => d.priority === 'urgent').length,
        high: demands.filter(d => d.priority === 'high').length,
        normal: demands.filter(d => d.priority === 'normal').length,
      };
      return { type: 'priority' as const, data };
    }

    // groupBy === 'type'
    const data: Record<string, number> = {};
    demands.forEach(demand => {
      data[demand.type] = (data[demand.type] || 0) + 1;
    });
    return { type: 'type' as const, data };
  }, [demands, bureaux, groupBy]);

  const getIntensityColor = (value: number, maxValue: number) => {
    if (maxValue === 0) return 'bg-slate-800';
    const normalized = value / maxValue;
    if (normalized === 0) return 'bg-slate-800';
    if (normalized < 0.25) return 'bg-blue-900/50';
    if (normalized < 0.5) return 'bg-blue-700/50';
    if (normalized < 0.75) return 'bg-orange-600/50';
    return 'bg-red-600/50';
  };

  const maxValue = useMemo(() => {
    if (heatmapData.type === 'bureau') {
      const values = Object.values(heatmapData.data).map(d => d.total);
      return Math.max(...values, 1);
    }
    const values = Object.values(heatmapData.data);
    return Math.max(...values, 1);
  }, [heatmapData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Heatmap des demandes
          <Badge variant="info" className="ml-auto">
            {groupBy === 'bureau' ? 'Par bureau' : groupBy === 'priority' ? 'Par priorité' : 'Par type'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {heatmapData.type === 'bureau' ? (
          <div className="space-y-3">
            {Object.entries(heatmapData.data).map(([bureauCode, stats]) => (
              <div key={bureauCode} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BureauTag bureau={bureauCode} />
                    <span className="text-sm font-medium">{stats.total} demande{stats.total > 1 ? 's' : ''}</span>
                  </div>
                  <Badge variant="info">{stats.total}</Badge>
                </div>
                <div className="flex gap-1 h-8">
                  <div
                    className={cn(
                      'flex-1 rounded-l transition-all hover:scale-105 cursor-pointer',
                      getIntensityColor(stats.urgent, maxValue)
                    )}
                    title={`Urgentes: ${stats.urgent}`}
                  >
                    {stats.urgent > 0 && (
                      <div className="h-full flex items-center justify-center text-xs font-bold text-white">
                        {stats.urgent}
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex-1 transition-all hover:scale-105 cursor-pointer',
                      getIntensityColor(stats.high, maxValue)
                    )}
                    title={`Prioritaires: ${stats.high}`}
                  >
                    {stats.high > 0 && (
                      <div className="h-full flex items-center justify-center text-xs font-bold text-white">
                        {stats.high}
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex-1 rounded-r transition-all hover:scale-105 cursor-pointer',
                      getIntensityColor(stats.normal, maxValue)
                    )}
                    title={`Normales: ${stats.normal}`}
                  >
                    {stats.normal > 0 && (
                      <div className="h-full flex items-center justify-center text-xs font-bold text-white">
                        {stats.normal}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(heatmapData.data).map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  'p-4 rounded-lg transition-all hover:scale-105 cursor-pointer',
                  getIntensityColor(value, maxValue)
                )}
              >
                <div className="text-center">
                  <p className="text-xs text-slate-300 mb-1 uppercase">{key}</p>
                  <p className="text-2xl font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Légende */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
          <span className="text-xs text-slate-400">Intensité:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-slate-800 rounded"></div>
            <div className="w-4 h-4 bg-blue-900/50 rounded"></div>
            <div className="w-4 h-4 bg-blue-700/50 rounded"></div>
            <div className="w-4 h-4 bg-orange-600/50 rounded"></div>
            <div className="w-4 h-4 bg-red-600/50 rounded"></div>
            <span className="text-xs text-slate-400 ml-2">Min | Max: {maxValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

