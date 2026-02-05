'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { TrendChart } from './TrendChart';

interface PredictionWidgetProps {
  historical: Array<{ period: string; value: number }>;
  predicted: Array<{ period: string; value: number }>;
  label: string;
  color: string;
  riskLevel?: 'low' | 'medium' | 'high';
  className?: string;
}

export function PredictionWidget({
  historical,
  predicted,
  label,
  color,
  riskLevel = 'low',
  className,
}: PredictionWidgetProps) {
  const { darkMode } = useAppStore();

  const combinedData = useMemo(() => {
    const all = [...historical, ...predicted];
    return all.map((d, idx) => ({
      period: d.period,
      value: d.value,
      isPredicted: idx >= historical.length,
    }));
  }, [historical, predicted]);

  const trend = useMemo(() => {
    if (historical.length < 2) return 'stable';
    const recent = historical.slice(-3);
    const avg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const first = historical[0]?.value || 0;
    if (avg > first * 1.1) return 'up';
    if (avg < first * 0.9) return 'down';
    return 'stable';
  }, [historical]);

  const riskColors = {
    low: darkMode ? 'text-emerald-400' : 'text-emerald-600',
    medium: darkMode ? 'text-amber-400' : 'text-amber-600',
    high: darkMode ? 'text-red-400' : 'text-red-600',
  };

  return (
    <div
      className={cn(
        'rounded-lg p-3 border',
        darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-gray-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          {riskLevel !== 'low' && (
            <AlertTriangle className={cn('w-4 h-4', riskColors[riskLevel])} />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <TrendingUp className={cn('w-3 h-3', trend === 'up' ? 'text-emerald-400' : 'text-slate-400')} />
          <span className={cn('text-[10px]', darkMode ? 'text-slate-400' : 'text-gray-500')}>
            {trend === 'up' ? 'Hausse' : trend === 'down' ? 'Baisse' : 'Stable'}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <TrendChart
          data={combinedData.map((d) => ({ period: d.period, value: d.value }))}
          color={color}
          height={80}
          type="line"
        />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Historique</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full border-2 border-dashed" style={{ borderColor: color }} />
          <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Prévision</span>
        </div>
      </div>
    </div>
  );
}

