'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';

interface HeatmapData {
  bureau: string;
  month: string;
  value: number;
}

interface PerformanceHeatmapProps {
  data: HeatmapData[];
  bureaux: string[];
  months: string[];
  getColor: (value: number, max: number) => string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function PerformanceHeatmap({
  data,
  bureaux,
  months,
  getColor,
  formatValue = (v) => v.toString(),
  className,
}: PerformanceHeatmapProps) {
  const { darkMode } = useAppStore();

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  const heatmapGrid = useMemo(() => {
    return bureaux.map((bureau) => {
      const row = months.map((month) => {
        const item = data.find((d) => d.bureau === bureau && d.month === month);
        return {
          month,
          value: item?.value || 0,
          color: getColor(item?.value || 0, maxValue),
        };
      });
      return { bureau, cells: row };
    });
  }, [bureaux, months, data, maxValue, getColor]);

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-block min-w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={cn('p-2 text-left text-xs font-semibold sticky left-0 z-10', darkMode ? 'bg-slate-800' : 'bg-white')}>
                Bureau
              </th>
              {months.map((month) => (
                <th
                  key={month}
                  className={cn('p-2 text-center text-[10px] font-semibold min-w-[60px]', darkMode ? 'text-slate-300' : 'text-gray-700')}
                >
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapGrid.map((row) => (
              <tr key={row.bureau}>
                <td
                  className={cn(
                    'p-2 text-xs font-medium sticky left-0 z-10',
                    darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-800'
                  )}
                >
                  {row.bureau}
                </td>
                {row.cells.map((cell, idx) => (
                  <td
                    key={`${row.bureau}-${cell.month}`}
                    className={cn(
                      'p-2 text-center text-[10px] transition-colors',
                      darkMode ? 'bg-slate-800/50' : 'bg-gray-50',
                      'hover:opacity-80'
                    )}
                    style={{ backgroundColor: cell.color }}
                    title={`${row.bureau} - ${cell.month}: ${formatValue(cell.value)}`}
                  >
                    <span className={cn(cell.value > maxValue * 0.5 ? 'text-white' : darkMode ? 'text-slate-300' : 'text-gray-800')}>
                      {formatValue(cell.value)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

