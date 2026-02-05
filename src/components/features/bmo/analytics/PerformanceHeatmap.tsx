'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Tooltip simplifié sans dépendance externe
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs bg-slate-800 text-white rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap">
          {content}
        </div>
      )}
    </div>
  );
};

interface PerformanceHeatmapProps {
  performanceData: any[];
  bureaux: any[];
  metric: 'demandes' | 'validations' | 'rejets' | 'taux';
}

export function PerformanceHeatmap({ performanceData, bureaux, metric }: PerformanceHeatmapProps) {
  const { darkMode } = useAppStore();

  const heatmapData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    const isByBureau = performanceData.some((d: any) => d && typeof d === 'object' && 'bureau' in d);

    // Index rapide pour dataset bureau-par-bureau : map[bureau][month] = row
    const index: Record<string, Record<string, any>> = {};
    if (isByBureau) {
      (performanceData as any[]).forEach((row: any) => {
        const b = String(row?.bureau ?? '');
        const m = String(row?.month ?? '');
        if (!b || !m) return;
        index[b] ||= {};
        index[b][m] = row;
      });
    }

    bureaux.forEach((bureau) => {
      data[bureau.code] = {};
      if (isByBureau) {
        // valeurs par bureau/mois
        const months = Array.from(new Set((performanceData as any[]).map((r: any) => r?.month).filter(Boolean)));
        months.forEach((month) => {
          const row = index[bureau.code]?.[month];
          const demandes = Number(row?.demandes ?? 0);
          const validations = Number(row?.validations ?? 0);
          const rejets = Number(row?.rejets ?? 0);
          const value =
            metric === 'taux'
              ? demandes > 0
                ? (validations / demandes) * 100
                : 0
              : Number(row?.[metric] ?? 0);
          data[bureau.code][month] = value;
        });
      } else {
        // dataset agrégé (pas de bureau) : on remplit toutes les lignes avec la même série
        performanceData.forEach((month: any) => {
          const key = month.month;
          const demandes = Number(month?.demandes ?? 0);
          const validations = Number(month?.validations ?? 0);
          if (metric === 'taux') {
            const taux = demandes > 0 ? (validations / demandes) * 100 : 0;
            data[bureau.code][key] = taux;
          } else {
            data[bureau.code][key] = Number(month?.[metric] ?? 0);
          }
        });
      }
    });

    // Calculer les valeurs min/max pour la normalisation
    const allValues = Object.values(data).flatMap(bureauData => 
      Object.values(bureauData)
    );
    const maxValue = Math.max(...allValues, 1);
    const minValue = Math.min(...allValues, 0);

    return { data, maxValue, minValue };
  }, [performanceData, bureaux, metric]);

  const getIntensityColor = (value: number, maxValue: number, minValue: number) => {
    if (maxValue === minValue) return 'bg-slate-700';
    
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized === 0) return 'bg-slate-800';
    if (normalized < 0.25) return 'bg-blue-900/50';
    if (normalized < 0.5) return 'bg-blue-700/50';
    if (normalized < 0.75) return 'bg-orange-600/50';
    return 'bg-red-600/50';
  };

  const months = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    (performanceData as any[]).forEach((d: any) => {
      const m = String(d?.month ?? '');
      if (!m || seen.has(m)) return;
      seen.add(m);
      out.push(m);
    });
    return out;
  }, [performanceData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          🔥 Heatmap: {metric === 'taux' ? 'Taux de validation' : metric.charAt(0).toUpperCase() + metric.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left font-bold sticky left-0 bg-slate-800 z-10">
                    Bureau
                  </th>
                  {months.map((month: string) => (
                    <th
                      key={month}
                      className="px-2 py-2 text-center font-bold min-w-[60px]"
                    >
                      {month.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bureaux.map(bureau => (
                  <tr key={bureau.code} className="border-t border-slate-700/50">
                    <td className="px-2 py-2 font-medium sticky left-0 bg-slate-800 z-10">
                      {bureau.code}
                    </td>
                    {months.map((month: string) => {
                      const value = heatmapData.data[bureau.code]?.[month] || 0;
                      const tooltipContent = `${bureau.code} - ${month}: ${metric === 'taux' ? `Taux: ${value.toFixed(1)}%` : `${metric}: ${value.toLocaleString()}`}`;
                      return (
                        <Tooltip key={month} content={tooltipContent}>
                          <td
                            className={cn(
                              'px-2 py-2 text-center cursor-pointer transition-all hover:scale-110',
                              getIntensityColor(value, heatmapData.maxValue, heatmapData.minValue)
                            )}
                          >
                            <span className="text-[10px] font-mono">
                              {metric === 'taux' 
                                ? `${value.toFixed(0)}%` 
                                : value.toFixed(0)}
                            </span>
                          </td>
                        </Tooltip>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
          <span className="text-xs text-slate-400">Intensité:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-slate-800 rounded"></div>
            <div className="w-4 h-4 bg-blue-900/50 rounded"></div>
            <div className="w-4 h-4 bg-blue-700/50 rounded"></div>
            <div className="w-4 h-4 bg-orange-600/50 rounded"></div>
            <div className="w-4 h-4 bg-red-600/50 rounded"></div>
            <span className="text-xs text-slate-400 ml-2">
              Min: {heatmapData.minValue.toFixed(0)} | Max: {heatmapData.maxValue.toFixed(0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

